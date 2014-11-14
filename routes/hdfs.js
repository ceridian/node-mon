var models  = require('../models');
var express = require('express');
var router  = express.Router();
var h = require('../lib/hdfs.js');

router.post('/', function (req, res){
	var body = req.body;
	var targ = body.targ;
	var ip = body.ip;
	console.log(targ, ip);
	h.tree(targ, ip, function(d){
		console.log(d);
		res.send(d);
	});
});
module.exports = router;