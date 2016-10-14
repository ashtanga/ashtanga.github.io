chiamato("https://api.github.com/repos/ashtanga/ashtanga.github.io/git/refs/heads/master");

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
      .data(d3.range(2016, new Date().getFullYear() + 1))
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

  rect.append("title")
      .text(function(d) { return d; });

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
	  .key(function(d){ return d3.time.month(d3.time.format("%Y-%m-%d").parse(d.date)); })
	  .entries(csv);

    var grouped = d3.nest()
      .key(function(d) { return d; })
      .rollup(function(v) { return v.length; })
      .entries(wat);

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
		      	var cosi = 0;
				if (typeof forMonth[new Date(d).getMonth()] !== 'undefined' ) cosi = forMonth[new Date(d).getMonth()].values.length;
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
  document.querySelector('a.bottom').innerHTML = resp.object.sha + "/practice.csv";
  init();
}
