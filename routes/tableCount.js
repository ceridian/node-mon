var express = require('express');
var router  = express.Router();
var m = require('../lib/maint.js');

router.post('/', function(req, res) {
	var body = req.body;
	m.tableUpdate(body, function(result){
		res.send(result);
	});
});

module.exports = router;