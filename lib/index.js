const { join } = require('path')
const rp = require('request-promise-native')
const stdMocks = require('std-mocks')
const enableDestroy = require('server-destroy')
const isAbsoluteUrl = require('is-absolute-url')

let port = 8000

const stdMock = exports.stdMock = () => stdMocks.use()

const stdRestore = exports.stdRestore = () => {
	stdMocks.restore()
	return stdMocks.flush()
}

exports.start = async (dir, options) => {
	// Options
	options = options || {}
	options.monoPath = options.monoPath || 'mono-core'
	options.env = options.env || 'test'
	// Mock stdout & stderr
	stdMocks.use()
	// Set env to 'test'
	process.env.NODE_ENV = options.env
	const mono = require(options.monoPath)
	// Start mono
	let context
	try {
		context = await mono(dir)
	} catch (err) {
		const { stdout, stderr } = stdMocks.flush()
		err.stdout = stdout
		err.stderr = stderr
		stdMocks.restore()
		throw err
	}
	port = context.conf.mono.http.port
	// Enable destroy() on server instance
	enableDestroy(context.server)
	// Flush logs output
	const { stdout, stderr } = stdMocks.flush()
	stdMocks.restore()
	// Mono returns { log, conf, appDir, app, server }
	return Object.assign({}, context, { stdout, stderr })
}

exports.stop = (server) => {
	if (!server) throw new Error('No server provided to stop(server)')
	return new Promise((resolve, reject) => {
		server.destroy((err) => {
			/* istanbul ignore if */
			if (err) return reject(err)
			resolve()
		})
	})
}

const url = (path) => {
	if (typeof path === 'string' && isAbsoluteUrl(path)) return path
	return `http://localhost:${port}` + join('/', (path || ''))
}
exports.url = url

exports.$get = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'GET', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

exports.$post = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'POST', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

exports.$put = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'PUT', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

exports.$patch = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'PATCH', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

exports.$head = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'HEAD', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

exports.$options = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'OPTIONS', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

exports.$delete = exports.$del = (path, options) => {
	options = options || {}
	return wrapLogs(rp({ method: 'DELETE', uri: url(path), resolveWithFullResponse: true, json: true, ...options }))
}

const wrapLogs = async (apiCall) => {
	// Store logs output
	stdMock()
	// Call API & check response
	let res = null
	let err = null
	try {
		res = await apiCall
	} catch (error) {
		err = error
	}
	// Get logs ouput & check logs
	const { stdout, stderr } = stdRestore()
	// Return err, res and output
	const body = (err ? err.response.body : res.body)
	const statusCode = (err ? err.statusCode : res.statusCode)
	const headers = (err ? err.response.headers : res.headers)
	return { statusCode, headers, body, stdout, stderr }
}
