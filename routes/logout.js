var express = require('express');
var router  = express.Router();

router.get('/', function (req, res) {
	delete req.session.user_id;
	res.redirect('/login');
});

module.exports = router;