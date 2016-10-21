#!/usr/bin/env python2
# -*- coding: utf-8 -*-

import os, sys, re, base64, urlparse, urllib2, urllib, datetime
from bs4 import BeautifulSoup
import lxml
import requests
import argparse

re_css_url = re.compile('(url\(.*?\))')

try:
    from termcolor import colored
except:
    def colored(text, color=None, on_color=None, attrs=None):
        return text


def log(s, color=None, on_color=None, attrs=None, new_line=True):
    if not color:
        print >> sys.stderr, str(s),
    else:
        print >> sys.stderr, colored(str(s), color, on_color, attrs),
    if new_line:
        sys.stderr.write('\n')
    sys.stderr.flush()


def absurl(index, relpath='', normpath=os.path.normpath):
    if index.lower().startswith('http') or (relpath and relpath.startswith('http')):
        new = urlparse.urlparse(urlparse.urljoin(index, relpath))
        return urlparse.urlunsplit(
            (new.scheme, (new.port == None) and new.hostname or new.netloc, normpath(new.path), new.query, ''))
    else:
        return os.path.normpath(os.path.join(os.path.dirname(index), relpath))


webpage2html_cache = {}


def get(index, relpath=None, verbose=True, usecache=True, verify=True):
    global webpage2html_cache
    if index.startswith('http') or (relpath and relpath.startswith('http')):
        fullpath = absurl(index, relpath)
        if not fullpath:
            if verbose: log('[ WARN ] invalid path, %s %s' % (index, relpath), 'yellow')
            return '', None
        # urllib2 only accepts valid url, the following code is taken from urllib
        # http://svn.python.org/view/python/trunk/Lib/urllib.py?r1=71780&r2=71779&pathrev=71780
        fullpath = urllib.quote(fullpath, safe="%/:=&?~#+!$,;'@()*[]")
        if usecache:
            if fullpath in webpage2html_cache:
                if verbose: log('[ CACHE HIT ] - %s' % fullpath)
                return webpage2html_cache[fullpath], None
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)'
        }
        try:
            response = requests.get(fullpath, headers=headers, verify=verify)
            if verbose: log('[ GET ] %d - %s' % (response.status_code, response.url))
            if response.status_code >= 400 or response.status_code < 200:
                content = ''
            # elif response.headers.get('content-type', '').lower().startswith('text/'):
            #     content = response.text
            else:
                content = response.content
            if usecache:
                webpage2html_cache[response.url] = content
            return content, response.url
        except Exception as ex:
            if verbose: log('[ WARN ] %s - %s %s' % ('???', fullpath, ex), 'yellow')
            return '', None

    elif os.path.exists(index):
        if relpath:
            if os.path.exists(relpath):
                fullpath = relpath
            else:
                fullpath = os.path.normpath(os.path.join(os.path.dirname(index), relpath))
            try:
                ret = open(fullpath).read()
                if verbose: log('[ LOCAL ] found - %s' % fullpath)
                return ret, None
            except IOError, err:
                if verbose: log('[ WARN ] file not found - %s %s' % (fullpath, str(err)), 'yellow')
                return '', None
        else:
            try:
                ret = open(index).read()
                if verbose: log('[ LOCAL ] found - %s' % index)
                return ret, None
            except IOError, err:
                if verbose: log('[ WARN ] file not found - %s %s' % (index, str(err)), 'yellow')
                return '', None
    else:
        if verbose: log('[ ERROR ] invalid index - %s' % index, 'red')
        return '', None


def data_to_base64(index, src, verbose=True):
    # doc here: http://en.wikipedia.org/wiki/Data_URI_scheme
    sp = urlparse.urlparse(src).path
    if src.strip().startswith('data:'):
        return src
    if sp.lower().endswith('png'):
        fmt = 'image/png'
    elif sp.lower().endswith('gif'):
        fmt = 'image/gif'
    elif sp.lower().endswith('jpg') or src.lower().endswith('jpeg'):
        fmt = 'image/jpg'
    elif sp.lower().endswith('svg'):
        fmt = 'image/svg+xml'
    elif sp.lower().endswith('ttf'):
        fmt = 'application/x-font-ttf'
    elif sp.lower().endswith('otf'):
        fmt = 'application/x-font-opentype'
    elif sp.lower().endswith('woff'):
        fmt = 'application/font-woff'
    elif sp.lower().endswith('woff2'):
        fmt = 'application/font-woff2'
    elif sp.lower().endswith('eot'):
        fmt = 'application/vnd.ms-fontobject'
    elif sp.lower().endswith('sfnt'):
        fmt = 'application/font-sfnt'
    else:
        # what if it's not a valid font type? may not matter
        fmt = 'image/png'
    data, _ = get(index, src, verbose=verbose)
    if data:
        return ('data:%s;base64,' % fmt) + base64.b64encode(data)
    else:
        return src


css_encoding_re = re.compile(r'''@charset\s+["']([-_a-zA-Z0-9]+)["']\;''', re.I)


def handle_css_content(index, css, verbose=True):
    if not css:
        return css
    if not isinstance(css, unicode):
        mo = css_encoding_re.search(css)
        if mo:
            try:
                css = css.decode(mo.group(1))
            except:
                log('[ WARN ] failed to convert css to encoding %s' % mo.group(1), 'yellow')
    # Watch out! how to handle urls which contain parentheses inside? Oh god, css does not support such kind of urls
    # I tested such url in css, and, unfortunately, the css rule is broken. LOL!
    # I have to say that, CSS is awesome!
    reg = re.compile(r'url\s*\((.+?)\)')

    def repl(matchobj):
        src = matchobj.group(1).strip(' \'"')
        # if src.lower().endswith('woff') or src.lower().endswith('ttf') or src.lower().endswith('otf') or src.lower().endswith('eot'):
        #     # dont handle font data uri currently
        #     return 'url(' + src + ')'
        return 'url(' + data_to_base64(index, src, verbose=verbose) + ')'

    css = reg.sub(repl, css)
    return css


def generate(index, verbose=True, comment=True, keep_script=False, prettify=False, full_url=True, verify=True):
    '''
    given a index url such as http://www.google.com, http://custom.domain/index.html
    return generated single html
    '''
    origin_index = index
    html_doc, new_index = get(index, verbose=verbose, verify=verify)

    if new_index: index = new_index

    # now build the dom tree
    soup = BeautifulSoup(html_doc, 'lxml')
    for link in soup('link'):
        if link.get('href'):
            if (link.get('type') == 'text/css' or link['href'].lower().endswith('.css') or 'stylesheet' in (
                link.get('rel') or [])):
                # skip css hosted by google
                # if link['href'].lower().startswith('http://fonts.googleapis.com'): continue
                new_type = 'text/css' if not link.get('type') else link['type']
                css = soup.new_tag('style', type=new_type)
                css['data-href'] = link['href']
                css_data, _ = get(index, relpath=link['href'], verbose=verbose)
                new_css_content = handle_css_content(absurl(index, link['href']), css_data, verbose=verbose)
                if False:  # new_css_content.find('@font-face') > -1 or new_css_content.find('@FONT-FACE') > -1:
                    link['href'] = 'data:text/css;base64,' + base64.b64encode(new_css_content)
                else:
                    css.string = new_css_content
                    link.replace_with(css)
            elif full_url:
                link['data-href'] = link['href']
                link['href'] = absurl(index, link['href'])
    for js in soup('script'):
        if not keep_script:
            js.replace_with('')
            continue
        if not js.get('src'): continue
        new_type = 'text/javascript' if not js.has_attr('type') or not js['type'] else js['type']
        code = soup.new_tag('script', type=new_type)
        code['data-src'] = js['src']
        try:
            js_str, _ = get(index, relpath=js['src'], verbose=verbose)
            if js_str.find('</script>') > -1:
                code['src'] = 'data:text/javascript;base64,' + base64.b64encode(js_str)
            elif js_str.find(']]>') < 0:
                code.string = '<!--//--><![CDATA[//><!--\n' + js_str + '\n//--><!]]>'
            else:
                # replace ]]> does not work at all for chrome, do not believe
                # http://en.wikipedia.org/wiki/CDATA
                # code.string = '<![CDATA[\n' + js_str.replace(']]>', ']]]]><![CDATA[>') + '\n]]>'
                code.string = js_str.encode('utf-8')
        except:
            if verbose: log(repr(js_str))
            raise
        # print >> sys.stderr, js is None, code is None, type(js), type(code), len(code.string)
        js.replace_with(code)
    for img in soup('img'):
        if not img.get('src'): continue
        img['data-src'] = img['src']
        img['src'] = data_to_base64(index, img['src'], verbose=verbose)

        def check_alt(attr):
            if img.has_attr(attr) and img[attr].startswith('this.src='):
                # we do not handle this situation yet, just warn the user
                if verbose: log('[ WARN ] %s found in img tag and unhandled, which may break page' % (attr), 'yellow')

        check_alt('onerror')
        check_alt('onmouseover')
        check_alt('onmouseout')
    for tag in soup(True):
        if full_url and tag.name == 'a' and tag.has_attr('href') and not tag['href'].startswith('#'):
            tag['data-href'] = tag['href']
            tag['href'] = absurl(index, tag['href'])
        if tag.has_attr('style'):
            if tag['style']:
                tag['style'] = handle_css_content(index, tag['style'], verbose=verbose)
        elif tag.name == 'link' and tag.has_attr('type') and tag['type'] == 'text/css':
            if tag.string:
                tag.string = handle_css_content(index, tag.string, verbose=verbose)
        elif tag.name == 'style':
            if tag.string:
                tag.string = handle_css_content(index, tag.string, verbose=verbose)

    # finally insert some info into comments
    if comment:
        for html in soup('html'):
            html.insert(0, BeautifulSoup(
                '<!-- \n single html processed by https://github.com/zTrix/webpage2html\n url: %s\n date: %s\n-->' % (
                index, datetime.datetime.now().ctime()), 'lxml'))
            break
    if prettify:
        return soup.prettify(formatter='html')
    else:
        return str(soup)


def usage():
    print("""
usage:

    $ webpage2html [options] some_url

options:

    -h, --help              help page, you are reading this now!
    -q, --quite             don't show verbose url get log in stderr
    -s, --script            keep javascript in the generated html

examples:

    $ webpage2html -h
        you are reading this help message

    $ webpage2html http://www.google.com > google.html
        save google index page for offline reading, keep style untainted

    $ webpage2html -s http://gabrielecirulli.github.io/2048/ > 2048.html
        save dynamic page with Javascript example
        the 2048 game can be played offline after being saved

    $ webpage2html /path/to/xxx.html > xxx_single.html
        combine local saved xxx.html with a directory named xxx_files together into a single html file
""")


def main():
    kwargs = {}
    parser = argparse.ArgumentParser()
    parser.add_argument('-q', '--quite', action='store_true', help="don't show verbose url get log in stderr")
    parser.add_argument('-s', '--script', action='store_true', help="keep javascript in the generated html ")
    parser.add_argument('-k', '--insecure', action='store_true', help="ignore the certificate")
    parser.add_argument("url", help="the website to store")
    args = parser.parse_args()
    if args.quite:
        kwargs['verbose'] = False
    if args.script:
        kwargs['keep_script'] = True
    if args.insecure:
        kwargs['verify'] = False
    rs = generate(args.url, **kwargs)
    sys.stdout.write(rs)

if __name__ == '__main__':
    main()

