const apiKey = process.env.API_KEY;

module.exports = function (req, res, next) {
	console.log(req.query.apiKey, apiKey);
	if (req.query?.apiKey === apiKey ||
			req.body?.apiKey === apiKey ||
			req.headers['X-API-KEY'] === apiKey) {
		console.log('belep');
		next();
	} else {
		const err = new Error('Forbidden');
		err.status = 403;
		next(err);
	}
};
