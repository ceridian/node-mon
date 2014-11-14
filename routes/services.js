var models  = require('../models');
var r = require('../lib/requests.js');
var express = require('express');
var router  = express.Router();
var async = require('async');

router.get('/', function(req, res) {
	models.CLUSTER.findAll().success(function(clusters) {
		async.map(clusters, function(c, cb){
			var cluster = c.name.toLowerCase();
			var ip = c.ipAddr;
			r.services(ip, cluster, function(err,data){
				if(err){
					r.services(ip, cluster, function(err,data){
						if(err){
							var load = {};
							load.name = cluster;
							load.error = true;
							cb(null,load);
						}else{
							cb(null, data);
						}
					});
				}else{
					cb(null, data);
				}
			});
		}, function(err, result){
			res.send(result);
		});
	});
});

module.exports = router;