var r = require('../lib/requests.js');
var request = require('request');

describe('requests.js', function(){
	describe('alerts()', function(){
		it('should return exp object', function(done){
			r.alerts('10.200.1.20', 'swordfish', function(e,d){
				var exp = { ip : '10.200.1.20', cluster : 'swordfish', alerts : { CRITICAL : 0, OK : 0, PASSIVE : 0, WARNING : 0 }}; 
				expect(d).toEqual(exp);
				expect(e).toBeNull();
				done();
			});
		});
	});

	describe('services()', function(){
		it('should return object with array', function(done){
			var exp = { name : 'swordfish', hosts : [ { name : 'HIVE', sum : { CRITICAL : 0, OK : 0, PASSIVE : 0, WARNING : 0 }, cluster : 'swordfish' }, { name : 'MAPREDUCE2', sum : { CRITICAL : 0, OK : 0, PASSIVE : 0, WARNING : 0 }, cluster : 'swordfish' }, { name : 'YARN', sum : { CRITICAL : 0, OK : 0, PASSIVE : 0, WARNING : 0 }, cluster : 'swordfish' } ] };
			r.services('10.200.1.20', 'swordfish', function(e,d){
				expect(d).toEqual(exp);
				expect(e).toBeNull();
				done();
			});
		});
	});

	describe('ramSpace()', function(){
		it('should return object with array', function(done){
			r.ramSpace('10.200.1.20', 'swordfish', function(e,d){
				expect(d).toBeDefined();
				expect(e).toBeNull();
				done();
			});
		});
	});

	//describe: function(obj, cb){
	//databases: function(ip, cb){
	//tables: function(ip, db, cb){
	describe('describe()', function(){
		it('should return full description of table', function(done){
			var obj = {};
			obj.ip = '10.200.1.20';
			obj.db = 'mariachi';
			obj.table = 'items';
			var exp = { minFileSize : 9481445, totalNumberFiles : 1, location : 'hdfs://name.swordfish.local:8020/user/root/mariachi/items', outputFormat : 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', lastAccessTime : 1413816191016, lastUpdateTime : 1413816191034, columns : [ { name : 'upc', type : 'string' }, { name : 'description', type : 'string' }, { name : 'department', type : 'string' }, { name : 'category', type : 'string' }, { name : 'size', type : 'string' }, { name : 'size_desc', type : 'string' } ], maxFileSize : 9481445, partitioned : false, owner : 'root', inputFormat : 'org.apache.hadoop.mapred.TextInputFormat', totalFileSize : 9481445, database : 'mariachi', table : 'items', group : 'hdfs', permission : 'rwxr-xr-x' };
			r.describe(obj, function(e, d){
				expect(d).toEqual(exp);
				expect(e).toBeNull();
				done();
			});
		});
	});

	describe('databases()', function(){
		it('should return array of dbs', function(done){
			var exp = [ 'aptadvdbo', 'default', 'irena', 'mariachi', 'oracle', 'remote' ];
			r.databases('10.200.1.20', function(d){
				expect(d).toEqual(exp);
				done();
			});
		});
	});

	describe('tables()', function(){
		it('get laist of tables for db', function(done){
			var exp = [ 'card', 'customers', 'items', 'membersegments', 'orderitems', 'orders', 'segments', 'storedepartments', 'stores', 'vendorauth', 'vendorcost' ];
			r.tables('10.200.1.20', 'mariachi', function(d){
				expect(d).toEqual(exp);
				done();
			});
		});
	});
});

/*describe('/', function(){
	it('should return home.html', function(done){
		request("http://localhost:4000", function(error, response, body){
			expect(body).toBeDefined();
			done();
		});
	});
});
describe('/alerts', function(){
	it('should return defined', function(done){
		request("http://localhost:4000/alerts", function(error, response, body){
			expect(body).toBeDefined();
			done();
		});
	});
});
describe('/services', function(){
	it('should return defined', function(done){
		request("http://localhost:4000/services", function(error, response, body){
			expect(body).toBeDefined();
			done();
		});
	});
});
describe('/gauges', function(){
	it('should return defined', function(done){
		request("http://localhost:4000/gauges", function(error, response, body){
			expect(body).toBeDefined();
			done();
		});
	});
});*/