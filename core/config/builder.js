var path = require('path'),
	fs = require('fs'),
	_ = require('lodash');;

require('jsonminify');

function Builder(log, options) {
	options = options || {};
	this._LOG = log;
	this._nconf = require('nconf');
	this._init();
}

Builder.prototype = {
	_init: function() {
		var nconf, env;

   		nconf = this._nconf;

	    if (undefined == nconf.get('nconfInit')) {
		    nconf.argv().env().use('memory');
		    env = nconf.get('NODE_ENV') || 'development';
		    nconf.set('NODE_ENV', env);
		    nconf.set('env:env', env);
		    nconf.set('env:' + env, true);	
		    nconf.set('nconfInit', true)
	    }
    
	},

	load: function(root, files) {
		if (!files || !root) return;
		if (!Array.isArray(files)) files = [ files ];
		var rootConfig = this._getRootConfig(root);

		if (rootConfig) {
			files.forEach(function(fileName) {

				var jsonValue = this._getJSONValue(rootConfig, fileName);

				if (jsonValue) {
					var oldValue = this._nconf.get(fileName);
					if (oldValue) {
						this._nconf.set(fileName, _.merge({}, oldValue, jsonValue));
					} else {
						this._nconf.set(fileName, jsonValue);
					}
				} 

			}, this);
		}

		return this;
	},

	_getJSONValue: function(root, fileName) {
		var filePath = path.join(root, fileName + '.json');
		try {
			var stats = fs.statSync(filePath);

			if (stats.isFile()) {
				var contents = fs.readFileSync(filePath, 'utf8');
      			contents = JSON.minify(contents);

		       	if (typeof contents === 'string' && contents.length > 0) {
		          try {
		            contents = JSON.parse(contents);
		          } catch (e) {
		          	this._LOG.warn("parse error :" + filePath);
		          }
		          return contents;
		      	}
		     }
		} catch (e) {
			this._LOG.warn("file error :", e);
		}

		return null;
	},

	_getRootConfig: function(root) {
		var stats = fs.statSync(root);
		return stats && stats.isDirectory()? root : undefined;
	},

	build: function() {
		return this._nconf;
	}
};

module.exports = Builder;