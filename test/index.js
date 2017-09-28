const test = require('ava')
const { join } = require('path')

const utils = require('../')

let ctx

/*
** Start the server
*/
test.before('Start mono app', async (t) => {
	ctx = await utils.start(join(__dirname, 'fixtures/example/'))
})

test('Fail mono app with bad port', async (t) => {
	const error = await t.throws(utils.start(join(__dirname, 'fixtures/fail/')), Error)
	t.true(error.stdout.join().includes('Environment: test'))
	t.is(error.message, 'Port 80 requires elevated privileges')
})
/*
** Test API calls
*/
test('$get', async (t) => {
	const { stdout, stderr, statusCode, body } = await utils.$get('/example')
	t.true(stdout[0].includes('GET /example'))
	t.is(stderr.length, 0)
	t.is(statusCode, 200)
	t.is(body.method, 'GET')
	t.deepEqual(body.body, {})
})
test('$get with 404 path', async (t) => {
	const { statusCode, body } = await utils.$get('/404')
	t.is(statusCode, 404)
	t.is(body.code, 'not-found')
	t.is(body.status, 404)
})
test('$get with no path (default to /)', async (t) => {
	const { stdout, stderr } = await utils.$get()
	t.is(stderr.length, 0)
	t.true(stdout[0].includes('GET /'))
	t.true(stdout[0].includes('404'))
})
test('$post', async (t) => {
	const { stdout, stderr, statusCode, body } = await utils.$post('/example', {
		body: { hello: 'world' }
	})
	t.true(stdout[0].includes('POST /example'))
	t.is(stderr.length, 0)
	t.is(statusCode, 200)
	t.is(body.method, 'POST')
	t.deepEqual(body.body, { hello: 'world' })
})
test('$post with no options', async (t) => {
	const { statusCode, body } = await utils.$post('/example')
	t.is(statusCode, 200)
	t.is(body.method, 'POST')
	t.deepEqual(body.body, {})
})
test('$put', async (t) => {
	const { body } = await utils.$put('/example', {
		body: { hello: 'world' }
	})
	t.is(body.method, 'PUT')
	t.deepEqual(body.body, { hello: 'world' })
})
test('$put with no options', async (t) => {
	const { body } = await utils.$put('/example')
	t.is(body.method, 'PUT')
	t.deepEqual(body.body, {})
})
test('$del', async (t) => {
	const { body } = await utils.$del('/example')
	t.is(body.method, 'DELETE')
	t.deepEqual(body.body, {})
})
test('$delete', async (t) => {
	const { body } = await utils.$delete('/example')
	t.is(body.method, 'DELETE')
	t.deepEqual(body.body, {})
})
test('$patch', async (t) => {
	const { body } = await utils.$patch('/example')
	t.is(body.method, 'PATCH')
	t.deepEqual(body.body, {})
})
test('$options', async (t) => {
	const { body } = await utils.$options('/example')
	t.is(body.method, 'OPTIONS')
	t.deepEqual(body.body, {})
})
test('$head', async (t) => {
	const { statusCode, body } = await utils.$head('/example')
	t.is(statusCode, 200)
	t.falsy(body)
})

test('stop(server) with no server', (t) => {
	const error = t.throws(() => utils.stop(), Error)
	t.is(error.message, 'No server provided to stop(server)')
})

test.after('Stop mono server', async (t) => {
	await utils.stop(ctx.server)
})
