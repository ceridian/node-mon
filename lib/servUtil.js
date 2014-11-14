var models = require('../models');
var fs = require('fs');

module.exports = {
	clearOldCounts: function(){
		var today = new Date();
		var past = today.getPreviousDate(7);  
		models.COUNT.findAll({where: {createdAt: { lt: past }}}).complete(function(err, data){
			console.log(err, data);
		});
	}, 

	error: function(error, cb){
		console.log(error);
		lib.stamp(function(d,t){
			fs.appendFile('/var/log/monitor/error-'+d+'.log', error+' \t'+t+'\n', function(err){
				if(err) console.log('logging err: ', err);
				cb(0);
			});
		});
	},

	skipped: function(info, why, cb){
		lib.stamp(function(d,t){
			fs.appendFile('/var/log/monitor/skipped-'+d+'.log', info+' \t'+t+'\t'+why+'\n', function(err){
				if(err) console.log('logging err: ', err);
				cb(0);
			});
		});
	}, 

	good: function(what, info, cb){
		lib.stamp(function(d,t){
			fs.appendFile('/var/log/monitor/good-'+d+'.log', what+' \t'+info+' \t'+t+'\n', function(err){
				if(err) console.log('logging err: ', err);
				cb(0);
			});
		});
	},

	stamp: function(cb){
		var d = new Date;
		var day = d.getDate();
		var mon = d.getMonth();
		var month = mon + 1;
		var year = d.getFullYear();
		var hour = d.getHours();
		var min = d.getMinutes();
		var sec = d.getSeconds();
		cb(month+'-'+day+'-'+year, hour+':'+min+':'+sec);
	}
}

var lib = require('./servUtil.js');