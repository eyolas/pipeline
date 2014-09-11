var serverRepository = require('../server').serverRepository;

module.exports = function(server) {
	server.param(':id', function(req, res, next, id) {
		var serv = serverRepository.findById(id)
		if (serv) {
			req.server = serv;
			next();
		} else {
			res.send('Serveur inconnu');
		}
	});
}