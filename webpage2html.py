#!/usr/bin/env python2

import os, sys, re, base64, httplib, urlparse, urllib2, urllib, datetime
from bs4 import BeautifulSoup
import lxml

re_css_url = re.compile('(url\(.*?\))')

try:
    from termcolor import colored
except:
    def colored(text, color=None, on_color=None, attrs=None):
        return text

def log(s, color = None, on_color = None, attrs = None, new_line = True):
    if not color:
        print >> sys.stderr, str(s),
    else:
        print >> sys.stderr, colored(str(s), color, on_color, attrs),
    if new_line:
        sys.stderr.write('\n')
    sys.stderr.flush()

def absurl(index, relpath = ''):
    if index.lower().startswith('http') or (relpath and relpath.startswith('http')):
        new = urlparse.urlparse(urlparse.urljoin(index, relpath))
        return urlparse.urlunsplit((new.scheme, (new.port == None) and new.hostname or new.netloc, new.path, new.query, ''))
    else:
        return os.path.normpath(os.path.join(os.path.dirname(index), relpath))

def get(index, relpath = None, verbose = True):
    if index.startswith('http') or (relpath and relpath.startswith('http')):
        fullpath = absurl(index, relpath)
        if not fullpath:
            log('[ WARN ] invalid path, %s %s' % (index, relpath), 'yellow')
            return ''
        # urllib2 only accepts valid url, the following code is taken from urllib
        # http://svn.python.org/view/python/trunk/Lib/urllib.py?r1=71780&r2=71779&pathrev=71780
        fullpath = urllib.quote(fullpath, safe="%/:=&?~#+!$,;'@()*[]")
        request = urllib2.Request(fullpath)
        request.add_header('User-Agent', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)')
        try:
            response = urllib2.urlopen(request)
            if verbose:
                log('[ GET ] 200 - %s' % fullpath)
            return response.read()
        except urllib2.HTTPError, err:
            if verbose:
                log('[ WARN ] %d - %s %s' % (err.code, fullpath, err.reason), 'yellow')
            return ''
        except urllib2.URLError, err:
            if verbose:
                log('[ WARN ] URLError - %s %s' % (fullpath, err.reason), 'yellow')
            return ''
            
    elif os.path.exists(index):
        if relpath:
            if os.path.exists(relpath):
                fullpath = relpath
            else:
                fullpath = os.path.normpath(os.path.join(os.path.dirname(index), relpath))
            try:
                ret = open(fullpath).read()
                if verbose: log('[ LOCAL ] found - %s' % fullpath)
                return ret
            except IOError, err:
                if verbose: log('[ WARN ] file not found - %s %s' % (fullpath, str(err)), 'yellow')
                return ''
        else:
            try:
                ret = open(index).read()
                if verbose: log('[ LOCAL ] found - %s' % index)
                return ret
            except IOError, err:
                if verbose: log('[ WARN ] file not found - %s %s' % (index, str(err)), 'yellow')
                return ''
    else:
        if verbose: log('[ ERROR ] invalid index - %s' % index, 'red')
        return ''

def image_to_base64(index, src):
    # doc here: http://en.wikipedia.org/wiki/Data_URI_scheme
    if src.strip().startswith('data:'):
        return src
    if src.lower().endswith('png'):
        fmt = 'png'
    elif src.lower().endswith('gif'):
        fmt = 'gif'
    elif src.lower().endswith('jpg') or src.lower().endswith('jpeg'):
        fmt = 'jpg'
    else:
        fmt = 'png'
    data = get(index, src)
    if data:
        return ('data:image/%s;base64,' % fmt) + base64.b64encode(data)
    else:
        return src

def handle_css_content(index, css):
    if not css:
        return css
    # Watch out! how to handle urls which contain parentheses inside? Oh god, css does not support such kind of urls
    # I tested such url in css, and, unfortunately, the css rule is broken. LOL!
    # I have to say that, CSS is awesome!
    reg = re.compile(r'url\s*\((.+?)\)')
    def repl(matchobj):
        src = matchobj.group(1).strip(' \'"')
        if src.lower().endswith('woff') or src.lower().endswith('ttf') or src.lower().endswith('otf') or src.lower().endswith('eot'):
            # dont handle font data uri currently
            return 'url(' + src + ')'
        return 'url(' + image_to_base64(index, src) + ')'
    css = reg.sub(repl, css)
    return css

def generate(index, verbose = True, comment = True):
    '''
    given a index url such as http://www.google.com, http://custom.domain/index.html
    return generated single html 
    '''
    html_doc = get(index, verbose = verbose)

    # now build the dom tree
    soup = BeautifulSoup(html_doc, 'lxml')
    for link in soup('link'):
        if link.get('href') and (link.get('type') == 'text/css' or link['href'].lower().endswith('.css') or 'stylesheet' in (link.get('rel') or [])):
            # skip css hosted by google
            if link['href'].lower().startswith('http://fonts.googleapis.com'): continue
            new_type = 'text/css' if not link.has_attr('type') or not link['type'] else link['type']
            css = soup.new_tag('style', type = new_type)
            new_css_content = handle_css_content(absurl(index, link['href']), get(index, relpath = link['href'], verbose = verbose))
            if False: # new_css_content.find('@font-face') > -1 or new_css_content.find('@FONT-FACE') > -1:
                link['href'] = 'data:text/css;base64,' + base64.b64encode(new_css_content)
            else:
                css.string = new_css_content
                link.replace_with(css)
    for js in soup('script'):
        if not js.has_attr('src') or not js['src']:
            continue
        new_type = 'text/javascript' if not js.has_attr('type') or not js['type'] else js['type']
        code = soup.new_tag('script', type=new_type)
        try:
            js_str = get(index, relpath = js['src'], verbose = verbose)
            if js_str.find('</script>') > -1:
                code['src'] = 'data:text/javascript;base64,' + base64.b64encode(js_str)
            elif js_str.find(']]>') < 0:
                code.string = '<!--//--><![CDATA[//><!--\n' + js_str + '\n//--><!]]>'
            else:
                # replace ]]> does not work at all for chrome, do not believe 
                # http://en.wikipedia.org/wiki/CDATA
                # code.string = '<![CDATA[\n' + js_str.replace(']]>', ']]]]><![CDATA[>') + '\n]]>'
                code.string = js_str
        except:
            log(repr(js_str))
            raise
        #print >> sys.stderr, js is None, code is None, type(js), type(code), len(code.string)
        js.replace_with(code)
    for img in soup('img'):
        if not img.has_attr('src') or not img['src']: continue
        img['src'] = image_to_base64(index, img['src'])
        def check_alt(attr):
            if img.has_attr(attr) and img[attr].startswith('this.src='):
                # we do not handle this situation yet, just warn the user
                if verbose: log('[ WARN ] %s found in img tag and unhandled, which may break page' % (attr), 'yellow')
        check_alt('onerror')
        check_alt('onmouseover')
        check_alt('onmouseout')
    for tag in soup(True):
        if tag.has_attr('style'):
            if tag['style']:
                tag['style'] = handle_css_content(index, tag['style'])
        elif tag.name == 'link' and tag.has_attr('type') and tag['type'] == 'text/css':
            if tag.string:
                tag.string = handle_css_content(index, tag.string)
        elif tag.name == 'style':
            if tag.string:
                tag.string = handle_css_content(index, tag.string)

    # finally insert some info into comments
    if comment:
        for html in soup('html'):
            html.insert(0, BeautifulSoup('<!-- \n single html processed by https://github.com/zTrix/webpage2html\n url: %s\n date: %s\n-->' % (index, datetime.datetime.now().ctime())))
            break
    return soup.prettify(formatter='html')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'usage: %s <saved html file, there should be a xxx_files directory besides>|<webpage url>' % sys.argv[0]
        sys.exit(10)
    sys.stdout.write(generate(sys.argv[1]).encode('utf8'))

