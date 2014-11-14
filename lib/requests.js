var fs = require('fs');
var request = require('request');
var async = require('async');
var util = require('./servUtil.js');

module.exports = {
	alerts: function(ip, cluster, callback){
		request.get({
			'url': 'http://'+ip+':8080/api/v1/clusters/'+cluster+'/hosts?fields=*',
			'auth':{
				'user': 'admin',
				'pass': 'admin'
			}
		}, function(err, response, body){
			if (err){
				util.error(err, function(){
					callback(err, null);
				});
			}else{
				var parse = JSON.parse(body);
				var alert = {
					"CRITICAL" : 0,
					"OK" : 0,
					"PASSIVE" : 0,
					"WARNING" : 0
				}
				async.each(parse.items, function(item, cb){
					var alerts = item.alerts;
					if(alerts){ // only defined if alerts on cluster 
						var sum = alerts.summary;
						alert.CRITICAL += sum.CRITICAL;
						alert.OK += sum.OK;
						alert.PASSIVE += sum.PASSIVE;
						alert.WARNING += sum.WARNING;
					}
					cb();
				}, function(){
					var load = {};
					load.ip = ip;
					load.cluster = cluster;
					load.alerts = alert;
					callback(null, load);
				});
			}
		});
	},

	services: function(ip, cluster, callback){
		request.get({
			'url': 'http://'+ip+':8080/api/v1/clusters/'+cluster+'/services?fields=*',
			'auth':{
				'user': 'admin',
				'pass': 'admin'
			}
		}, function(err, response, body){
			if (err){
				util.error(err, function(){
					callback(err, null);
				});
			}else{
				var parse = JSON.parse(body);
				async.filter(parse.items, function(item, cb){
					var hold = item.ServiceInfo;
					var name = hold.service_name;
					if(name == 'HIVE'){
						cb(true);
					}else if(name == 'MAPREDUCE2'){
						cb(true);
					}else if(name == 'YARN'){
						cb(true);
					}else{
						cb(false);
					}
				}, function(result){
					async.map(result, function(s, cb){
						var alerts = s.alerts;
						if(!alerts){
							var sum = {
								"CRITICAL" : 0,
								"OK" : 0,
								"PASSIVE" : 0,
								"WARNING" : 0
							};
							var hold = s.ServiceInfo;
							var name = hold.service_name;
							var cluster = hold.cluster_name;
							var payload = {
								name: name,
								sum: sum,
								cluster: cluster
							};
							cb(null, payload);
						}else{
							var sum = alerts.summary;
							var hold = s.ServiceInfo;
							var name = hold.service_name;
							var cluster = hold.cluster_name;
							var payload = {
								name: name,
								sum: sum,
								cluster: cluster
							};
							cb(null, payload);
						}
					}, function(err, results){
						var name = results[0].cluster;
						var load = {
							name: name
						};
						load.hosts = results;
						callback(null,load);
					});
				});
			}
		});
	},

	ramSpace: function(ip, cluster, callback){
		var url = "http://"+ip+":8080/api/v1/clusters/"+cluster+"/services/HDFS/components/DATANODE";
		request.get({
			'url': url,
			'auth':{
				'user': 'admin',
				'pass': 'admin'
			}
		}, function(err, response, body){
			if(err){
				util.error(error, function(){
					callback(error, null);
				});
			}else{
				var parsed = JSON.parse(body);

				var diskFree = parsed.metrics.disk.disk_free;
				var diskTotal = parsed.metrics.disk.disk_total;
				var diskUsed = diskTotal - diskFree;

				var memFree = parsed.metrics.memory.mem_free;
				var memTotal = parsed.metrics.memory.mem_total;
				var memUsed = memTotal - memFree;

				var load = {
					cluster: cluster,
					space: [memFree,memUsed],
					type: 'RAM'
				};

				var load2 = {
					cluster: cluster,
					space: [diskFree,diskUsed],
					type: 'HDFS'
				};

				var payload = [];
				payload.push(load);
				payload.push(load2);

				var p = {
					cluster: cluster,
					children: payload
				}
				
				callback(null,p);
			}
		});
	},

	describe: function(obj, cb){
		var ip = obj.ip;
		var table = obj.table;
		var db = obj.db;
		var cmd = 'http://'+ip+':50111/templeton/v1/ddl/database/'+db+'/table/'+table+'?user.name=root&format=extended';
		request.get(cmd, function(err, response, body){
			if(err){
				util.error(error, function(){
					cb(error, null);
				});
			}else{
				var parsed = JSON.parse(body);
				cb(null, parsed);
			}
		});
	},

	databases: function(ip, cb){
		var cmd = 'http://'+ip+':50111/templeton/v1/ddl/database?user.name=root';
		console.log(cmd);
		request.get(cmd, function(error, response, body){
			if(error){
				util.error(error, function(){
					cb(error, null);
				});
			}else{
				var parsed = JSON.parse(body);
				var dbs = parsed.databases;
				cb(null, dbs);
			}
		});
	},

	tables: function(ip, db, cb){
		var cmd = 'http://'+ip+':50111/templeton/v1/ddl/database/'+db+'/table?user.name=root';
		request.get(cmd, function(error, response, body){
			if(error){
				util.error(error, function(){
					cb(error, null);
				});
			}else{
				var parsed = JSON.parse(body);
				var tabs = parsed.tables;
				cb(null, tabs);
			} 
		});
	},

	files: function(ip, port, cb){
		//var cmd = 'http://'+ip+':'+port+'/files';
		request.get('http://'+ip+':3000/files', function(err, res, body){
			if(err){
				console.log(err);
				util.error(err, function(){
					cb(err, null);
				});
			}else{
				var parsed = JSON.parse(body);
				cb(null, parsed.files);//parsed.files);
			} 
		});
	},

	counts: function(ip, port, info, callback){
		request.post({
			'url': 'http://'+ip+':'+port+'/count',
			'headers': {'content-type' : 'application/json'},
			'body': JSON.stringify(info)
		}, function (err, res, body){
			if(err){
				console.log(err);
				util.error(error, function(){
					callback(err, null);
				});
			}else{
				var parsed = JSON.parse(body);
				var files = parsed.files;
				console.log(files);
				//callback(null, files);
			}
		});
	}
}