var path = require('path'),
	winston = require('winston'),
	winstonConf = require('winston-config'),
	pathUtils = require('./path'),
	LOGGER = null;

function Logger() {
	LOGGER = null;
}

Logger.prototype = {
	init: function(nconf, cb) {
		var LOG = this.getLogger();
		var conf = null;
		fixRelativepathUtilsForLogFiles(nconf);
		conf = nconf.get('logger');
		winstonConf.fromJson(conf.logging, function(error, winston) {
			if(error) {
				LOG.warn("" + error);
				LOG.warn('Utilisation de la configuration par défaut des logs')
				return cb(null);
			} else {
				LOGGER = winston;
				return cb(null);
			}
		});
	},

	getLogger: function(name) {
		if (LOGGER) {
			return LOGGER.loggers.get(name);
		}

		return this.getDefaultLogger();
	},

	getDefaultLogger: function() {
		return new (winston.Logger)({
			transports: [
				new (winston.transports.Console)({colorize: true, timestamp: true})
			]
		});
	}
};


function fixRelativepathUtilsForLogFiles(nconf) {
	var loggerConf = nconf.get('logger'),
		rootPath = nconf.get('rootPath');

	if (loggerConf && loggerConf.hasOwnProperty('logging')) {

		for (var k in loggerConf.logging) {
			var v = loggerConf.logging[k];

			//if it's a file transport and it's a relative path then transform to absolute path
			if (v.hasOwnProperty('file') && v.file.hasOwnProperty('filename') && !pathUtils.isAbsolute(v.file.filename)) {
				var logPath = path.resolve(rootPath, v.file.filename);
				loggerConf.logging[k].file.filename = logPath;
			}
		}
		nconf.set('logger', loggerConf);
	}
}

module.exports = new Logger();