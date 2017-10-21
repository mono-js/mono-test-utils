# mono-test-utils

Utils for testing your [Mono](https://github.com/terrajs/mono) project.

[![npm version](https://img.shields.io/npm/v/mono-test-utils.svg)](https://www.npmjs.com/package/mono-test-utils)
[![Travis](https://img.shields.io/travis/terrajs/mono-test-utils/master.svg)](https://travis-ci.org/terrajs/mono-test-utils)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono-test-utils/master.svg)](https://codecov.io/gh/terrajs/mono-test-utils)
[![license](https://img.shields.io/github/license/org-x/mono-module-x.svg)](https://github.com/terrajs/mono-test-utils/blob/master/LICENSE)

## Installation

```bash
npm install --save-dev mono-test-utils
```

## Utils

```js
const {
  start, stop,
  url,
  stdMock, stdRestore
  $get, $post, $put, $del
} = require('mono-test-utils')
```

## Contents

- [Start & Stop Mono]()
- [Get Mono url]()
- [Mock stdout and stderr]()
- [Make API calls]()

### Start a Mono project from `dir` directory with `NODE_ENV=test`:

```js
const context = await start(dir, options = {})
// context = { log, conf, app, server, stdout, stderr }
```

Default `options`:

```js
{
  env: 'test',
  monoPath: '@terrajs/mono'
}
```

### Stop Mono server:

```js
await stop(context.server)
```

### Get the url of your mono server:

```js
url()
// http://localhost:8000 (port updates depending of the mono conf)
url('/test')
// http://localhost:8000/test
```
### Mock `stdout` and `stderr`

This is useful for capturing logs (based on [std-mocks](https://github.com/neoziro/std-mocks)).

Example:

```js
// Start mocking stdout and stderr
stdMock()

console.log('test log')
console.error('test error')

const { stdout, stderr } = stdRestore()
// stdout = ['test log\n']
// stderr = ['test error\n']
```

- `stdMock()` will call `stdMocks.use(options)`
- `stdRestore()` will call `stdMocks.restore()` and return `stdMocks.flush()`.

### Make HTTP requests to the API:

```js
await $get(path, options = {})
await $post(path, options = {})
await $put(path, options = {})
await $del(path, options = {}) // alias: `$delete`
```

Also available: `$head`, `$options` and `$patch`

**INFO:** The `options` are the same as [request](https://github.com/request/request).

Every of the following methods return an object with these properties:

```js
{
  statusCode, // HTTP status code
  headers, // Headers sent back
  body, // Body of the response
  stdout, // Logs written on stdout during the request
  stderr // Logs written on stderr during the request
}
```

## Example

Example of `test/index.js` with [ava](https://github.com/avajs/ava):

```js
const test = require('ava')
const { join } = require('path')

const { start, stop, $get, $post } = require('mono-test-utils')

let context

// Start server
test.before('Start Mono app', async (t) => {
  context = await start(join(__dirname, 'fixtures/example/'))
})

// Test API Endpoints
test('Call GET - /example', async (t) => {
  const { stdout, stderr, statusCode, body } = await $get('/example')
  t.true(stdout[0].includes('GET /example'))
  t.is(stderr.length, 0)
  t.is(statusCode, 200)
  // Imagine that GET - /example returns { hello: 'world' }
  t.deepEqual(body.body, { hello: 'world' })
})

test('Call POST - /example', async (t) => {
  const { statusCode, body } = await $post('/example', {
    body: { foo: 'bar' }
  })
  t.is(statusCode, 200)
})

// Close server
test.after('Close Mono server', async (t) => {
  await close(context.server)
})
```
