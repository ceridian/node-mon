var fs = require('fs');
var request = require('request');
var async = require('async');
var status = require('./requests.js');
var path = require('path');
var models = require('../models');
var util = require('./servUtil.js');

module.exports = {
	countRows: function(callback){
		r.setup(function(info){
			console.log(info);
		});
	},

	setup: function(callback){
		models.CLUSTER.findAll().complete(function(err, clusters){
			//id,name,ipAddr,hcatPort,hdfsPort,logPort
			if(err){
				util.error(err, function(){
					
				});
			}else{
				async.map(clusters, function(cluster, cb){
					var load = {};
					load.id = cluster.id;
					load.cluster = cluster.name;
					load.ip = cluster.ipAddr;
					load.hcatPort = cluster.hcatPort;
					load.hdfsPort = cluster.hdfsPort;
					load.logPort = cluster.logPort;
					r.dbParse(cluster.ipAddr, function(err, res){
						if(err){

						}else{
							load.tabs = res;
							status.counts(load.ip, load.logPort, load, function(info){
								cb(null, info);
							});
						}
					});
				}, function(err, res){
					callback(res);
				});
			}
		});
	},
/* // example 1
{ 
	id: 1,
  	cluster: 'swordfish',
  	ip: '10.200.1.20',
  	hcatPort: 50111,
  	hdfsPort: 50070,
  	logPort: 3000,
  	dbs:{ 
  		aptadvdbo:[ 
	      	'actad',
	        'actaddress',
	        'actadstatus',
	        'actadzone',
        	...
       	],
       	db2:[...]
	}
*/

	dbParse: function(ip, callback){
		status.databases(ip, function(error, dbs){
			if(error){
				util.error(error, function(){
					callback(error, null);
				});
			}else{
				var hold = {};
				async.each(dbs, function(db, cb){
					status.tables(ip, db, function(err, tabs){
						if(err){
							util.error(error, function(){
								cb();
							});
						}else{
							if(tabs){
								async.each(tabs, function(tab, cb2){
									hold[tab] = db;
									cb2();
								}, function(){
									cb();
								});
							}else{
								console.log('?');
								console.log(ip, db, tabs);
								cb();
							}
						}
					});
				}, function(){
					callback(null, hold);
				});
			}
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
	}
}

var r = require('./reports.js');