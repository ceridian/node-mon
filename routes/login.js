var express = require('express');
var router  = express.Router();
var a = require('../lib/auth.js');

router.get('/', function(req, res) {
	console.log('get, /login');
	res.render('login');
});

router.post('/', function(req, res){
	console.log('post, /login');
	var body = req.body;
	var user = body.user;
	var pass = body.pass;
	a.auth(user, pass, function(err, d){
		if(err){
			console.log(err);
			res.send(err.message);
		}else{
			console.log('ok');
			req.session.user_id = d[0].displayName[0];
			res.send('ok');
		}
	});
});

module.exports = router;
	