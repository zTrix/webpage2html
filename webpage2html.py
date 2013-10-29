#!/usr/bin/env python2

import os, sys, requests, re, base64, httplib, urlparse, urllib2
from bs4 import BeautifulSoup

re_css_url = re.compile('(url\(.*?\))')

def get(index, relpath = None):
    print >> sys.stderr, index, relpath
    if index.startswith('http') or (relpath and relpath.startswith('http')):
        parsed_url = urlparse.urlparse(index)
        fullpath = index
        if relpath:
            if relpath.startswith('/'):
                fullpath = '%s://%s/%s' % (parsed_url.scheme, parsed_url.netloc, relpath)
            elif relpath.startswith('http'):
                fullpath = relpath
            else:
                fullpath = os.path.join(index, relpath)
        request = urllib2.Request(fullpath)
        request.add_header('User-Agent', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)')
        response = urllib2.urlopen(request)
        return response.read()
    elif os.path.exists(index):
        if relpath:
            return open(relpath).read()
        else:
            return open(index).read()
    else:
        raise Exception('cannot get web content for %s', index)

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
    return ('data:image/%s;base64,' % fmt) + base64.b64encode(get(index, src))

def handle_css_content(index, css):
    if not css:
        return css
    # Watch out! how to handle urls which contain parentheses inside? Oh god, css does not support such kind of urls
    # I tested such url in css, and, unfortunately, the css rule is broken. LOL!
    # I have to say that, CSS is awesome!
    reg = re.compile(r'url\s*\((.+?)\)')
    def repl(matchobj):
        src = matchobj.group(1).strip(' \'"')
        return 'url(' + image_to_base64(index, src) + ')'
    css = reg.sub(repl, css)
    return css

def generate(index):
    html_doc = get(index)
    # since BeautifulSoup will handle unclosed tags like <meta> and <link>, add a closing tag which we don't need
    # we should add the closing tag first by ourselves.
    def repl(matchobj):
        es = matchobj.group(1)
        if len(es) > 2 and es[-2] != '/':
            return es[:-1] + ' />'
        return es
    html_doc = re.sub(r'(<\s*meta.+?>)', repl, html_doc)
    html_doc = re.sub(r'(<\s*link.+?>)', repl, html_doc)

    # now build the dom tree
    soup = BeautifulSoup(html_doc)
    for link in soup('link'):
        if link.has_attr('type') and link['type'] != 'text/css': continue
        if link.has_attr('href') and link['href'] and link['href'].lower().endswith('.css'):
            new_type = 'text/css' if not link.has_attr('type') or not link['type'] else link['type']
            css = soup.new_tag('style', type = new_type)
            # print >> sys.stderr, link['href']
            css.string = get(index, link['href'])
            #pos = 0
            #while True:
            #    print pos
            #    m = re_css_url.search(css.string, pos)
            #    if not m:
            #        break
            #    print m.group(0), m.start(0), m.end(0)
            #    pos = m.end(0)
            link.replace_with(css)
    for js in soup('script'):
        if not js.has_attr('src') or not js['src']:
            continue
        new_type = 'text/javascript' if not js.has_attr('type') or not js['type'] else js['type']
        code = soup.new_tag('script', type=new_type)
        try:
            js_str = get(index, js['src'])
            code.string = js_str
        except:
            print >> sys.stderr, repr(js_str)
            raise
        #print >> sys.stderr, js is None, code is None, type(js), type(code), len(code.string)
        js.replace_with(code)
    for img in soup('img'):
        if not img.has_attr('src') or not img['src']: continue
        img['src'] = image_to_base64(index, img['src'])
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
    return soup.prettify(formatter='html')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'usage: %s <saved html>|<index url>' % sys.argv[0]
        sys.exit(10)
    if os.path.dirname(sys.argv[1]) and os.path.exists(sys.argv[1]):
        os.chdir(os.path.dirname(sys.argv[1]))
    sys.stdout.write(generate(sys.argv[1]).encode('utf8'))

