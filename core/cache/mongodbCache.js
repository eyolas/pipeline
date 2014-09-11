var databaseService = require('./mongodb/databaseService')

module.exports = MongodbCache;


function MongodbCache(nconf, next) {
	databaseService.init(nconf.get('application').cacheConfig);
	next();
}

function convertCache(cache) {
	try {
		return {
			headers: JSON.parse(cache.headers),
			data: cache.data
		};
	} catch(err) {
		return null;
	}
	return null
}

MongodbCache.prototype = {
	get: function(serverId, pathRequest, key, next) {
		var db = databaseService.getDb(serverId);
		db.findOne({key: key}, function(err, cache) {
			if (err) return next(null);
			return next(convertCache(cache));
		})
	},
	put: function(serverId, pathRequest, key, data) {
		var db = databaseService.getDb(serverId);
		var cache = new db({key: key, data: data.data, headers: JSON.stringify(data.headers)});
		cache.save();
	}
}