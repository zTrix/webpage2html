
# Webpage2html

## Webpage2html: Save web page to a single html file

This is a simple script to save a web page to a single html file. Yes, not mhtml or pdf staff, no xxx_files directory, just one single editable html file.

The basic idea to achive this goal is to insert all css/javascript files into html directly, and use base64 data URI for image data.

## Usage

save webpage directly from url:

    $ python webpage2html.py http://www.google.com > google.html

or save webpage first using browsers such as chrome, to something.html with something_files directory beside.

    $ python /path/to/something.html > something_single.html

