var models  = require('../models');
var express = require('express');
var router  = express.Router();
var r = require('../lib/requests.js');
var async = require('async');
var d3 = require('d3');

router.get('/', function(req, res) {
	models.CLUSTER.findAll().success(function(clusters) {
		res.send(clusters);
	});
});

module.exports = router;