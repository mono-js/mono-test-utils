# mono-test-utils

Utils for testig with [Mono](https://github.com/terrajs/mono).

[![npm version](https://img.shields.io/npm/v/@terrajs/mono-test-utils.svg)](https://www.npmjs.com/package/@terrajs/mono-test-utils)
[![Travis](https://img.shields.io/travis/terrajs/mono-test-utils/master.svg)](https://travis-ci.org/terrajs/mono-test-utils)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono-test-utils/master.svg)](https://codecov.io/gh/terrajs/mono-test-utils)
[![license](https://img.shields.io/github/license/org-x/mono-module-x.svg)](https://github.com/terrajs/mono-test-utils/blob/master/LICENSE)

## Installation

```bash
npm install --save-dev @terrajs/mono-test-utils
```

## Utils

```js
const { start, stop, $get, $post, $put, $del } = require('@terrajs/mono-test-utils')
```

Available methods:

- `await start(dir)`: Start a Mono project from `dir` directory, returns `{ app, server, conf }`
- `await stop(server)`: Stop Mono server

Every of the following methods return an object with useful properties: `{ statusCode, headers, body, stdout, stderr }`.

- `await $get(path, options = {})`
- `await $post(path, options = {})`
- `await $put(path, options = {})`
- `await $del(path, options = {})` (alias: `$delete`)

Also available: `$head`, `$options` and `$patch`

**INFO:** The `options` are the same as [request](https://github.com/request/request).

## Example

Example of `test/index.js` with [ava](https://github.com/avajs/ava):

```js
const test = require('ava')
const { join } = require('path')

const utils = require('../')

let ctx

/*
** Start the server
*/
test.before('Start Mono app', async (t) => {
	ctx = await utils.start(join(__dirname, 'fixtures/example/'))
})

/*
** Test API calls
*/
test('Call GET - /example', async (t) => {
	const { stdout, stderr, statusCode, body } = await utils.$get('/example')
	t.true(stdout[0].includes('GET /example'))
	t.is(stderr.length, 0)
	t.is(statusCode, 200)
  // Imagine that GET - /example returns { hello: 'world' }
	t.deepEqual(body.body, { hello: 'world' })
})

test('Call POST - /example', async (t) => {
	const { statusCode, body } = await utils.$post('/example', {
		body: { foo: 'bar' }
	})
	t.is(statusCode, 200)
})

test.after('Close Mono server', async (t) => {
	await utils.close(ctx.server)
})
```
