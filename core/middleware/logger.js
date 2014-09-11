var LOG = require('../utils').logger.getLogger('http');

module.exports = function(server) {
	server.all('*', function(req, res, next){
		req.startDate = new Date();
		LOG.info('%s %s', req.method, req.url);
		next();
	});
};