var express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path'),
	LOG = require('../utils').logger.getLogger('application');

function Application() {
	this._app = express();
}


Application.prototype = {
	init: function(nconf) {
		this._nconf = nconf;
		var app = this._app;

		app.set('port', this._nconf.get('application').port);
		//app.use(bodyParser());

		// parse application/x-www-form-urlencoded
		app.use(bodyParser.urlencoded({ extended: false }))

		// parse application/json
		app.use(bodyParser.json())

		// parse application/vnd.api+json as json
		app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

		app.use(methodOverride());

		//app.use(this._app.router);


		app.all('*', function(req, res, next) {
		    if (req.headers['authorization']) {
		      var auth = new Buffer(req.header('Authorization').replace('Basic ', ''), 'base64').toString('ascii').split(':');    
		      if (Array.isArray(auth) && auth.length == 2) {
		      	req.username = auth[0];
			      req.password = auth[1];
			      LOG.info("Utilisation basic auth username : %s, password: %s", auth[0], auth[1]);
		      }
		      
		    }
		    next();
		  });

		require('../middleware/logger')(this._app);
		require('../middleware/serverResolver')(this._app);
		require('../middleware/loggerEndRequest')(this._app);

		app.get('/:id', routes.get);
		app.get('/:id/*', routes.get);
		app.post('/:id', routes.post);
		app.post('/:id/*', routes.post);


	},
	start: function() {
		var app = this._app;
		http.createServer(app).listen(app.get('port'), function(){
		  LOG.info('Express server listening on port ' + app.get('port'));
		});
	}
}

module.exports = new Application();