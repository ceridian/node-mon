var fs = require('fs');
var request = require('request');
var async = require('async');

module.exports = {
	logParse: function(c, cb){
		var ip = c.ip;
		var name = c.cluster;
		var cmd = "http://"+ip+":3000/log";
		console.log('user: '+cmd);
		if(name == 'swordfish'){
			cmd = "http://10.200.1.40:3000/log";
		}else{
			cmd = "http://"+ip+":3000/log";
		}
		request.get(cmd, function(err, resp, body){
			if(err) console.log('user: '+err);
			var cut = body.split('\n');
			lineCheck(cut, function(lines){
				if(lines.length > 0){
					lineParse(lines, function(li){
						var load = {
							info: c,
							lines: li
						};
						cb(load);
					});
				}else{
					var str = [{ str: 'No Connections Found', date: '', time: '',user: 'error' } ];
					var load = {
						info: c,
						lines: str
					};
					console.log('user: '+lines);
					cb(load);
				}
			});
		});
	}
}

function lineParse(arr, callback){
	async.map(arr, function(line, cb){
		var d = new Date();
		var year = d.getFullYear();
		var hold = {};
		var cut = line.split(']: ');
		var front = cut[0]; // Sep 27 20:00:35 name sshd[9338
		var back = cut[1]; //  Accepted publickey for root from 10.100.2.10 port 40271 ssh2
		var stamp = front.substring(0,6);
		var cut1 = back.split(' ');
		var user = cut1[3];

		hold.date = stamp+' '+year;
		hold.user = user;
		cb(null, hold);
		// line Sep 27 20:00:35 name sshd[9338]: Accepted publickey for root from 10.100.2.10 port 40271 ssh2
		/* output object
		{
			date: "2014-09-28T00:00:35.000Z", 
			user: "root"
		}*/
	}, function(err, res){
		callback(res);
	});
}

function lineCheck(arr, callback){
	async.filter(arr, function(line, cb){
		var index = line.indexOf('Accepted publickey');
		if(index > -1){
			cb(true);
		}else{
			cb(false);
		}
	}, function(result){
		callback(result);
	});
}