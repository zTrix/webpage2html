#!/usr/bin/env python2

import os, sys, unittest
import webpage2html

class Test(unittest.TestCase):

    def local_test(self, index):
        self.assertEqual(webpage2html.generate(index).encode('utf8'), open(index[:-5] + '_single.html').read(), 'Test Fail for ' + index)

    def test_0ops(self):
        self.local_test('./hacklu-ctf-2013-exp400-wannable-0ops.html')

    def test_meepo_download(self):
        self.local_test('./meepo-download.html')

    def test_none(self):
        self.assertEqual(webpage2html.generate('non-existing-file.html'), '')

if __name__ == '__main__':
    if os.path.dirname(sys.argv[0]):
        os.chdir(os.path.dirname(sys.argv[0]))
    suite = unittest.TestLoader().loadTestsFromTestCase(Test)
    rs = unittest.TextTestRunner(verbosity=2).run(suite)
    if len(rs.errors) > 0 or len(rs.failures) > 0:
        sys.exit(10)
    else:
        sys.exit(0)
