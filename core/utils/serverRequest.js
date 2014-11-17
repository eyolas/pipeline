var LOG = require('../utils').logger.getLogger('application'),
	objectUtils = require('./object'),
	querystring = require('qs'),
	crypto = require('crypto'),
	request = require('request'),
	util = require('util'),
	_ = require('lodash'),
	cache = require('../cache');

exports.getContent = function(method, req, next) {
	if (!req) {
		LOG.error("Error request");
		next("Error request");	
	}
	if (!req.path) {
		LOG.error("Path request");
		next("Path empty");
	}
	var pathRequest = req.path.replace(req.server.id + "/", "");

	if (pathRequest.length > 0 && "/" === pathRequest[0]) {
		pathRequest = pathRequest.substr(1);
	}

	var query = req.query || {};
	if ("post" === method.toLowerCase()) {
		query = req.body;
	}



	var cacheKey = getCacheKey(pathRequest, query, req);

	LOG.info("call method : %s", method.toLowerCase());

	cache.get(req.server.id, pathRequest, cacheKey, function(data) {
		if (data) {
			LOG.info("Request in cache");
			return next(data);
		}
		
		LOG.info("Request not in cache");
		callServer(req, method, pathRequest, query, function(data){
			cache.put(req.server.id, pathRequest, cacheKey, data);
			next(data);
		});
	});
};


function callServer(req, method, pathRequest, query, next) {
	if ("post" === method.toLowerCase()) {
		callPost(req, method, pathRequest, query, next);
	} else {
		callGet(req, method, pathRequest, query, next);
	}
}


function callPost(req, method, pathRequest, query, next) {
	var url  = req.server.url + "/" + pathRequest;
	var opts = _.extend({}, getOpts(req),{form:query});
	request.post(url, opts, function (e, r, body) {
		parserRep(r, body, next);
	});
};

function getOpts(req){
	var opts = {};

	if (req.username && req.password){
		opts.auth = {
			'user': req.username,
		    'pass': req.password,
		    'sendImmediately': false
		};
	}

	opts.headers = req.headers;
	
	if (opts.headers.host)
		delete opts.headers.host;

	return opts;
}

function callGet(req, method, pathRequest, query, next) {
	var url  = req.server.url + "/" + pathRequest;

	console.log(req.url && ~req.url.indexOf("?"));
	if (req.url && ~req.url.indexOf("?")) {
		var realQuery = req.url.substr(req.url.indexOf("?"));
		url += realQuery;
	}
	
	LOG.info("call url: %s", url);

	var opts = getOpts(req);

	request.get(url, opts, function (e, r, body) {
		parserRep(r, body, next);
	});
};

function parserRep(r, body, next) {
	next({
		headers: r.headers,
		data: body
	});
}

function getCacheKey(pathRequest, query, req) {
	var server = req.server,
		purgedQuery = objectUtils.clone(query),
		ignoreArgsForCache = server.ignoreArgsForCache,
		whiteListHeader = server.whiteListHeader;
		opts = objectUtils.clone(getOpts(req));

	if (ignoreArgsForCache && 0 !== ignoreArgsForCache.length) {
		for (var k in purgedQuery) {
			var key = k.toLowerCase();
			if (_.contains(ignoreArgsForCache, key)) {
				delete purgedQuery[k];
			}
		}
	}

	if (Array.isArray(whiteListHeader) && opts.headers) {
		for (var k in opts.headers) {
			var key = k.toLowerCase();
			if (!_.contains(whiteListHeader, key)) {
				delete opts.headers[k];
			}
		}
	} else {
		opts.headers = null;
	}
	
	var purgedQuery = objectUtils.orderObjectByKey(purgedQuery);
	return querystring.stringify(query) + querystring.stringify(opts);
	//return crypto.createHash('sha256').update(server.id + "_" + pathRequest + querystring.stringify(query) + querystring.stringify(opts)).digest("hex");
};