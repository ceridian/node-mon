var express = require('express');
var router  = express.Router();
var d = require('../lib/reports.js');

router.get('/', function(req, res) {
	var body = req.body;
	d.countRows(function(result){
		res.send(result);
	});
});

module.exports = router;