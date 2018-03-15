from __future__ import print_function

import os
import sys
import unittest

import webpage2html


class Test(unittest.TestCase):
    def test_none(self):
        print('')
        self.assertEqual(webpage2html.generate('non-existing-file.html', comment=False, verbose=False), '')

    def test_pre_formatting(self):
        print('')
        gen = webpage2html.generate('./test_pre_formatting.html', comment=False)
        assert '<pre><code>$ git clone https://github.com/chaitin/sqlchop</code></pre>' in gen

    def test_0ops(self):
        print('')
        gen = webpage2html.generate('./hacklu-ctf-2013-exp400-wannable-0ops.html', comment=False)
        print(gen)
        assert '<style data-href="./hacklu-ctf-2013-exp400-wannable-0ops_files/screen.css" media="screen, projection" rel="stylesheet" type="text/css">html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt' in gen

    def test_no_script(self):
        print('')
        gen = webpage2html.generate('./test_no_script.html', comment=False, keep_script=False)
        assert '<script' not in gen, gen

    def test_full_url(self):
        print('')
        gen = webpage2html.generate('./another_dir/test_full_url.html', comment=False, full_url=True)
        assert 'href="another_dir/questions/110240"' in gen or 'href="./another_dir/questions/110240"' in gen, gen
        assert 'href="another_dir/static/img/favicon.ico"' in gen or 'href="./another_dir/static/img/favicon.ico"' in gen, gen

    def test_web_font(self):
        print('')
        gen = webpage2html.generate('./webfont.html', comment=False, full_url=True)
        # FIXME: do not cover all web fonts with hash postfix
        assert 'application/x-font-ttf' in gen and 'application/font-woff' in gen, gen

    def test_text_css(self):
        print('')
        gen = webpage2html.generate('./text_css.html', comment=False, full_url=True)
        assert '<style data-href="./text_css/style.css" rel="stylesheet" type="text/css">@import url(data:text/css;base64,Cmh' in gen

    def test_link_media(self):
        print('')
        gen = webpage2html.generate('./test_css_screen.html', comment=False, full_url=True)
        assert 'media="screen"' in gen

    def test_requests_page(self):
        print('')
        gen = webpage2html.generate('./test_requests_page.html', comment=False, full_url=True)
        assert '<div id="searchbox" role="search" style="display: none">' in gen


if __name__ == '__main__':
    if os.path.dirname(sys.argv[0]):
        os.chdir(os.path.dirname(sys.argv[0]))
    suite = unittest.TestLoader().loadTestsFromTestCase(Test)
    tests = []
    if len(sys.argv) > 1:
        tests.extend(sys.argv[1:])
    if len(tests):
        suite = unittest.TestSuite(map(Test, tests))
    rs = unittest.TextTestRunner(verbosity=2).run(suite)
    if len(rs.errors) > 0 or len(rs.failures) > 0:
        sys.exit(10)
    else:
        sys.exit(0)
