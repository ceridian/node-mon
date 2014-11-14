var fs = require('fs');
var request = require('request');
var async = require('async');
var status = require('./requests.js');
var path = require('path');
var models = require('../models');
var _ = require('underscore');

var q = async.queue(function(task, callback){
	r.webcount(task, function(result){
		/*{ dbName: 'mariachi',  // example result
  			tableName: 'card',
  			CLUSTERId: 1,
  			count: 626554 }*/
  		r.checkDb(result, function(){
  			callback();
  		});

		/*models.COUNT.build(result)
		.save()
		.complete(function(err){
			if(err) console.log(err);
			container.push(result);
			callback();
		});*/
	});
}, 3);

var container = [];
module.exports = {
	checkDb: function(result, callback){
		var dbName = result.dbName;
		var tableName = result.tableName;
		var CLUSTERId = result.CLUSTERId;
		var count = result.count;
		models.COUNT.find({ where: { CLUSTERId: CLUSTERId, dbName: dbName, tableName: tableName }}).complete(function(err, exists) {
			if(err){
				console.log(err);
			}else{
				if(exists){
					exists.updateAttributes({count: count}).complete(function(err){
						if(err) console.log(err);
						callback();
					});
				}else{
					models.COUNT.build(result)
					.save()
					.complete(function(err){
						if(err) console.log(err);
						container.push(result);
						callback();
					});
				}
			}
		});
	},

	rowCounts: function(socket, body){
		var d = new Date();
		console.log(d.dateStamp());
		var ip = body.ip;
		var name = body.name;
		r.setup(body, function(hold){
			socket.emit('numTables', {total: hold.length});
			models.CLUSTER.find({ where: { ipAddr: ip }}).complete(function(err, cluster) {
				if(err) console.log(err);
				async.each(hold, function(tab, cb){
					tab.CLUSTERId = cluster.id;
					q.push(tab, function(){
						socket.emit('tick');
						cb();
					});
				}, function(){
					console.log('done');
					var done = container.join('\n');
					console.log(done);
					socket.emit("countDone", done, function(d){
						container = [];
						console.log(d);
					});
				});
			});
		});
	},

	setup: function(body, callback){
		var ip = body.ip;
		var name = body.name;
		status.databases(ip, function(dbs){
			var hold = [];
			async.each(dbs, function(db, cb){
				status.tables(ip, db, function(tabs){
					async.each(tabs, function(tab, cb2){
						var payload = {};
						payload.table = tab;
						payload.db = db;
						payload.ip = ip;
						hold.push(payload);
						cb2();
					}, function(){
						cb();
					});
				});
			}, function(){
				callback(hold);
			});
		});
	},

	currentCount: function(callback){
		models.COUNT.findAll({ include: [ models.CLUSTER ]}).complete(function(err, res){
			async.map(res, function(tab, cb){
				var h = {};
				h.dbName = tab.dbName;
				h.tableName = tab.tableName;
				h.count = tab.count;
				h.updatedAt = tab.updatedAt;
				var c = tab.CLUSTER;
				h.name = c.name;
				h.ipAddr = c.ipAddr;
				cb(null, h);
			}, function(err, result){
				callback(result);
			});
		});
	},

	webcount: function(load, callback){
		var ip = load.ip;
		var table = load.table;
		var db = load.db;
		var payload = {};
		payload.dbName = db;
		payload.tableName = table;
		payload.CLUSTERId = load.CLUSTERId;
		status.describe(load, function(err, desc){
			if(err) console.log(err);
			var num = desc.totalNumberFiles;
			if(num >0){
				var loc;
				var l = desc.location;
				if(l){
					var cut = l.split(':8020');
					loc = cut[1];
					var load = {
						"db": db,
						"table": table,
						"str": loc
					};
					r.count(ip, load, function(res){
						payload.count = res;
						callback(payload);
					});
				}else{
					payload.count = 0;
					callback(payload);
				}
			}else{
				payload.count = 0;
				callback(payload);
			}
		});
	},

	count: function(ip, load, callback){
		var str = JSON.stringify(load);
		request.post({
			url: 'http://'+ip+':3000/count',
			headers: {'content-type' : 'application/json'},
			body: str,
			timeout: 300000
		}, function (err, res, body){
			if(err) console.log(err);
			var parsed = JSON.parse(body);
			callback(parsed.count);
		});
	}
}

var r = require('./reports.js');