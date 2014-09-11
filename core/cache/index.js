var cache = null,
	cacheIsInit = false;


function Cache() {

}

Cache.prototype = {
	init: function(nconf, next) {
		if (cacheIsInit) return;
		var LOG = require('../utils').logger.getLogger('application');
		var appConf = nconf.get('application');
		switch(appConf.cache) {
			case 'memory':
				LOG.info('Use memory cache');
				var MemoryCache = require('./memoryCache');
				cache = new MemoryCache(nconf, next);
				break;
			case 'file':
				LOG.info('use file cache');
				var CacheFile = require('./cacheFile');
				cache = new CacheFile(nconf, next);
				break;
			case 'mongodb':
				LOG.info('use mongodb cache');
				var MongodbCache = require('./mongodbCache');
				cache = new MongodbCache(nconf, next);
				break;
			default:
				LOG.warn('no cache !!!!');
				var NoCache = require('./noCache');
				cache = new NoCache(nconf, next);
				break;
		}
		cacheIsInit = true;
	},

	get: function(serverId, pathRequest, key, next) {
		cache.get(serverId, pathRequest, key, next);
	},
	put: function(serverId, pathRequest, key, data) {
		cache.put(serverId, pathRequest, key, data);
	}
};

module.exports = new Cache();