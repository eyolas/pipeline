var serverRepository = require('../../server/serverRepository'),
	mongoose = require('mongoose'),
	cache = require('./cache'),
	_ = require('lodash');


var defaultConfig = {
	host: "localhost",
	port: 27017
};

function DatabaseService(conf) {
}

function getDBString(config, serverId) {
	var sb = [ "mongodb://", config.host ];
	if (config.port)  {
		sb.push(":");
		sb.push(config.port);
	}
	sb.push("/");
	sb.push(serverId);
	return sb.join("");
}

DatabaseService.prototype = {
	init: function(conf) {
		this.config = _.extend({}, defaultConfig, conf);
		this.listDb = {};
		if (0 !== serverRepository.count()) {
			var listServers = serverRepository.getAll();
			Object.keys(listServers).forEach(function(k) {
				var server = listServers[k];

				var currentConn = mongoose.createConnection(getDBString(this.config, server.id));
				this.listDb[server.id] = currentConn.model('Cache', cache);
			}, this);
		}
	},

	getDb: function(serverId) {
		return this.listDb[serverId];
	}
}

module.exports = new DatabaseService();