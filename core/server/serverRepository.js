var Server = require('./server');

var listServers = {},
		repoIsInit = false;

function ServerRepository() {

}

ServerRepository.prototype = {
	add: function(server) {
		if (server && server.id) {
			listServers[server.id] = server;
		}
	},

	findById: function(id) {
		return listServers[id];
	},

	count: function() {
		return listServers.length;
	},

	init: function(nconf) {
		if (repoIsInit) return;
		var serverConf = nconf.get('servers');

		if (!serverConf) throw new Error('Aucun serveur configuré');

		for (var key in serverConf) {
			var serv = serverConf[key];
			if (!serv.id || !serv.url) continue;
			var server = new Server(key, serv);
			this.add(server);
		}

		if (0 === this.count()) throw new Error('Aucun serveur configuré');

		repoIsInit = true;
	},

	getAll: function() {
		return listServers;
	}
}

module.exports = new  ServerRepository();