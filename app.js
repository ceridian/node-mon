#!/usr/bin/env node

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var session = require('express-session');
var https = require('https');
var express = require('express');
var debug = require('debug')('express-example');
var fs = require('fs');

var d = require('./lib/data.js');
var r = require('./lib/reports.js');
var re = require('./lib/requests.js');
var s = require('./lib/sockets.js');
var models = require('./models');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'jfalajgiyiaog7a90g7a6gyaoyga7g0aygalyhga' })); // session secret
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var login = require('./routes/login');
var clusters = require('./routes/clusters');
var alerts = require('./routes/alerts');
var services = require('./routes/services');
var gauges = require('./routes/gauges');
var users = require('./routes/users');
var config = require('./routes/config');
var root = require('./routes/root');
var child = require('./routes/child');
var columns = require('./routes/columns');
var counts = require('./routes/counts');
var rowCounts = require('./routes/rowCounts');
var hdfs = require('./routes/hdfs');
var tableCount = require('./routes/tableCount');

app.use('/', routes);
app.use('/login', login);
app.use('/alerts', alerts);
app.use('/clusters', clusters);
app.use('/services', services);
app.use('/gauges', gauges);
app.use('/users', users);
app.use('/config', config);
app.use('/root', root);
app.use('/child', child);
app.use('/columns', columns);
app.use('/counts', counts);
app.use('/rowCounts', rowCounts);
app.use('/hdfs', hdfs);
app.use('/tableCount', tableCount);

var options = {
	key: fs.readFileSync('./server.key'),
	cert: fs.readFileSync('./server.crt')
};

models.sequelize.sync().success(function () {
	var server = https.createServer(options, app);
	var io = require('socket.io')(server);
	server.listen(443);
	s.socketsInit(io);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

var m = require('./lib/maint.js');
m.timer();
//m.runner();
//module.exports = app;
module.exports = app;


// convinionce functions
Date.prototype.dateStamp = function() {  // outputs a string timestamp of a date  // yyyy-mm-dd hh:mm
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	var h = this.getFullHours().toString();
	var m = this.getFullMinutes().toString();
	return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]) +' '+h+':'+m; // padding
};
Date.prototype.getFullMinutes = function () {  // if min single diget add a 0
	if (this.getMinutes() < 10) {
		return '0' + this.getMinutes();
	}
	return this.getMinutes();
};
Date.prototype.getFullMonth = function(){  // if month single diget add a 0
	if (this.getMonth() < 9) {
		return '0' + (1 + this.getMonth());
	}
	return 1 + this.getMonth();
};
Date.prototype.getFullHours = function(){  // if hour single diget add a 0
	if (this.getHours() < 10) {
		return '0' + this.getHours();
	}
	return this.getHours();
};
Date.prototype.getFullDate = function(){  // if date single diget add a 0
	if (this.getDate() < 10) {
		return '0' + this.getDate();
	}
	return this.getDate();
};
Date.prototype.getPreviousDate = function(i){
	return new Date(new Date().setDate(new Date().getDate()-i));
};
