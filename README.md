# mono-module-starter

Mono module starter for [Mono](https://github.com/terrajs/mono).

## Installation

```bash
git clone --depth 1 git@github.com:terrajs/mono-module-starter.git mono-module-x
cd mono-module-x/
npm install
```

You need also to remove the git history and start a new one:

```bash
rm -r .git/
git init
```

> :warning: When done, remove the section above and edit the section below (replace: `org-x` and `mono-module-x` by your GitHub username/org and module name)

# mono-x

[Mono](https://github.com/terrajs/mono) module for X.

[![npm version](https://img.shields.io/npm/v/mono-module-x.svg)](https://www.npmjs.com/package/mono-module-x)
[![Travis](https://img.shields.io/travis/org-x/mono-module-x/master.svg)](https://travis-ci.org/org-x/mono-module-x)
[![Coverage](https://img.shields.io/codecov/c/github/org-x/mono-module-x/master.svg)](https://codecov.io/gh/org-x/mono-module-x.js)
[![license](https://img.shields.io/github/license/org-x/mono-module-x.svg)](https://github.com/org-x/mono-module-x/blob/master/LICENSE)

## Installation

```bash
npm install --save mono-module-x
```

Then, in your configuration file of your Mono application (example: `conf/application.js`):

```js
module.exports = {
  mono: {
    modules: ['mono-module-x']
  }
}
```

## Configuration

`mono-module-x` will use the `x` property of your configuration (example: `conf/development.js`):

```js
module.exports = {
  x: {
    /* Your module options */
  }
}
```

## Usage

In your `src/` files, you can access `x` like this:

```js
const { x } = require('mono-module-x')

x.method(...)
```
