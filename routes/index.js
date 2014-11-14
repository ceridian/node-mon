var models  = require('../models');
var express = require('express');
var router  = express.Router();
var r = require('../lib/requests.js');
var a = require('../lib/auth.js');
var async = require('async');


router.get('/', a.checkAuth, function(req, res) {
	models.CLUSTER.findAll().success(function(clusters) {
		async.map(clusters, function(cluster, cb){
			var ip = cluster.ipAddr;
			var name = cluster.name;
			r.alerts(ip, name, function(err,data){
				if(err){
					r.alerts(ip, cluster, function(err,data){
						if(err){
							var load = {};
							load.name = cluster;
							load.error = true;
							cb(null,load);
						}else{
							cluster.alerts = data;
							cb(null, cluster);
						}
					});
				}else{
					cluster.alerts = data;
					cb(null, cluster);
				}
			});
		}, function(err, result){
			res.render('index', {
				title: 'Monitor',
				clusters: result
			});
		});
	});
});

module.exports = router;
