var serverRequest = require('../utils/serverRequest');

exports.get = function(req, res){
	serverRequest.getContent("get", req, function(data){
		if (!data) return res.send("error");
		res.set(data.headers);
		res.send(data.data);
	});
};

exports.post = function(req, res){
	serverRequest.getContent("post", req, function(data){
		if (!data) return res.send("error");
		res.set(data.headers);
		res.send(data.data);
	});
};