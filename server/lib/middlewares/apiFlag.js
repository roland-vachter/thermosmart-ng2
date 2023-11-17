module.exports = function (req, res, next) {
	req.apiCall = true;
	next();
};
