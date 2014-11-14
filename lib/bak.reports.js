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
		r.databases(ip, function(dbs){
			var hold = [];
			async.each(dbs, function(db, cb){
				r.tables(ip, db, function(tabs){
					async.each(tabs, function(tab, cb2){
						var payload = {};
						payload.table = tab;
						payload.db = db;
						payload.ip = ip;
						hold.push(payload);
						cb2();
						/*r.describe(ip, db, tab, function(desc){
							i++;
							console.log(i);
							/* // desc returns this
							{ minFileSize: 762,
							  totalNumberFiles: 1,
							  location: 'hdfs://name.swordfish.local:8020/user/root/irena/oracle/irsform',
							  outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
							  lastAccessTime: 1412017128999,
							  lastUpdateTime: 1412017129008,
							  columns:
							   [ { name: 'descnamespacecd1', type: 'string' },
							     { name: 'desctokennbr', type: 'int' },
							     { name: 'datelastmaint', type: 'date' },
							     { name: 'irsformdesc', type: 'string' } ],
							  maxFileSize: 762,
							  partitioned: false,
							  owner: 'root',
							  inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
							  totalFileSize: 762,
							  database: 'oracle',
							  table: 'osibankirsform',
							  group: 'hdfs',
							  permission: 'rwxr-xr-x' }
							var payload = {};
							var l = desc.location;
							var loc;
							if(!l){
								loc = null;
							}else{
								var cut = l.split(':8020');
								loc = cut[1];
							}
							payload.ip = ip;
							payload.db = desc.database;
							payload.tab = desc.table;
							payload.loc = loc;
							hold.push(payload);
							cb2();
						});*/
					}, function(){
						cb();
					});
				});
			}, function(){
				socket.emit('numTables', {total: hold.length});
				async.map(hold, function(tab, cb){
					r.webcount(tab, socket, function(result){
						models.CLUSTER.find({ where: { ipAddr: result.ip }}).success(function(cluster) {
							models.COUNT.find({ where: { clusterID: cluster.id, dbName: result.db, tableName: result.tab }}).success(function(exists) {
								if(exists){
									r.updateCount(exists, result, function(){
										cb(null, result);
									});
								}else{
									r.writeCount(cluster.id, result, function(){

									});
								}
							});
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
		});
	},

	writeCount: function(id, desc, callback){
		async.map(desc, function(res, cb){
			var h = {};
			h.clusterID = id;
			h.dbName = res.db;
			h.tableName = res.tab;
			h.count = res.count;
			cb(null, h);
		}, function(err, result){
			models.COUNT.bulkCreate(result).success(function() {
				callback();
			})
			.error(function(err){
				console.log(err);
			});
		});
	},

	updateCount: function(old, cur, callback){
		var diff = _.difference(old, cur);
		console.log(diff);
		if(diff > 0){
			async.each(cur, function(col, cb){
				var name = col.name;
				var oCol = _.find(old, function(c){
					return c.colName == name;
				});
				models.COUNT.update({count: col.count}, {id: oCol.id}).success(function(){
					cb();
				});
			}, function(){
				callback();
			});
		}else{
			callback();
		}
	},

	databases: function(ip, cb){
		var cmd = 'http://'+ip+':50111/templeton/v1/ddl/database?user.name=root';
		console.log(cmd);
		request.get(cmd, function(error, response, body){
			if(error) console.log(error);
			var parsed = JSON.parse(body);
			var dbs = parsed.databases;
			cb(dbs);
		});
	},

	tables: function(ip, db, cb){
		var cmd = 'http://'+ip+':50111/templeton/v1/ddl/database/'+db+'/table?user.name=root';
		request.get(cmd, function(error, response, body){
			if(error) console.log(error);
			var parsed = JSON.parse(body);
			var tabs = parsed.tables;
			cb(tabs);
		});
	},

	describe: function(ip, db, tab, cb){
		var cmd = 'http://'+ip+':50111/templeton/v1/ddl/database/'+db+'/table/'+tab+'?user.name=root&format=extended';
		request.get(cmd, function(error, response, body){
			if(error) console.log(error);
			var parsed = JSON.parse(body);
			console.log(parsed);
			models.CLUSTER.find({ where: { ipAddr: ip }}).complete(function(err, cluster) {
				if(err) console.log(err);
				models.COLUMN.findAll({ where: { clusterID: cluster.id, dbName: db, tableName: tab }}).complete(function(err, exists) {
					if(err) console.log(err);
					if(exists){
						r.updateDesc(exists, parsed.columns, function(){
							cb(parsed);
						});
					}else{
						r.writeDesc(cluster.id, db, tab, parsed.columns, function(){
							cb(parsed);
						});
					}
				});
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

	writeDesc: function(id, db, tab, desc, callback){
		async.map(desc, function(col, cb){
			var h = {};
			h.clusterID = id;
			h.dbName = db;
			h.tableName = tab;
			h.colName = col.name;
			h.colType = col.type;
			cb(null, h);
		}, function(err, result){
			models.COLUMN.bulkCreate(result).success(function() {
				callback();
			})
			.error(function(err){
				console.log(err);
			});
		});
	},

	updateDesc: function(old, cur, callback){
		var diff = _.difference(old, cur);
		console.log(diff);
		if(diff > 0){
			async.each(cur, function(col, cb){
				var name = col.name;
				var oCol = _.find(old, function(c){
					return c.colName == name;
				});
				models.COLUMN.update(col, {id: oCol.id}).success(function(){
					cb();
				});
			}, function(){
				callback();
			});
		}else{
			callback();
		}
	},

	webcount: function(load, socket, callback){
		var ip = load.ip;
		var table = load.table;
		var db = load.db;
		//socket.emit('tick');
		//callback(ip+','+db+','+table+',0');
		r.describe(ip, db, table, function(desc){
			var num = desc.totalNumberFiles;
			if(num >0){
				var loc;
				var l = desc.location;
				if(l){
					var cut = l.split(':8020');
					loc = cut[1];
					r.count(ip, load, loc, function(res){
						socket.emit('tick');
						var payload = {};
						payload.ip = ip;
						payload.db = db;
						payload.table = table;
						payload.count = res.count;
						console.log(ip+','+db+','+table+','+res.count);
						callback(payload);
					});
				}else{
					socket.emit('tick');
					var payload = {};
					payload.ip = ip;
					payload.db = db;
					payload.table = table;
					payload.count = 0;
					callback(payload);
				}
			}else{
				var payload = {};
				payload.ip = ip;
				payload.db = db;
				payload.table = table;
				payload.count = 0;
				callback(payload);
			}
		});
	},

	count: function(ip, load, loc, callback){
		var cmd = "http://"+ip+":50070/webhdfs/v1"+loc+"?op=LISTSTATUS";
		console.log(cmd);
		request.get(cmd, function(err, res, body){
			if(err) {
				console.log('webcount: ', err);
				load.count = 0;
				callback(load);
			}else{
				var parsed = JSON.parse(body);
				if(parsed.RemoteException){
					load.count = 0;
					callback(load);
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
							load.count = total;
							callback(load);
						});
					}else{
						load.count = 0;
						callback(load);
					}
				}
			}
		});
	}
		/*request.get(cmd, function(error, response, body){
			if(error) console.log(error);
			var parsed = JSON.parse(body);
			var tableTotal = parsed.length;
			console.log(tableTotal);
			sock.emit('numTables', {total: tableTotal});
			async.mapSeries(parsed, function(c, cb){
				var cmd = "http://"+ip+":50070/webhdfs/v1"+c+"?op=LISTSTATUS"
				console.log(cmd);
				request.get(cmd, function(err, res, body){
					if(err) console.log('tables: '+err);
					var parsed = JSON.parse(body);
					if(parsed.RemoteException){
						cb(null, {table: c, count: 0});
					}else{
						var list = parsed.FileStatuses.FileStatus;
						if(list.length > 0){
							var total = 0;
							async.eachSeries(list, function(file, cb2){
								var str = path.resolve(c, file.pathSuffix);
								var cmd2 = "http://"+ip+":50070/webhdfs/v1"+str+"?op=OPEN";
								var i = 0;
								var req = request.get(cmd2);
								req.on('error', function(err){
									cb2();
								});
								req.on('data', function(chunk){
									var st = chunk.toString();
									var s = st.split('\n');
									var leng = s.length -1;
									i += leng;
								});
								req.on('end', function(){
									total += i;
									cb2();
								});
							}, function(){
								console.log('tick');
								sock.emit('tick');
								cb(null, {table: c, count: total});
							});
						}else{
							sock.emit('tick');
							cb(null, {table: c, count: 0});
						}
					}
				});
			}, function(err, result){
				sock.emit('countDone', result);
			});
		});
	}*/
}

var r = require('./reports.js');
