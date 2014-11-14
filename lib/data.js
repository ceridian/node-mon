var request = require('request');
var async = require('async');
var fs = require('fs');

//var ip = '172.16.2.2';
var port = 50111;
var user = 'root';
var dir = '/user/root/out';

module.exports = {
	root: function(bod, cb){
		var ip = bod.ip;
		console.log(bod);
		var cmd = "http://"+ip+":"+port+"/templeton/v1/ddl/database?user.name="+user;
		console.log(cmd);
		request.get({
			'url': cmd,
		}, function(err, response, body){
			if(err){
				console.log(err);
				cb('error');
			}else{
				var parsed = JSON.parse(body);
				cb(parsed.databases);
			}
		});
	},

	child: function(bod, cb){
		console.log(bod);
		var ip = bod.ip;
		var db = bod.db
		var cmd = "http://"+ip+":"+port+"/templeton/v1/ddl/database/"+db+"/table?user.name="+user;
		console.log('child: '+cmd);
		request.get({
			'url': cmd,
		}, function(err, response, body){
			console.log(body);
			var parsed = JSON.parse(body);
			var tables = parsed.tables;
			async.map(tables, function(tab, cb){
				var table = {};
				table.text = tab;
				table.type = 'table';
				table.icon = 'png/glyphicons_119_table.png';
				table.children = true;
				cb(null, table);
			}, function(err, result){
				cb(result);
			});
		});
	},

	columns: function(bod, cb){
		var ip = bod.ip;
		var db = bod.db;
		var table = bod.table;
		var cmd = "http://"+ip+":"+port+"/templeton/v1/ddl/database/"+db+"/table/"+table+"/?user.name="+user+"&format=extended";
		console.log('columns: '+cmd);
		request.get({
			'url': cmd,
		}, function(err, response, body){
			if(err){
				console.log(err);
			}else{
				var parsed = JSON.parse(body);
				var columns = parsed.columns;
				var location = parsed.location;
				console.log(location);
				if(!location){
					cb()
				}
				var loc = location.split(':8020');
				var payload = {};
				payload.loc = loc[1];
				payload.ip = ip;
				//d.count(payload, function(tag){
					var hold = [];
					async.each(columns, function(col, cb){
						var column = {};
						column.text = col.name;
						column.name = col.name;
						column.type = col.type;
						column.table = table;
						column.db = db;
						column.ip = ip;
						column.icon = 'png/Pillar_column_icon.png';
						hold.push(column);
						cb();
					}, function(){
						cb(hold);
					});
				//});
			}
		});
	},

	/*count: function(bod, cb){
		var s = bod.loc;
		var ip = bod.ip;
		if
		var cmd = 'http://'+ip+':3000/count'
		var payload = {
			"str": s
		};
		var str = JSON.stringify(payload);
		request({
			'url': cmd,
			'method': 'post',
			'json': payload,
		}, function(err, res, body){
			if(err) console.log(err);
			console.log(body);
			if(body){
				var cnt = {
					count: body.count,
					icon: 'png/glyphicons_114_list.png',
					text: 'Row Count: '+body.count,
					type: 'info'
				};
				cb(cnt);
			}else{
				cb(null);
			}
		});
	},*/

	query: function(bod, cb){
		var bod = req.body;
		var db = bod.db;
		var table = bod.table;
		var cols = bod.cols;
		var str = cols.join();
		var select = "SELECT "+str+" FROM "+table+";";
		request.post('http://'+ip+':50111/templeton/v1/hive?user.name=root',
		{form:{
			"callback": "http://10.4.10.240:4000",
			"execute": select,
			"statusdir": dir
		}},
		function(err, resp, body){
			if(err) console.log(err);
			console.log('body: '+body);
			var parsed = JSON.parse(body);
		});
	}
}

var d = require('./data.js');