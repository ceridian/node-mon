var fs = require('fs');
var request = require('request');
var async = require('async');
var status = require('./requests.js');
var path = require('path');
var models = require('../models');
var _ = require('underscore');

module.exports = {
	rowCounts: function(socket, body){
		var ip = body.ip;
		var name = body.name;
		setup(body, function(hold){
			socket.emit('numTables', {total: hold.length});
			async.map(hold, function(tab, cb){
				r.checkCount(tab, function(err, inDB, table){
					if(err) console.log(err);
					tab.CLUSTERId = table.CLUSTERId;
					r.webcount(tab, function(result){
						socket.emit('tick');
						if(inDB == true){
							updateCount(table.id, result, function(){
								cb();
							});
						}else{
							writeCount(table, result, function(){
								cb();
							});
						}
					});
				});
			}, function(err, res){
				var done = res.join('\n');
				console.log(done);
				socket.emit("countDone", done, function(d){
					console.log(d);
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

	writeCount: function(table, count, cb){
		table.count = count;
		models.COUNT.build(table)
		.save()
		.complete(function(err){
			if(err) console.log(err);
			cb();
		});
	},

	updateCount: function(old, cur, cb){
		models.COUNT.update({count: cur}, {id: old.id}).complete(function(err){
			if(err) console.log(err);
			cb();
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
		r.describe(ip, db, table, function(desc){
			var num = desc.totalNumberFiles;
			if(num >0){
				var loc;
				var l = desc.location;
				if(l){
					var cut = l.split(':8020');
					loc = cut[1];
					r.count(ip, loc, function(res){
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

	count: function(ip, loc, callback){
		var cmd = "http://"+ip+":50070/webhdfs/v1"+loc+"?op=LISTSTATUS";
		console.log(cmd);
		request.get(cmd, function(err, res, body){
			if(err) {
				console.log('webcount: ', err);
				callback(0);
			}else{
				var parsed = JSON.parse(body);
				if(parsed.RemoteException){
					callback(0);
				}else{
					var parsed = JSON.parse(body);
					var list = parsed.FileStatuses.FileStatus;
					if(list.length > 0){
						var total = 0;
						async.eachSeries(list, function(file, cb2){
							var str = path.resolve(loc, file.pathSuffix);
							var cmd2 = "http://"+ip+":50070/webhdfs/v1"+str+"?op=OPEN";
							var i = 0;
							var req = request.get(cmd2);
							req.on('error', function(err){
								cb2();
							});
							req.on('data', function(chunk){
								var st = chunk.toString();
								var s = st.split('\n');
								var leng = s.length;
								i += leng;
							});
							req.on('end', function(){
								total += i;
								cb2();
							});
						}, function(){
							callback(total);
						});
					}else{
						callback(0);
					}
				}
			}
		});
	},

	checkCount: function(tab, callback){  // bool // false = not in db  // true = in db
		var ip = tab.ip;
		var table = tab.table;
		var db = tab.db;
		models.CLUSTER.find({ where: { ipAddr: ip }}).complete(function(err, cluster) {
			if(err){
				callback(err, null, null);
			}else{
				models.COUNT.find({ where: { CLUSTERId: cluster.id, dbName: db, tableName: table }}).complete(function(err, exists) {
					if(err){
						callback(err, null, null);
					}else{
						if(exists == null){
							callback(null, false, exists);
						}else{
							callback(null, true, exists);
						}
					}
				});
			}
		});
	}

}

var r = require('./reports.js');