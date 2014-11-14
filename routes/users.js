var models  = require('../models');
var express = require('express');
var router  = express.Router();
var l = require('../lib/logs.js');
var async = require('async');

router.get('/', function(req, res) {
	models.CLUSTER.findAll().complete(function(err, clusters) {
		async.map(clusters, function(obj, cb){
			var load = {};
			load.ip = obj.ipAddr;
			load.cluster = obj.name;
			load.id = obj.id;
			models.CLUSTERUSER.findAll({where: {clusterID: obj.id}}).complete(function(err, users) {
				async.map(users, function(user, cb2){
					cb2(null, user.userName);
				}, function(err, r){
					load.user = r;
					cb(null, load);
				});
			});
		}, function(err, results){
			async.map(results, function(cluster, cb){
				l.logParse(cluster, function(data){
					cb(null, data);
				});
			}, function(err, result){
				res.send(result);
			});
		});
	});
});

module.exports = router;