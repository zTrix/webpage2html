#!/usr/bin/env python2

import os, sys, unittest
import webpage2html

class Test(unittest.TestCase):

    def local_test(self, index):
        print ''
        gen = webpage2html.generate(index).encode('utf8')
        ans = open(index[:-5] + '_single.html', 'rb').read()
        gl = len(gen)
        al = len(ans)
        begin = 0
        while begin < gl and begin < al and ans[begin] == gen[begin]:
            begin += 1
        end = -1
        while end + gl > 0 and end + al > 0 and ans[end] == gen[end] :
            end -= 1
        self.assertEqual(gen, ans, 'Test Fail for %s, begin = %d, end = %d, ans len = %d, gen len = %d, ans = %s\ngen = %s\n' % (index, begin, end, al, gl, repr(ans[begin: end]), repr(gen[begin: end])))

    def test_0ops(self):
        self.local_test('./hacklu-ctf-2013-exp400-wannable-0ops.html')

    def test_meepo_download(self):
        self.local_test('./meepo-download.html')

    def test_packet_storm(self):
        self.local_test('./packet-storm-openssh-backdoor-patch.html')

    def test_none(self):
        print ''
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
