var margin = { top: 30, right: 30, bottom: 30, left: 40 };
var width = 1200 - margin.left - margin.right,
    height = 800 - margin.bottom - margin.top;

var timerWidth = 1200 - margin.left - margin.right,
    timerHeight = 350 - margin.bottom - margin.top;
var svg = d3.select("#map").append("svg")
        .attr({ width: width, height: height});
var projection = d3.geo.mercator()
            .scale([200])
            .translate([width / 2, height / 1.5]);
var path = d3.geo.path()
            .projection(projection);
            
var color = d3.scale.quantize()
              .range(['rgb(254,240,217)','rgb(253,212,158)','rgb(253,187,132)','rgb(252,141,89)','rgb(239,101,72)','rgb(215,48,31)','rgb(153,0,0)']);
var awards = [{"year": 2002, "count": 498}, {"year": 2003, "count": 637}, {"year": 2004, "count": 634}, {"year": 2005, "count": 708}, {"year": 2006, "count": 225}, {"year": 2007, "count": 780}, {"year": 2008, "count": 529}, {"year": 2009, "count": 437}, {"year": 2010, "count": 235}, {"year": 2011, "count": 500}, {"year": 2012, "count": 475}, {"year": 2013, "count": 222}];

var timer = d3.select("#timer").append("svg")
.attr("width", timerWidth + margin.left + margin.right)
    .attr("height", timerHeight + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    

var timeScale = d3.scale.ordinal()
                    .domain(d3.range(awards.length))
                    .rangeRoundBands([0, timerWidth], .2);
var yScale = d3.scale.linear()
                .domain([0, d3.max(awards, function(d) { return d.count; })])
                .range([timerHeight, 0]);


var xAxis = d3.svg.axis()
            .scale(timeScale)
            .orient("bottom")
            .tickFormat(function(d) {
                return awards[d].year;
              });
var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

timer.append("g")
    .attr("transform", "translate(0" + ", " + timerHeight + ")")
    .attr("class", "x axis")
    .call(xAxis);
timer.append("g")
    .attr("transform", "translate(" + margin.left + ", " + timerHeight - margin.bottom + ")")
    .attr("class", "y axis")
    .call(yAxis);

timer.selectAll("rect")
    .data(awards)
    .enter()
    .append("rect")
    .attr({
        x: function(d, i) { return timeScale(i); },
        y: function(d) { return yScale(d.count); },
        width: timeScale.rangeBand(),
        height: function(d) { return timerHeight - yScale(d.count); },
        fill: "steelblue",
        title: function(d) { return d.count; }
    });

timer.selectAll("text")
    .data(awards)
    .enter()
    .append("text")
    .text(function(d) { return d.count; })
    .attr({
        x: function(d, i) { return timeScale(i); },
        y: function(d) { return timerHeight - yScale(d.count) + 15; }
    })
    .attr("fill", "red");

d3.json("data/world_geo_ru.json", function(karta) {
    d3.csv("data/data.csv", function(data) {

        
        yearCount = {};
        for (var i = 0; i < data.length; i++) {
            var date = new Date(data[i].date);
            var year = date.getFullYear();
            var newItem = {"year": year, "awards": 1}
            if (!yearCount[year]) {
                yearCount[year] = 1;
            } else {
                yearCount[year] += 1;
              }
            };


            for (var j = 0; j < karta.features.length; j++) {
                karta.features[j].properties.awards = 0;
                for (var i = 0; i < data.length; i++) {
                    if (karta.features[j].properties.sovereignt == data[i].country) {
                            karta.features[j].properties.awards += 1;
                    };
                };
                
            };



        color.domain([d3.min(karta.features, function(d) { return d.properties.awards }),
                  d3.max(karta.features, function(d) { return d.properties.awards })]);
    
        svg.selectAll("path")
            .data(karta.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function(d) {if (d.properties.awards == 0) {return "white"} else {return color(d.properties.awards)}})
            .attr("stroke", "black")
            .on("mouseover", function(d) {
                var xPos = d3.event.pageX + "px";
                var yPos = d3.event.pageY + "px";
                d3.select("#tooltip")
                    .style("left", xPos)
                    .style("top", yPos)
                    .classed("hidden", false);
                d3.select("#country")
                    .text(d.properties.sovereignt)
                d3.select("#award_count")
                    .text("Awards: " + d.properties.awards)
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip")
                    .classed("hidden", true)
                });
        
        console.log(karta);
        
    });
});
