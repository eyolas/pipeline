module.exports = Server;

function Server(named, serverConfig) {
	this.name = named;
	this.id = serverConfig.id;
	this.url = serverConfig.url;
	this.ignoreArgsForCache = [];
	this.auth = null;
	this.headers = null;
	this.whiteListHeader = [];

	if (!!serverConfig.ignoreArgsForCache) {
		if (Array.isArray(serverConfig.ignoreArgsForCache)) {
			serverConfig.ignoreArgsForCache.forEach(function(value) {
				this.ignoreArgsForCache.push(value.toLowerCase());
			}, this);
		} else {
			this.ignoreArgsForCache.push(serverConfig.ignoreArgsForCache.toLowerCase());
		}
	}

	if (!!serverConfig.whiteListHeader) {
		if (Array.isArray(serverConfig.whiteListHeader)) {
			serverConfig.whiteListHeader.forEach(function(value) {
				this.whiteListHeader.push(value.toLowerCase());
			}, this);
		} else {
			this.whiteListHeader.push(serverConfig.whiteListHeader.toLowerCase());
		}
	}

	if (serverConfig.auth && serverConfig.auth.login && serverConfig.auth.password) {
		this.auth = serverConfig.auth;
	}

	if (serverConfig.headers) {
		this.headers = serverConfig.headers;
	}
}

Server.prototype = {
	hasAuth: function() {
		return !!this.auth;
	}
}