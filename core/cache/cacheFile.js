var path = require('path'),
	pathUtils = require('../utils').path,
	mkdirp = require('mkdirp'),
	crypto = require('crypto'),
	serverRepository = require('../server/serverRepository'),
	fs = require('fs');

module.exports = CacheFile;

function CacheFile(nconf, next) {
	var LOG = require('../utils').logger.getLogger('application');
	this.type = "CacheFile";
	this.path = getCacheDirectory(nconf);
	LOG.info("path of cache : %s", this.path);
	this.init();
	next();
}

function getCacheDirectory(nconf) {
	var conf = nconf.get('application').cacheConfig || {},
		cacheDir = path.resolve(nconf.get('rootPath'), '.caches/');

	if (conf.pathCache) {
		cacheDir = conf.pathCache;
		if (!pathUtils.isAbsolute(cacheDir)) cacheDir = path.resolve(nconf.get('rootPath'), cacheDir);
	}
	
	return cacheDir;
}

function getPathFile(serverId, pathRequest, key) {
	var pathKey = crypto.createHash('sha256').update(key).digest("hex");
	return path.resolve(this.path, serverId + '/'  + pathRequest, pathKey);
}

CacheFile.prototype = {
	init: function() {
		if (0 !== serverRepository.count()) {
			var listServers = serverRepository.getAll();
			Object.keys(listServers).forEach(function(k) {
				var server = listServers[k];
				var pathCache = path.resolve(this.path, server.id + '/');
				if (!fs.existsSync(pathCache)) {
					fs.mkdirSync(pathCache, 0755);
				}
			}, this);
		}
	},

	get: function(serverId, pathRequest, key, next) {
		var pathFile = getPathFile.call(this, serverId, pathRequest, key);
		fs.exists(pathFile, function(exists) {
			if (exists) {
				fs.readFile(pathFile, function (err, data) {
					if (err) {
						return next(null);
					}

					try {
						if (data) {
							var json = JSON.parse(data);
							return next(json);
						}	
					} catch(err) {
						var LOG = require('../utils').logger.getLogger('application');
						LOG.error('error parse ');
						LOG.error(err);
					}
					return next(null);
				});
			} else {
				return next(null);
			}
		});
	},

	put: function(serverId, pathRequest, key, data) {
		var pathFile = getPathFile.call(this, serverId, pathRequest, key);
		mkdirp(path.dirname(pathFile), function(err) {
			try {
				var json = JSON.stringify(data);
				fs.writeFile(pathFile, json, function(err) {});
			} catch(err) {}
		});
		
	}
}