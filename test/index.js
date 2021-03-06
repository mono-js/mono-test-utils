const test = require('ava')
const { join } = require('path')

const utils = require('../')

let ctx

/*
** Start the server
*/
test('Fail mono app with bad port', async (t) => {
	const error = await t.throws(utils.start(join(__dirname, 'fixtures/fail/')), Error)
	t.true(error.stdout.join().includes('Environment: test'))
	t.is(error.message, 'Port 80 requires elevated privileges')
})
test('start(dir, { env: "development" })', async (t) => {
	const { server, app, conf } = await utils.start(join(__dirname, 'fixtures/example/'), { env: 'development' })
	t.is(conf.env, 'development')
	t.is(app.get('env'), 'development')
	t.is(conf.mono.http.port, 5555)
	await utils.stop(server)
})
test('Start mono app (env: test)', async (t) => {
	ctx = await utils.start(join(__dirname, 'fixtures/example/'))
	t.is(ctx.conf.mono.http.port, 5678)
})

/*
** url(path)
*/
test('url()', async (t) => {
	const url = await utils.url()
	t.is(url, 'http://localhost:5678/')
})
test('url("/test")', async (t) => {
	const url = await utils.url('/test')
	t.is(url, 'http://localhost:5678/test')
})
test('url("https://www.google.com")', async (t) => {
	const url = await utils.url('https://www.google.com')
	t.is(url, 'https://www.google.com')
})

/*
** stdMock() and stdRestore()
*/
test('stdMock() and stdRestore()', async (t) => {
	utils.stdMock()
	console.log('log test') // eslint-disable-line no-console
	console.error('log error') // eslint-disable-line no-console
	const { stdout, stderr } = utils.stdRestore()
	t.deepEqual(stdout, ['log test\n'])
	t.deepEqual(stderr, ['log error\n'])
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

test.after('Stop mono server', async () => {
	await utils.stop(ctx.server)
})
