#!/usr/bin/env python2

import os, sys, requests, re, base64
from bs4 import BeautifulSoup

re_css_url = re.compile('(url\(.*?\))')

def get(base, relpath = None):
    if base.startswith('http'):
        raise Exception('Not implemented')
    elif os.path.exists(base):
        if relpath:
            return open(relpath).read()
        else:
            return open(base).read()
    else:
        raise Exception('cannot get web content for %s', base)

def generate(base):
    html_doc = get(base)
    soup = BeautifulSoup(html_doc)
    for link in soup('link', type='text/css'):
        if link['href']:
            css = soup.new_tag('style', type = 'text/css')
            css.string = get(base, link['href'])
            #pos = 0
            #while True:
            #    print pos
            #    m = re_css_url.search(css.string, pos)
            #    if not m:
            #        break
            #    print m.group(0), m.start(0), m.end(0)
            #    pos = m.end(0)
            link.replace_with(css)
    for js in soup('script', type='text/javascript'):
        if 'src' not in js or not js['src']:
            continue
        code = soup.new_tag('script', type='text/javascript')
        code.string = get(base, js['src'])
        js.repace_with(code)
    for img in soup('img'):
        if not img['src']: continue
        src = img['src']
        if src.lower().endswith('png'):
            fmt = 'png'
        elif src.lower().endswith('gif'):
            fmt = 'gif'
        elif src.lower().endswith('jpg') or src.lower().endswith('jpeg'):
            fmt = 'jpg'
        else:
            fmt = 'png'
        img['src'] = ('data:image/%s;base64,' % fmt) + base64.b64encode(get(base, src))
    return soup.prettify(formatter='html')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print 'usage: %s <input html>' % sys.argv[0]
        sys.exit(10)
    sys.stdout.write(generate(sys.argv[1]).encode('utf8'))

