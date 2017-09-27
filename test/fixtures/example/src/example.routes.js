module.exports = [
	{
		method: 'all',
		path: '/example',
		handler(req, res) {
			res.json({
				method: req.method,
				body: req.body
			})
		}
	}
]