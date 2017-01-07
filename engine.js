var fileUrl;

if(window.location.hash && window.location.hash.length == 41){
	fileUrl = "https://rawgit.com/ashtanga/ashtanga.github.io/" + window.location.hash.substr(1) + "/practice.csv";
	document.querySelector('a.bottom').innerHTML = window.location.hash.substr(1) + "/practice.csv";
	init();
}else chiamato("https://api.github.com/repos/ashtanga/ashtanga.github.io/git/refs/heads/master?time=" + new Date().getTime());

function init(){
  var cellSize = 25, // cell size
      width = cellSize * 5 * 12,
      height = cellSize * 8 + 1;

  var meldi = 0, wat = [], mon = [];

  var percent = d3.format("1%"),
      format = d3.time.format("%Y-%m-%d");

  var color = d3.scale.quantize()
      .domain([1,11])
      .range(d3.range(11).map(function(d) { return "q" + (10 - d) + "-11"; }));

  var monthNameFormat = d3.time.format("%b");
  var yearNameFormat = d3.time.format("%y");

  var svg = d3.select("section#years").selectAll("svg")
      .data(d3.range(2016, new Date().getFullYear() + 1)) // HERE TO DEBUG NEXT YEAR = 2
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn year")
    .append("g")
      .attr("transform", "translate(" + cellSize * 6 + ",1)");

  svg.append("text")
      .attr("transform", "translate(-10," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(function(d) { return d; });

  var rect = svg.selectAll(".day")
      .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
      .attr("class", function(d) { return (new Date(d)<new Date()) ? "day" : "night"; })
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
      .attr("y", function(d) { return d.getDay() * cellSize; })
      .datum(format);

	  // week day on first year column
	  var wd = svg.selectAll(".wday")
	      .data(["S", "M", "T", "W", "T", "F", "S"])
	    .enter().append("text")
	      .attr("x", function(d) { return cellSize/3; })
	      .attr("y", function(d,i) { return i * cellSize + cellSize*3/4; })
		  .attr("fill", "black")
	      .text(function(d) { return d; });

  // rect.append("text")
  //     .attr("x", 10)
  //     .text(function(d) { return d; });

	// draw month PATH
  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);

  d3.csv(fileUrl, function(error, csv) {
    if (error) throw error;

    var data = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(d,i) {
        var cosa = new Date(meldi);
        meldi = d[0].date;
        var diff = (new Date(meldi) - cosa)/60/60/24/1000;
        wat.push(diff);
        mon.push(monthNameFormat(cosa));
        return (diff);
      })
      .map(csv);

    rect.filter(function(d) { return d in data; })
        .attr("class", function(d) { return "day " + color(data[d]); })
      .select("title")
        .text(function(d) { return d + ": " + data[d]; });

    wat.shift();

	var forMonth = d3.nest()
	  .key(function(d) { var dt = d3.time.format("%Y-%m-%d").parse(d.date); return d3.time.year(dt); })
	  .key(function(d){ var dt = d3.time.format("%Y-%m-%d").parse(d.date); return d3.time.month(dt); })
	  .entries(csv);
	// console.log(forMonth);

	// PRINT MONTH SUM
  // svg.selectAll(".summonth")
  //     .data(forMonth)
  //   .enter().append("text")
  //     .attr("class", "summonth")
  //  .attr("x", function (d) { return ( d3.time.weekOfYear(d) + 2 ) * cellSize; })
  //  .attr("y", 7.7 * cellSize)
  //     .text(function (d) { return ; })
  //  .text(function (d,i) {
  //   var cosi = 0;
  //   return monthNameFormat(d) + forMonth[i].values.length;
  // //   if (typeof forMonth[new Date(d).getMonth()] !== 'undefined' ) cosi = forMonth[new Date(d).getMonth()].values.length;
  // //   if(cosi>0) return ( monthNameFormat(new Date(d)) + ' ' + cosi ); else return '';
  //  });

	var forWeekDay = d3.nest()
	  .key(function(d){ return d3.time.format("%Y-%m-%d").parse(d.date).getDay(); })
	  .entries(csv);

    var grouped = d3.nest()
      .key(function(d) { return d; })
      .rollup(function(v) { return v.length; })
      .entries(wat);

	var	now = new Date().getFullYear()+'-'+('0' + (new Date().getMonth()+1)).slice(-2)+'-'+('0' + new Date().getDate()).slice(-2),
		practicedToday = data.hasOwnProperty(now),
		body = d3.select("body"),
		bodyColor = practicedToday ? body.style("background-color", "#ebbe6a") : body.style("background-color", "lightgrey"),
		snButton = d3.select("footer button"),
		notToday = (practicedToday && snButton) ? snButton.style("display", "none") : false;
	barchart(grouped);
	barweek(forWeekDay, Object.keys(data).length);
    pieChart(grouped);

    var montly = d3.nest()
      .key(function(d) { return d; })
      .rollup(function(v) { return v.length; })
      .entries(mon);

      svg.selectAll(".sums")
          .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("text")
          .attr("class", "sums")
          .attr("x", function(d) { return ( d3.time.weekOfYear(d) + 2 ) * cellSize; })
          .attr("y", 7.7 * cellSize )
          .style("text-anchor", "middle")
          .text(function(d,i) {
            // var cosi = 0;
            // if(montly[i]) cosi = montly[i].values;
			      // USE forMonth
		      	var cosi = 0, yr=new Date(d).getFullYear(), yrindex=yr-2016;
				// console.log(yrindex,new Date(d).getMonth(),forMonth[yrindex]['values'][new Date(d).getMonth()]);
				if (forMonth[yrindex] && typeof forMonth[yrindex].values[new Date(d).getMonth()] !== 'undefined') cosi = forMonth[yrindex].values[new Date(d).getMonth()].values.length;
            if(cosi>0) return ( monthNameFormat(new Date(d)) + ' ' + cosi ); else return '';
          });

    // var lnk = d3.select("body")
    //   .append("a").attr('href', 'https://github.com/ashtanga/ashtanga.github.io/edit/master/practice.csv').text('practice.csv');

  });

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
        d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
  }

  var legendBox = d3.select("body").append("svg")
      .attr("class","legend RdYlGn")
      .attr("height", cellSize * 12)
      .attr("width", cellSize * 4);

  var legend = legendBox.selectAll("g")
      .data(d3.range(0,11))
      .enter().append("g")
      .attr("transform", function(d,i) { return "translate(0," + i * cellSize + ")"; });

  legend.append("rect")
      .attr("class", "RdYlGn")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("y", 0)
      .attr("x", "2em")
      .attr("class", function(d) { return "q" + (10 - d) + "-11"; });

  legend.append("text")
      .attr("x", "3em")
      .attr("y", 0)
      .attr("dy", "1.1em")
      .attr("dx", ".6em")
      .text(function(d) { return d+1; });

  function pieChart(data1){
    var w = 300,                        //width
        h = 300,                            //height
        r = 100;                            //radius
        // color2 = d3.scale.category20c();     //builtin range of colors

    var vis = d3.select("body").selectAll('section#round')
        .append("svg:svg")              //create the SVG element inside the <body>
        .data([data1])                   //associate our data with the document
          .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
          .attr("height", h)
          .attr("class", "RdYlGn round")
        .append("svg:g")                //make a group to hold our pie chart
          .attr("transform", "translate(" + r + "," + r + ")");    //move the center of the pie chart from 0, 0 to radius, radius

    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .innerRadius(r/2).outerRadius(r);

    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.values; });    //we must tell it out to access the value of each element in our data array

    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "pie");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
                .attr("class", function(d, i) { return "q" + (11 - data1[i].key) + "-11"; } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d,i) {                    //set the label's origin to the center of the arc
                    var c = arc.centroid(d);
                    return "translate(" + c[0]*1.17 +"," + c[1]*1.17 + ")";       //this gives us a pair of coordinates like [50, 50]
                })
                .attr('dy','.5em')
                .attr("text-anchor", "middle")                          //center the text on it's origin
                .text(function(d,i) { return data1[i].key; });        //get the label from our original data array

  }
}
// ---------------------------
function proporzioni(small,big,ref){
	return Math.floor(small*ref/big);
}
function barchart(d){
	var	arra = [],
		bardiv = document.getElementById('barchart'),
		sum = 0;
	for (var key in d) {
		if (d.hasOwnProperty(key)) {
			var	u = d[key],
				box = document.createElement('span');
			// u = { key: "1", values: 41 }
			sum += u.values;
			box.innerHTML = u.values;
			var cl = 'q' + Math.max(11 - u.key, 0) + '-11';
			box.setAttribute('data-value', u.values);
			box.classList.add(cl);
			bardiv.appendChild(box);
		}
	}
	var boxes = bardiv.querySelectorAll('span');
	for (var i = 0; i < boxes.length; i++) {
		var	bb = boxes[i],
			bv = bb.getAttribute('data-value');
		bb.setAttribute('style', 'width:' + proporzioni(bv,sum,1328) + 'px;');
	}
	baryear(sum);
}

function baryear(s) {
	var baryeardiv = document.getElementById('baryear'),
		pract = document.createElement('span'),
		nopract = document.createElement('span'),
		dayyear = 365-dayofyear(),
		tocome = document.createElement('span'),
		daysToCome = 365 * (new Date().getFullYear() - 2016 + 1 );
	pract.classList.add('q8-11');
	pract.setAttribute('style', 'width:' + proporzioni(s,daysToCome,1328) + 'px;');
	pract.innerHTML = s;
	nopract.classList.add('q3-11');
	nopract.setAttribute('style', 'width:' + proporzioni((daysToCome-s-dayyear),daysToCome,1328) + 'px;');
	nopract.innerHTML = daysToCome-s-dayyear;
	tocome.setAttribute('style', 'width:' + proporzioni(dayyear,daysToCome,1328) + 'px;background-color:#EDEDED;');
	tocome.innerHTML = dayyear;
	baryeardiv.appendChild(pract);
	baryeardiv.appendChild(nopract);
	baryeardiv.appendChild(tocome);
}
function dayofyear () {
	var now = new Date();
	var start = new Date(now.getFullYear(), 0, 0);
	var diff = now - start;
	var oneDay = 1000 * 60 * 60 * 24;
	return Math.floor(diff / oneDay);
}
function barweek(w, big){
	var	bardiv = document.getElementById('barweek'),
		weekday = [];
	var max = d3.max(d3.values(w));
	var color = d3.scale.quantize()
		.domain([30,15])
		.range(d3.range(11).map(function(d) { return "q" + (10 - d) + "-11"; }));
	weekday[0]=  "Sun";
	weekday[1] = "Mon";
	weekday[2] = "Tue";
	weekday[3] = "Wed";
	weekday[4] = "Thu";
	weekday[5] = "Fri";
	weekday[6] = "Sat";
	for (var i = 0; i < w.length; i++) {
		var	wd = w[i].key,
			hm = w[i].values.length,
			span = document.createElement('span');
		span.classList.add(color(hm));
		span.innerHTML = weekday[wd] + ' ' + hm;
		span.setAttribute('style', 'width:' + proporzioni(hm,big,1328) + 'px;');
		span.setAttribute('data-color', color(hm));
		bardiv.appendChild(span);
	}
}
function chiamato(url){
  var xhr = new XMLHttpRequest();
  xhr.open ( 'GET', url, true );
  xhr.setRequestHeader( 'Accept', 'application/vnd.github.v3.full+json' );
  xhr.onreadystatechange = function() {
    if ( xhr.readyState == 4 && xhr.status == 200 ) {
      risposta(xhr);
    }
    if ( xhr.readyState == 4 && xhr.status >= 400 ) {
      risposta(false);
    }
  };
  xhr.send();
}

function risposta(xhr){
  if(xhr) resp = JSON.parse(xhr.responseText); else resp = { object: { sha: 'master' } };
  fileUrl = "https://rawgit.com/ashtanga/ashtanga.github.io/" + resp.object.sha + "/practice.csv";
  // DEBUG GIST FILE
  // fileUrl = "https://cdn.rawgit.com/petrosh/cc819ea69538dbbffdeafe21b08fbf22/raw/e97c2ed1715a18a6930a5e1c6db336dbba2ce6d6/practice.csv";
  document.querySelector('a.bottom').innerHTML = resp.object.sha + "/practice.csv";
  init();
}
