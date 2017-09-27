const { join } = require('path')
const rp = require('request-promise-native')
const stdMocks = require('std-mocks')

let port = 8000

exports.start = async (dir) => {
	stdMocks.use()
	// Set env to 'test'
	process.env.NODE_ENV = 'test'
	const mono = require('@terrajs/mono')
	// Start mono
	const { app, server, conf } = await mono(dir)
	port = conf.mono.http.port
	// Flush logs output
	const { stdout, stderr } = stdMocks.flush()
	stdMocks.restore()
	return { conf, app, server, stdout, stderr }
}

exports.close = (server) => {
	if (!server) throw new Error('No server provided to close(server)')
	return new Promise((resolve, reject) => {
		server.close.call(server, (err) => {
			/* istanbul ignore if */
			if (err) return reject(err)
			resolve()
		})
	})
}

const url = (path) => `http://localhost:${port}` + join('/', (path || ''))

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
	stdMocks.use()
	// Call API & check response
	let res = null
	let err = null
	try {
		res = await apiCall
	} catch (error) {
		err = error
	}
	// Get logs ouput & check logs
	const { stdout, stderr } = stdMocks.flush()
	// Restore logs output
	stdMocks.restore()
	// Return err, res and output
	const body = (err ? err.response.body : res.body)
	const statusCode = (err ? err.statusCode : res.statusCode)
	const headers = (err ? err.response.headers : res.headers)
	return { statusCode, headers, body, stdout, stderr }
}
