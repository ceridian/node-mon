var later = require('later');
var fs = require('fs');
var request = require('request');
var async = require('async');
var status = require('./requests.js');
var path = require('path');
var models = require('../models');
var util = require('./servUtil.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('GVa8h1c4RDrL8bbuEYNKhA');

later.date.localTime();

module.exports = {
	timer: function(){
		var sched = later.parse.recur().on(8).hour();
		var n = later.schedule(sched).next(2);
		var s = {schedules: sched.schedules, exceptions: sched.exceptions};
		later.setInterval(m.runner, s);
		util.good('file timer', n, function(){

		});
	},

	runner: function(){
		models.CLUSTER.findAll().complete(function(err, clusters){
			if(err){
				console.log(err);
			}else{
				async.each(clusters, function(c, cb){
					var id = c.id;
					var ip = c.ipAddr;
					var port = c.logPort;
					m.worker(id, ip, port, function(){
						cb();
					});
				}, function(){
					m.checker(function(){
						console.log('done');
					});
				});
			}
		});
	},

	worker: function(cid, ip, port, callback){
		status.files(ip, port, function(err, obj){
			if(err) console.log(err);
			async.each(obj, function(f, cb){
				models.FILE.create({CLUSTERId: cid, location: f}).complete(function(err){
					if(err){
						cb();
					}else{
						cb();
					}
				});
			}, function(){
				util.good('file checking', 'cluster: '+cid, function(){
					callback();
				});
			});
		});
	},

	checker: function(callback){
		models.FILE.findAll({where: {known: false}}).complete(function(err, res){
			if(err){
				console.log(err);
				callback();
			}else{
				var payload = '<p>New Files</p><ul>';
				async.each(res, function(file, cb){
					models.FILE.find({where: {id: file.id}}).complete(function(err, data){
						data.known = true;
						data.save().complete(function(err){
							if(err) console.log(err);
							payload += '<li>'+file.location+'</li>';
							cb();
						});
					});
				}, function(){
					payload += '</ul>';
					var message = {
						"html": payload,
						"text": "New Sources",
						"subject": "New Unknown Sources",
						"from_email": "SourceAdmin@data-realty.com",
						"from_name": "Source Admin",
						"to": [{
							"email": "support@data-realty.com",
							"name": "Recipient Name",
							"type": "to"
						}]
					};
					mandrill_client.messages.send({"message": message}, function(result) {
						console.log(result);
						callback();
					});
				});
			}
		});
	},

	tableUpdate: function(obj, callback){
		console.log(obj);
	}
}
var m = require('./maint.js');

//var sched = later.parse.recur().on(30).minute();
//later.schedule(sched).next();
//var s = {schedules: sched.schedules, exceptions: sched.exceptions};

//var t = later.setInterval(l.timer, s);
//l.timer();