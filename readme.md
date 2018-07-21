
# Webpage2html

[![Build Status](https://travis-ci.org/zTrix/webpage2html.png)](https://travis-ci.org/zTrix/webpage2html)

## Webpage2html: Save web page to a single html file

This is a simple script to save a web page to a single html file. No mhtml or pdf stuff, no xxx_files directory, just one single readable and editable html file.

The basic idea is to insert all css/javascript files into html directly, and use base64 data URI for image data.

## Usage and Example

Save web page directly from url (**recommended** way):

```bash
$ python webpage2html.py https://www.google.com > google.html
```

or save web page first using browsers such as Chrome, to something.html with something_files directory beside.

```bash
$ python webpage2html.py /path/to/something.html > something_single.html
```

But note that the second method may not always work as expected, because there may be urls like `//ssl.gstatic.com/gb/images/v1_c69d5271.png` (from google index page), but the file is missing in `Google_files` directory saved by browsers.

Enable javascript, for example, save 2048 game page into a single html for offline playing

```bash
$ python webpage2html.py -s http://gabrielecirulli.github.io/2048/ > 2048.html
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

## Unsupported Cases

### browser side less compiling

The page embeds less css directly and use less.js to compile in browser. In this case, I still cannot find a way to embed the less code into generated html to make it work.

```
<link rel="stylesheet/less" type="text/css" href="http://dghubble.com/blog/theme/css/style.less">
<script src="http://dghubble.com/blog/theme/js/less-1.5.0.min.js" type="text/javascript"></script>
```

 - http://lesscss.org/#client-side-usage
 - http://dghubble.com/blog/posts/.bashprofile-.profile-and-.bashrc-conventions/

### srcset attribute in img tag (html5)

Currently srcset is discarded.

# Contributors

 1. lukin.a.i submitted a patch to fix not recognised css link (rel=stylesheet) issue
 1. [Gruber](https://github.com/GlassGruber).
 1. Java port of this project. https://github.com/cedricblondeau/webpage2html-java
 1. [https://github.com/presto8](https://github.com/presto8)

# License

[webpage2html] use [SATA License](LICENSE.txt) (Star And Thank Author License), so you have to star this project before using. Read the [license](LICENSE.txt) carefully.

[webpage2html]:https://github.com/zTrix/webpage2html


