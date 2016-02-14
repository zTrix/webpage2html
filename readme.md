
# Webpage2html

[![Build Status](https://travis-ci.org/zTrix/webpage2html.png)](https://travis-ci.org/zTrix/webpage2html)

## Webpage2html: Save web page to a single html file

This is a simple script to save a web page to a single html file. No mhtml or pdf stuff, no xxx_files directory, just one single readable and editable html file.

The basic idea is to insert all css/javascript files into html directly, and use base64 data URI for image data.

## Usage and Example

save webpage directly from url(**recommended** way):

```bash
$ python2 webpage2html.py http://www.google.com > google.html
```

or save webpage first using browsers such as chrome, to something.html with something_files directory beside.

```bash
$ python2 webpage2html.py /path/to/something.html > something_single.html
```

But note that, the second method may not always work as expected, because there may be urls like `//ssl.gstatic.com/gb/images/v1_c69d5271.png` (from google index page), but the file is missing in `Google_files` directory saved by browsers.

Enable javascript, for example, save 2048 game page into a single html for offline playing

```bash
$ python2 webpage2html.py -s http://gabrielecirulli.github.io/2048/ > 2048.html
```

## Dependency

BeautifulSoup4, lxml, termcolor(optional)

```bash
$ pip install -r requirements.txt
```

or install them manually

```bash
$ pip install lxml BeautifulSoup4 requests termcolor
```

I have tried the default `HTMLParser` and `html5lib` as the backend parser for BeautifulSoup, but both of them are buggy, `HTMLParser` handles self closing tags (like `<br>` `<meta>`) incorrectly(it will wait for closing tag for `<br>`, so If too many `<br>` tags exist in the html, BeautifulSoup will complain `RuntimeError: maximum recursion depth exceeded`), and `html5lib` will encode encoded html entities such as `&lt;` again to `&amp;lt;`, which is definitly unacceptable. I have tested many cases, and `lxml` works perfectly, so I choose to use `lxml` now.

The `termcolor` package is for colored log output support if you like.

# Thanks

 1. Thanks lukin.a.i who submitted patch to fix not recognised css link (rel=stylesheet) issue

# Reference

 1. Java port of this project. https://github.com/cedricblondeau/webpage2html-java
