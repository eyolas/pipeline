module.exports = MemoryCache;

var store = {};

function MemoryCache(nconf, next) {
	store = {};
	next();
}

MemoryCache.prototype = {
	get: function(serverId, pathRequest, key, next) {
		if (store[serverId]) {
			return next(store[serverId][key]);
		}
		return next(null);
	},
	put: function(serverId, pathRequest, key, data) {
		if (!store[serverId]) store[serverId] = {};
		store[serverId][key] = data;
	}
}