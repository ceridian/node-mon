
function display(info){
	// info {ip: "10.100.2.20", cluster: "lampfish", alerts: {CRITICAL: 0,OK: 63,PASSIVE: 2,WARNING: 0}}
	var name = info.cluster;
	var ip = info.ip;
	var alerts = info.alerts;

	//$('#IP'+name).text(ip);
	//$('#ACC'+name).text(name);
	y = 4;

	yScale = d3.scale.linear()
		.domain([0, y])
		.range([0, height]);

	var text = d3.select('#DIS'+name)
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append("g")
			.attr("transform", "translate(" + margin + "," + margin + ")");


	text.append('a')  // link to ambari
		.attr("xlink:href", "http://"+ip+':8080')
		.append("image")
		.attr("xlink:href", 'css/png/apache-ambari-project.png')
		.attr("x", 0)
		.attr("y", function(d) { return yScale(.5); })
		.attr('height', 70)
		.attr('width', 70);

	text.append('a')  // link to hdfs
		.attr("xlink:href", "#")
		.append("image")
		.attr("xlink:href", 'css/png/hadoop-logo-2.png')
		.attr("x", 0)
		.attr("y", function(d) { return yScale(1.5); })
		.attr('height', 70)
		.attr('width', 70)
		.on("click", function(d) {
			//$('#containerHDFS').dialog('open');
			$('#hdfsDis').modal('show');
			hdfsBrowser(ip, '/');
		});

	text.append('a')  // hive
		.attr("xlink:href", "#")
		.append("image")
		.attr("xlink:href", 'css/png/hive_logo_medium.png')
		.attr("x", 0)
		.attr("y", function(d) { return yScale(2.5); })
		.attr('height', 70)
		.attr('width', 70)
		.on("click", function() {
			//$('body').addClass("loading");
			$.ajax({
				url: '/root',
				data: JSON.stringify({ip: ip}),
				type: "POST",
				contentType: "application/json",
				processData: false,
				complete: function(data){
					$('#IP').text(ip);
					//$('body').removeClass("loading");
					hiveBrowser();
					$('#hiveDis').modal('show');
				}
			});
		});

	text.append('text')
		.attr("x", 0)
		.attr("y", function(d) { return yScale(0); })
		.attr('class', '.cn')
		.text(name.toUpperCase());

	headColor(name, alerts);
}

function headColor(name, alerts){
	var crit = alerts.CRITICAL;
	var ok = alerts.OK;
	var pass = alerts.PASSIVE;
	var warn = alerts.WARNING;
	if(crit > 0){
		$('#'+name+'Header').css('background-color', 'red');
	}else if(warn > 0){
		$('#'+name+'Header').css('background-color', 'yellow');
	}else{
		$('#'+name+'Header').css('background-color', 'green');
		$('#'+name+'Header > h4 > a').css('color', 'white');
	}
}

function service(cluster, hosts){
	var y = hosts.length + (hosts.length);

	var yScale = d3.scale.linear()
		.domain([0, y])
		.range([0, height - margin]);

	var str = '#SERV'+cluster;

	var group = d3.select(str)
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('position', 'absolute')
		.attr('top', '20px')
		.attr('left', '400px');
		
	var rect = group.selectAll('rect')
		.data(hosts)
		.enter()
		.append('g');

	rect.append('rect')
		.attr("x", function(d) { return xScale(0); })
		.attr("y", function(d, i) { return yScale(i*2+.4); })
		.attr('width', width)
		.attr('height', function(d) { return yScale(1); })
		.attr('id', function(d){ return d.name+d.cluster+'RECT'; });

	rect.append('text')
		.style('text-anchor', 'middle')
		.attr("x", function(d) { return xScale(1.5); })
		.attr("y", function(d, i) { return yScale(i*2+1); })
		.attr('id', function(d){ return d.name+cluster+'TEXT'; })
		.text(function(d){ return d.name; });

	serviceColor(cluster, hosts);
}

function serviceColor(cluster, hosts){
	hosts.forEach(function(v){
		var name = v.name;
		var sum = v.sum;
		var crit = sum.CRITICAL;
		var ok = sum.OK;
		var pass = sum.PASSIVE;
		var warn = sum.WARNING;
		if(crit > 0){
			d3.select('#'+name+cluster+'RECT')
				.attr('class', 'crit');
			d3.select('#'+name+cluster+'TEXT')
				.attr('class', 'crit');
			$('#'+name).css('background', 'red');
			$('.ui-state-default').css("color", 'white');
		}else if(warn > 0){
			d3.select('#'+name+cluster+'RECT')
				.attr('class', 'warn');
			d3.select('#'+name+cluster+'TEXT')
				.attr('class', 'warn');
			$('#'+name).css('background', 'yellow');
			$('.ui-state-default').css("color", 'black');
		}else{
			d3.select('#'+name+cluster+'RECT')
				.attr('class', 'good');
			d3.select('#'+name+cluster+'TEXT')
				.attr('class', 'good');
			$('#'+name).css('background', 'green');
			$('.ui-state-default').css("color", 'white');
		}
		headColor(name, sum);
	});
}

function gauges(C){
	var w = 190;
	var h = 190;
	var twoPi = 2 * Math.PI;
	var cluster = C.cluster;
	var hosts = C.children;

	var pie = d3.layout.pie()
		.value(function(d){ return d;});

	var arc = d3.svg.arc()
		.innerRadius(40)  
		.outerRadius(rad);

	var div = d3.select('#DIAL'+cluster)
		.selectAll('svg')
		.data(hosts)
		.enter()
		.append('svg')
		.attr('width', w)
		.attr('height', h)
		.style('display', 'block')
		.append('g')
			.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
			.attr('id', function(d){
				return d.cluster+d.type;
			});

	div.append('text')
		.attr("dy", ".35em")
  		.attr("text-anchor", "middle")
  		.text(function(d){ return d.type;});

 	var path = div.selectAll("path")
 		.data(function(d){return pie(d.space);})
		.enter()
		.append('path')
		.attr("d", arc)
		.style('fill', function(d, i3){ 
			if(i3 == 1){
				var start = d.startAngle;
				var end = d.endAngle;
				var dif = end - start;
				var div = Math.round((dif / twoPi)*100);
				if(div < 86){
					return 'green';
				}else{
					var alerts = {
						CRITICAL: 0,
						WARNING: 1
					};
					headColor(name, alerts)
					return 'yellow';
				}
			}else{
				return 'black';
			}
		})
		.append("title")
		.text(function(d, i3){ 
			var start = d.startAngle;
			var end = d.endAngle;
			var dif = end - start;
			var div = Math.round((dif / twoPi)*100);
			if(i3 == 0){
				return 'Available: '+div+'%';
			}else{
				return 'Used: '+div+'%';
			}
		})
		.each(function(d) { this._current = d; });
}

function gaugesUpdate(c){
	var w = 190;
	var h = 190;
	var twoPi = 2 * Math.PI;
	var cluster = c.cluster;
	var hosts = c.children;

	var pie = d3.layout.pie()
		.value(function(d){ return d;});

	var arc = d3.svg.arc()
		.innerRadius(40)  
		.outerRadius(rad);

	var arcs = d3.select(this).selectAll('path').data(function(d){return pie(d.space);});

	arcs.attr('d', arc);
	
}
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate)
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

function users(c){
	var wid = 600;
	var info = c.info;
	var users = info.user;
	var y = users.length;
	var name = info.cluster;
	var ip = info.ip;
	var lines = c.lines;
	var today = new Date();
	var begin = new Date();
	var columns = 7;
	begin.setDate(begin.getDate() - columns);
	var year = today.getFullYear();
	var h = 400;
	

	var setup = {};
	users.forEach(function(v, i){
		if(v == 'error'){

		}else{
			setup[v] = i + 1;
		}
	});

	var count = 0;
	var days = {};
	var parseDate = d3.time.format("%b %e %Y").parse;//T%H:%M:%S.%LZ").parse;
	var hold = [];

	var outDate = d3.time.format("%Y-%m-%d");

	var tip = new d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>User:</strong> <span>"+d.user+"</span><br><strong>Date:</strong> <span>"+outDate(d.date)+"</span>";
		});


	lines.forEach(function(v, i){
		//v // {date: "2014-09-28T00:00:35.000Z", user: "root"}
		var user = v.user;
		if(user == 'error'){

		}else{
			var d = parseDate(v.date);
			var id = setup[v.user];

			if(days[d]){
				if(days[d][id]){

				}else{
					days[d][id] = true;
					var load = {};
					load.date = d;
					load.id = setup[v.user];
					load.user = v.user;
					load.sent = true;
					hold.push(load); 
				}
			}else{
				var temp = {};
				temp[id] = true;
				days[d] = temp;
				var load = {};
				load.date = d;
				load.id = setup[v.user];
				load.user = v.user;
				load.sent = true;
				hold.push(load);
			}
		}
	});

	var ran = d3.extent(hold, function(d) { return d.date; });

	var start = ran[0];
	var end = ran[1];

	var dateArr = getDates(start, end);
	for(var i=0; i < dateArr.length; i++){
		var day = dateArr[i];
		var ids = days[day];
		if(ids){
			for(var i2=0;i2<users.length;i2++){
				var user = users[i2];
				var id = setup[user];
				if(ids[id]){

				}else{
					var load = {};
					load.date = day;
					load.id = id;
					load.user = user;
					load.sent = false;
					hold.push(load);
				}
			}
		}else{
			for(var i2=0;i2<users.length;i2++){
				var user = users[i2];
				var id = setup[user];
				var load = {};
				load.date = day;
				load.id = id;
				load.user = user;
				load.sent = false;
				hold.push(load);
			}
		}
	}

	var croped = h-margin*2;
	var uNum = users.length;
	var barHeight = croped / uNum;
	var barWidth = wid / (hold.length / users.length)-1;

	var x2 = d3.time.scale()
    	.rangeRound([0, wid - margin])
    	.domain(ran);

    var y2 = d3.scale.linear()
    	.range([0,h-80])
    	.domain([y,0]);

    var xAxis = d3.svg.axis()
	    .scale(x2)
	    .orient("bottom")
	    .ticks(d3.time.days)
	    .tickFormat(d3.time.format("%a %d"))

	var yAxis = d3.svg.axis()
	    .scale(y2)
	    .ticks(y)
	    .orient("left");

	var group = d3.select('#USER'+name)
		.append('svg')
		.attr('width', wid)
		.attr('height', h)
		.append('g')
		.attr("transform", "translate(20,20)");

	group.call(tip);

	group.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (h - margin*2 -5)+ ")")
		.call(xAxis)
		.selectAll('text')
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function(d) {
				return "rotate(-65)" 
			});

	group.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	group.selectAll('rect')
		.data(hold)
		.enter()
		.append("rect")
		.attr('x', function(d) { return x2(d.date); })
		.attr("y", function(d) { return y2(d.id); })
		.attr("height", barHeight)//.66666666666669px")  // function(d) { return h - y2(d.id) - margin*2; })
		.attr('fill', function(d) { 
			if(d.sent){
				return 'green';
			}else{
				return 'red';
			}
		})
		.attr('class', 'bloc')
		.attr("width", barWidth)
		.on('mouseover', tip.show)
      	.on('mouseout', tip.hide);

}