#!/usr/bin/env python2

from distutils.core import setup
from setuptools import find_packages

setup(
    name='webpage2html',
    version='0.3.0',

    author='Wenlei Zhu',
    author_email='i@ztrix.me',
    url='https://github.com/zTrix/webpage2html',

    license='LICENSE.txt',
    keywords="webpage html convert",
    description='Save/convert web pages to a single editable html file',
    long_description=open('README.txt').read(),

    py_modules = ['webpage2html'],

    # Refers to test/test.py
    test_suite='test.test',

    entry_points = {
        'console_scripts': [
            'webpage2html=webpage2html:main'
        ]
    },
    classifiers = [
        'Development Status :: 5 - Production/Stable',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'Operating System :: POSIX',
        'Operating System :: MacOS :: MacOS X',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Topic :: Software Development',
        'Topic :: System',
        'Topic :: Terminals',
        'Topic :: Utilities',
    ],
)
