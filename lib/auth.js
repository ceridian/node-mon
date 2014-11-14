var LDAP = require('LDAP');

module.exports = {
	checkAuth: function(req, res, next){ 
		if (!req.session.user_id){
			console.log('redirect');
			res.redirect('login');
			next();
		}else{
			console.log('not redirecting');
			next(); 
		}
	},

	auth: function(user, pass, callback){
		//var u = 'monitor';
		//var p = 'thispasswdsucks';
		if(!user || !pass){
			callback('Username, and password required.', null);
		}else{
			var options = {
				uri: 'ldap://10.1.1.10'
			}

			var bind_options = {
				binddn: 'uid='+user+',cn=users,cn=accounts,dc=drni-hdh,dc=office',
				password: pass
			}

			var search_options = {
				base: 'cn=users,cn=accounts,dc=drni-hdh,dc=office',
				filter: 'uid='+user,
				attrs: '*',

			}

			var ldap = new LDAP(options);

			ldap.open(function(err) {
				if (err) {
					callback(err, null);
					//throw new Error('Can not connect');
				}else{
					ldap.simplebind(bind_options, function(err){
						if(err) {
							callback(err, null);
						}else{
							ldap.search(search_options, function(err, data){
								if(err){
									console.log(err);
									callback(err, null);
								}else{
									callback(null, data);
								}
							});
						}
					});
				}
			});
		}
    }
}