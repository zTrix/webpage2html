#!/usr/bin/env python2

import unittest
import webpage2html

class Test(unittest.TestCase):

    def test_0ops(self):
        self.assertEqual(webpage2html.generate('http://blog.0ops.net/blog/2013/10/29/hack-dot-lu-ctf-2013-exploiting-400-wannabe/').encode('utf8'), open('0ops-wannable.html').read(), 'Test Fail for http://blog.0ops.net/blog/2013/10/29/hack-dot-lu-ctf-2013-exploiting-400-wannabe/')

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(Test)
    unittest.TextTestRunner(verbosity=2).run(suite)
    #unittest.main()
