var request = require('request');
var path = require('path');
var async = require('async');

module.exports = {
	tree: function(root, ip, callback){
		console.log('tree:', root, ip);
		var cmd = 'http://'+ip+':50070/webhdfs/v1/'+root+'?[user.name=root&]doas=hdfs&op=GETFILESTATUS';
		request.get({
			'url': cmd,
		}, function(err, response, body){
			var info = {};
			info.path = root;
			if(root == '/'){
				info.text = 'root';
			}else{
				info.text = path.basename(root);
			}
			if(err) {
				console.log('Access Denigned');
				info.message = 'Access Denigned';
				info.class = 'error';
				cb(info);
			}else{
				var parsed = JSON.parse(body);
				var stat = parsed.FileStatus;
				if(!stat){
					console.log('no stat');
					info.message = 'No Stat';
					info.type = 'error';
					cb(info);
				}else{
					if(stat.type == 'DIRECTORY'){
						info.type = 'DIRECTORY';
						h.dir(info, ip, function(d){
							callback(d);
						});
					}else{	
						info.type = 'File';
						h.file(info, ip, function(d){
							info.summary = d;
							callback(info);
						});
					}
				}
			}
		});
	},

	dir: function(info, ip, cb){
		var cmd = 'http://'+ip+':50070/webhdfs/v1/'+info.path+'?[user.name=root&]doas=hdfs&op=LISTSTATUS';
		request.get(cmd, function(err, res, body){
			console.log('request done');
			var root = info.path;
			if(root != '/'){
				root += '/';
			}
			if(err){
				console.log('error', err);
				info.message = 'List Error';
				info.type = 'error';
				cb(info);
			}else{
				var parse = JSON.parse(body);
				var hold = parse.FileStatuses;
				if(!hold){
					console.log('no hold');
					info.message = 'No File Statuses';
					info.type = 'error';
					cb(info);
				}else{
					var loop = hold.FileStatus;
					async.map(loop, function(i, cb2){
						var n = i.pathSuffix;
						var name = n.replace(/\n|\r/g, '');
						var str = info.path+name;
						var load = {};
						load.text = name;
						load.type = i.type;
						load.path = str;
						if(i.childrenNum > 0){
							load.children = true;
							cb2(null, load);
						}else{
							load.children = false;
							cb2(null, load);
						}
					}, function(err, result){
						info.children = result;
						cb(info);
					});
				}
			}
		});
	},

	file: function(root, ip, cb){
		var cmd = "http://"+ip+":50070/webhdfs/v1/"+root.path+"?user.name=hdfs&op=OPEN";
		var lines = 50;
		var h = '';
		var req = request(cmd);
		req.on('data', function(chunk){
			req.pause();
			h += chunk;
			var cut = h.split('\n');
			if(cut.length < lines){
				req.resume();
			}else{
				cb(h);
			}
		});
		req.on('err', function(err){
			console.log(err);
		});
	}
}

var h = require('./hdfs.js');