# capp

> Uber-simple CouchApp deployment in Node.js.

## Installation

```bash
$ npm install -g capp
```

## Usage

```bash

Usage: capp [command] [path, uri]

Commands:
  init                Scaffold a quick CouchApp in the current working directory.
  push [path] [uri]   Push a CouchApp to a database.

```

## Why another CouchApp tool?

There are plenty of really awesome CouchApp tools out there, and in fact, they
may very well be better suited for your needs than **capp**. My motivation in writing
this module primarily comes down to two things: First, I wanted a tool that's written in Node
and managed by npm. Second, I wanted a tool which won't tie my CouchApps to a particularly
rigid directory structure. **capp** has one restriction: your app should contain a file named
`_design.js` in the root of your app directory, which exports your design document exactly
as you want it to be stored (apart from attachments). All the remaining files (except those whose
name begin with an underscore) will be loaded onto your design document by name as attachments.

This type of simplicity is my goal with **capp**, and if you have any suggestions for making
this an even simpler process, I'd love to hear it!

## Contributing

Want to help me make this thing awesome? Great! Please make your changes on a 
separate branch whose name reflects your changes, push them to your fork, and open a pull request!
I haven't defined a formal styleguide, so please take care to maintain the existing coding style.

## License

Copyright (c) 2014 Nick Thompson

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
