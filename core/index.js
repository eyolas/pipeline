var utils = require('./utils'),
	path = require('path'),
	fs = require('fs'),
	LOG = utils.logger.getDefaultLogger(),
	config = require('./config'),
	builder = config.builder,
	async = require('async'),
	serverRepository = require('./server/serverRepository'),
	cache = require('./cache');

console.log(config.logo);

LOG.info('Initialisation de l\'application');
async.auto({
	definedRootPath: function(cb) {
		LOG.info('Définition du root path');

		var rootPath = path.resolve(__dirname, '..');
		LOG.info('root path :', rootPath);
		cb(null, rootPath);
	},

	initFolders: ['definedRootPath', function(cb, results) {
		LOG.info('Initialisation des dossiers');

		['config', 'logs', '.caches'].forEach(function(folder) {
			var folderPath = path.resolve(results.definedRootPath, folder);
			try {
				var stats = fs.statSync(folderPath);
				if (!stats.isDirectory()) throw new Error();		
			} catch(e) {
				LOG.info('Création du dossier', folder);
				fs.mkdirSync(folderPath, 0755);
			}
		});

		['app.log', 'http.log'].forEach(function(file) {
			var filePath = path.resolve(results.definedRootPath, 'logs', file);

			try {
				var stats = fs.statSync(filePath);
				if (!stats.isFile()) throw new Error();		
			} catch(e) {
				LOG.info('Création du fichier', file);
				fs.openSync(filePath, 'w');
			}
		});

		
		cb(null);
	}],

	initConfig: ['definedRootPath', 'initFolders', function(cb, results) {
		LOG.info('Initialisation de la configuration');

		var pathConfig = path.resolve(results.definedRootPath, 'config/');
		var pathConfigCore = path.resolve(__dirname, 'config/defaultConfig/');

		var nconf = new builder(LOG)
			.load(pathConfigCore, ['logger', 'application'])
			.load(pathConfig, ['logger', 'servers', 'application'])
			.build();

		nconf.set('rootPath', results.definedRootPath);
		
		cb(null, nconf);
	}],

	initCache: ['initServers', function(cb, results) {
		LOG.info('Initialisation du cache');
		cache.init(results.initConfig, cb);
	}],

	initLogger: ['initConfig', function(cb, results) {
		LOG.info('Initialisation du logger');
		utils.logger.init(results.initConfig,  cb);
	}],

	initServers: ['initLogger', function(cb, results) {
		LOG.info('Initialisation des serveurs');
		serverRepository.init(results.initConfig);
		if (0 === serverRepository.count()) throw new Error("No server configured")
		cb();
	}],

	configureServer: ['initCache', function(cb, results) {
		var app = require('./application');
		app.init(results.initConfig);
		app.start();
	}]
});