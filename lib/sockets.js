var models = require('../models');
var async = require('async');
var re = require('./requests.js');

module.exports = {
	socketsInit: function(io){
		io.on('connection', function (socket) {
			console.log('connected');
			socket.on('disconnect', function(){ console.log('disconnect'); });
			setInterval(function(){
				models.CLUSTER.findAll().success(function(clusters) {
					async.map(clusters, function(c, cb){
						var cluster = c.name;
						var ip = c.ipAddr;
						re.ramSpace(ip, cluster, function(err,info){
							cb(null, info);
						});
					}, function(err, done){
						socket.emit('gauges', done);
					});
				});
			}, 100000);
			setInterval(function(){
				models.CLUSTER.findAll().success(function(clusters) {
					async.map(clusters, function(c, cb){
						var cluster = c.name;
						var ip = c.ipAddr;
						re.services(ip, cluster, function(err,info){
							cb(null, info);
						});
					}, function(err, done){
						socket.emit('services', done);
					});
				});
			}, 100000);
			socket.on('countStart', function(data){
				r.rowCounts(socket, data);
			});
		});
	}
}