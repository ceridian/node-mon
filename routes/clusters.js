var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.post('/create', function(req, res) {
	models.CLUSTER.create({
		name: req.param('cluster'),
		ipAddr: req.param('ipAddr')
	}).success(function() {
		res.redirect('/');
	});
});

router.get('/:cluster_id/destroy', function (req, res) {
	models.CLUSTER.find({
		where: { id: req.param('cluster_id') }
	}).success(function(cluster) {
		cluster.destroy().success(function() {
			res.redirect('/');
		});
	});
});


module.exports = router;