module.exports = NoCache;

function NoCache(nconf, next) {
	next();
}

NoCache.prototype = {
	get: function(serverId, pathRequest, key, next) {
		return next(null);
	},
	put: function(serverId, pathRequest, key, data) {}
}