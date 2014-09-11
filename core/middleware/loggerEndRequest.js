var LOG = require('../utils').logger.getLogger('http');

module.exports = function(server) {
	server.all('*', function(req, res, next) {
		res.on('finish', function() {
			var endDate = new Date();
			LOG.info('Request served on %d ms', endDate.getMilliseconds() - req.startDate.getMilliseconds());
		});
		next();
	});
};