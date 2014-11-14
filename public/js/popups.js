
function hiveBrowser(){
	console.log('hiveBrowser');
	var ip = $('#IP').text();
	console.log(ip);
	var load = {};
	load.ip = ip;
	$.ajax({
		url: "/root",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(load),
		processData: false,
		complete: function(root){
			var parsed = JSON.parse(root.responseText);
			var h = '<div class="tree well"><ul>';
			parsed.forEach(function(v){
				var str = '<li><div id="'+v+'"><input type="checkbox" class="box boxDB" id="BOX'+v+'" /><span class="dbClose"><img /> '+v+' </span></div></li>';
				h += str;
			});
			h += '</ul></div>';
			$('#browserHIVE').html(h);
			$('.dbClose').on('click', function (e) {
				var targ = e.currentTarget;
				var cl = targ.className;
				var id = $(targ).parent().attr('id');
				console.log($('#'+id).text());
				if(cl == 'dbOpen'){
					$('#'+id+'>span').addClass('dbClose').removeClass('dbOpen');
					dbClose(id, ip);
				}else{
					$('#'+id+'>span').addClass('dbOpen').removeClass('dbClose');
					dbOpen(id, ip);
				}
			});
		}
	});
}

function dbClose(id, ip){
	$('#'+id+'>ul').hide();
}
function dbOpen(id, ip){
	var load = {};
	load.ip = ip;
	load.db = id;
	console.log(load);
	$.ajax({
		url: "/child",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(load),
		processData: false,
		complete: function(data){
			var tables = JSON.parse(data.responseText);
			var h = '<ul class="tables">';
			tables.forEach(function(v){
				var str = '<li><div id="'+v.text+'"><input type="checkbox" class="box boxTab" id="TBOX'+v.text+'" /><span class="tabClose"><img /> '+v.text+' </span></div></li>';
				h += str;
			});
			h += '</ul>';
			$('#'+id+'>ul').remove();
			$('#'+id).append(h);
			$('.tabClose').on('click', function (e) {
				var targ = e.currentTarget;
				var cl = targ.className;
				var tab = $(targ).parent().attr('id');
				console.log($('#'+id).text());
				if(cl == 'tabOpen'){
					$('#'+tab+'>span').addClass('tabClose').removeClass('tabOpen');
					tabClose(tab);
				}else{
					$('#'+tab+'>span').addClass('tabOpen').removeClass('tabClose');
					tabOpen(id, tab, ip);
				}
			});
		}
	});
}

function tabClose(id){
	$('#'+id+'>ul').hide();
}
function tabOpen(id, tab, ip){
	var load = {};
	load.ip = ip;
	load.db = id;
	load.table = tab;
	console.log(load);
	$.ajax({
		url: "/columns",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(load),
		processData: false,
		complete: function(data){
			var columns = JSON.parse(data.responseText);
			var h = '<ul class="columns">';
			columns.forEach(function(v){
				var str = '<li><div id="'+v.text+'"><input type="checkbox" class="box boxCol" id="cBOX'+v.text+'" /><span class="column"><img /> '+v.text+' </span></div></li>';
				h += str;
			});
			h += '</ul>';
			$('#'+tab+'>ul').remove();
			$('#'+tab).append(h);
		}
	});
}
function dirClose(id, ip){
	$('#'+id+'>ul').hide();
}
function dirOpen(id, ip){
	var load = {};
	load.ip = ip;
	load.targ = id;
	console.log(load);
	var s = '/'+id;
	var re = s.replace(/\_/g, '/');
	$.ajax({
		url: '/hdfs',
		data: JSON.stringify(re),
		type: "POST",
		contentType: "application/json",
		processData: false,
		complete: function(d){
			var parsed = JSON.parse(d.responseText);
			var h = '<ul>';
			var c = parsed.children;
			c.forEach(function(v){
				var path = v.path;
				var cut = path.slice(1,path.length);
				console.log(cut);
				var re = cut.replace(/\//g, '_');
				console.log(re);	
				if(v.type == 'DIRECTORY'){
					var str = '<li><div id="'+re+'"><span class="dirClose"><img /> '+v.text+' </span></div></li>';
					h += str;
				}else{
					var str = '<li><div id="'+re+'"><span class="file"><img /> '+v.text+' </span></div></li>';
					h += str;
				}
			});
			h += '</ul>';
			$('#'+id+'>ul').remove();
			$('#'+id).append(h);

			$('.dirClose').on('click', function (e) {
				var targ = e.currentTarget;
				var cl = targ.className;
				var id = $(targ).parent().attr('id');
				console.log($('#'+id).text());
				if(cl == 'dirOpen'){
					$('#'+id+'>span').addClass('dirClose').removeClass('dirOpen');
					dirClose(id, ip);
				}else{
					$('#'+id+'>span').addClass('dirOpen').removeClass('dirClose');
					dirOpen(id, ip);
				}
			});
		}
	});
}

function hdfsBrowser(ip, targ){
	var str = {
		ip: ip,
		targ: targ
	}
	$.ajax({
		url: '/hdfs',
		data: JSON.stringify(str),
		type: "POST",
		contentType: "application/json",
		processData: false,
		complete: function(d){
			var parsed = JSON.parse(d.responseText);
			var h = '<div class="tree well">';
			var c = parsed.children;
			c.forEach(function(v){
				var path = v.path;
				var cut = path.slice(1,path.length);
				console.log(cut);
				var re = cut.replace(/\//g, '_');
				console.log(re);

				if(v.type == 'DIRECTORY'){
					var str = '<li><div id="'+re+'"><span class="dirClose"><img /> '+v.text+' </span></div></li>';
					h += str;
				}else{
					var str = '<li><div id="'+re+'"><span class="file"><img /> '+v.text+' </span></div></li>';
					h += str;
				}
			});
			h += '</ul></div>';
			$('#browserHDFS').html(h);
			$('.dirClose').on('click', function (e) {
				var targ = e.currentTarget;
				var cl = targ.className;
				var id = $(targ).parent().attr('id');
				console.log($('#'+id).text());
				if(cl == 'dirOpen'){
					$('#'+id+'>span').addClass('dirClose').removeClass('dirOpen');
					dirClose(id, ip);
				}else{
					$('#'+id+'>span').addClass('dirOpen').removeClass('dirClose');
					dirOpen(id, ip);
				}
			});
			/*{ path: '/',
			  text: 'root',
			  type: 'DIRECTORY',
			  children:
			   [ { text: 'app-logs', type: 'DIRECTORY', children: true },
			     { text: 'apps', type: 'DIRECTORY', children: true },
			     { text: 'mapred', type: 'DIRECTORY', children: true },
			     { text: 'maryland', type: 'DIRECTORY', children: true },
			     { text: 'mr-history', type: 'DIRECTORY', children: true },
			     { text: 'test', type: 'DIRECTORY', children: false },
			     { text: 'tmp', type: 'DIRECTORY', children: true },
			     { text: 'user', type: 'DIRECTORY', children: true },
			     { text: 'washington_md_county_properties.csv',
			       type: 'FILE',
			       children: false } ] }*/

		}
	});
	
}
/*function sendCols(){
	console.log('good');
	var cols = $('#browserHIVE').jstree().get_selected('full');
	var load = {};
	cols.forEach(function(v, i){
		var org = v.original;
		var ip = org.ip;
		var db = org.db;
		var tab = org.table;
		var col = org.text;
		if(!load[ip]){
			load[ip] = {};
		}
		if(!load[ip][db]){
			load[ip][db] = {};
		}
		if(!load[ip][db][tab]){
			load[ip][db][tab] = [];
		}
	});
	cols.forEach(function(v, i){
		var org = v.original;
		var ip = org.ip;
		var db = org.db;
		var tab = org.table;
		var col = org.text;
		load[ip][db][tab].push(col);
	});
	joinPrompt(load);
}
function joinPrompt(obj){
	var hold = '<div class="join">';
	var keysIP = Object.keys(obj);
	keysIP.forEach(function(ip){
		hold += '<p>Cluster: '+ip+'</p><div style="display: inline;boarder:1px solid black;" id="'+ip+'">';
		var dbs = obj[ip];
		var dbsKeys = Object.keys(dbs);
		//dbsKeys.forEach(function(db){
		for(var j=0;j<dbsKeys.length;j++){
			var db = dbsKeys[j];
			hold += '<p>Database: '+db+'</p><div class="join" id="'+db+'">';
			var tables = dbs[db];
			var tabKeys = Object.keys(tables);
			//tabKeys.forEach(function(table){
			for(var k=0;k<tabKeys.length;k++){
				var table = tabKeys[k];
				hold += '<div class="join"><p>Table: '+table+'</p><table><thead><tr><td>Key</td><td>Column</td></tr></thead><tbody>';
				var columns = tables[table];
				for(var i=0;i<columns.length;i++){
					var col = columns[i];
					var select = "<tr><td><select><option value='0'></option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option></select></td><td>"+col+"</td></tr>";

					hold += select;
					if(i == columns.length -1){
						hold += "</tbody></table></div>";
					}
				}
				if(k == tabKeys.length -1){
					hold += "</div>";
				}
			}
			if(j == dbsKeys.length -1){
				hold += "</div>";
			}
		}
	});
	hold += "</tbody></table>";
	console.log(hold);
	$('#joinBody').html(hold);
	$('#joinStart').modal('show');
}*/

/*function hdfsDialog(info, ip, name){
	var hold = JSON.parse(info.responseText);
	var data = hold.info;
	var ip = hold.ip;

	$('#browserHDFS').jstree({
		'core': {
			'theme': {
				'variant': 'large'
			},
			'multiple': false,
			'check_callback': true,
			'data': data
		},
		'plugins': [ 'wholerow' ]
	});
	$('#browserHDFS').on('changed.jstree', function (e, data){
		var node = $('#browserHDFS').jstree('get_node', data.selected[0]);
		var path = node.original.path;
		var load = {
			path: path,
			ip: ip
		};
		console.log(load);
		$.ajax({
			url: '/read',
			data: JSON.stringify(load),
			type: "POST",
			contentType: "application/json",
			processData: false,
			complete: function(d){
				var t = "<div style='background:white;border:1px solid black;'><h3>File Preview</h3><pre>"+d.responseText+"</pre></div>";
				$('#tableHDFS').append(t);
			}
		});
	});
}
function hiveDialog(info, ip, name){
	var hold = JSON.parse(info.responseText);
	var data = hold.info;
	var ip = hold.ip;

	$('#browserHIVE').jstree({
		'core': {
			'theme': {
				'variant': 'large'
			},
			'multiple': false,
			'check_callback': true,
			'data': data
		},
		'plugins': [ 'wholerow' ]
	});
	$('#browserHIVE').on('changed.jstree', function (e, data){
		var node = $('#browserHIVE').jstree('get_node', data.selected[0]);
		var org = node.original;
		var text = org.text;
		var db = org.db;
		var load = {
			table: text,
			ip: ip,
			db: db
		};
		$('#infoHIVE').val(JSON.stringify(load));
		$('#selectHIVE').dialog('open');
		
	});
}
function infoHIVE(){
	$('#selectHIVE').dialog('close');
	var load = $('#infoHIVE').val();
	$.ajax({
		url: '/table',
		data: load,
		type: "POST",
		contentType: "application/json",
		processData: false,
		complete: function(d){
			var res = JSON.parse(d.responseText);
			var result = res.columns;
			var count = res.count;
			console.log(count);
			var hold = "<div style='background:white;border:1px solid black;'><h3>Table Info</h3><br><h3>Rows: "+count+"</h3><table><thead><tr><td>Column Name</td><td>Column Type</td></tr><thead><tbody>";
			result.forEach(function(col){
				hold += "<tr><td>"+col.name+"</td><td>"+col.type+"</td></tr>";
			});
			hold += "</tbody></table></div>";
			$('#tableHIVE').append(hold);
		}
	});
}
function queryHIVE(){
	$('#queryHIVE').dialog('close');
	$('#qWindow').show();
}*/