var express = require('express');
var router  = express.Router();
var d = require('../lib/data.js');

router.post('/', function(req, res) {
	var body = req.body;
	d.columns(body, function(result){
		res.send(result);
	});
});

module.exports = router;