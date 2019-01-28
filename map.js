//javascript

var w = 1280,
h = 800;

var projection = d3.geo.azimuthal()
.mode("equidistant")
.origin([-98, 38])
.scale(1400)
.translate([640, 360]);

var path = d3.geo.path()
.projection(projection);

var svg = d3.select("body").insert("svg:svg", "h2")
.attr("width", w)
.attr("height", h);

var states = svg.append("svg:g")
.attr("id", "states");

var circles = svg.append("svg:g")
.attr("id", "circles");

var cells = svg.append("svg:g")
.attr("id", "cells");

d3.select("input[type=checkbox]").on("change", function() {
cells.classed("voronoi", this.checked);
});

d3.json("us-states.json", function(collection) {
states.selectAll("path")
  .data(collection.features)
.enter().append("svg:path")
  .attr("d", path);
});

d3.csv("edges.csv", function(connections) {
var linksByOrigin = {},
  countByCoop = {},
  locationByCoop = {},
  positions = [];

var arc = d3.geo.greatArc()
  .source(function(d) { return locationByCoop[d.source]; })
  .target(function(d) { return locationByCoop[d.target]; });

coops.forEach(function(coop) {
var origin = coop.Source,
    destination = coop.Target,
    links = linksByOrigin[origin] || (linksByOrigin[origin] = []);
links.push({source: origin, target: destination});
countByCoop[origin] = (countByCoop[origin] || 0) + 1;
countByCoop[destination] = (countByCoop[destination] || 0) + 1;
});

d3.csv("sc_nodes-geocoded.csv", function(nodes) {

// Only consider airports with at least one flight.
nodes = nodes.filter(function(node) {
  if (countByCoop[node.Label]) {
    var location = [+node.lng, +node.lat];
    locationByCoop[node.Label] = location;
    positions.push(projection(location));
    return true;
  }
});

// Compute the Voronoi diagram of airports' projected positions.
var polygons = d3.geom.voronoi(positions);

var g = cells.selectAll("g")
    .data(coops)
  .enter().append("svg:g");

g.append("svg:path")
    .attr("class", "cell")
    .attr("d", function(d, i) { return "M" + polygons[i].join("L") + "Z"; })
    .on("mouseover", function(d, i) { d3.select("h2 span").text(d.name); });

g.selectAll("path.arc")
    .data(function(d) { return linksByOrigin[d.Label] || []; })
  .enter().append("svg:path")
    .attr("class", "arc")
    .attr("d", function(d) { return path(arc(d)); });

circles.selectAll("circle")
    .data(airports)
  .enter().append("svg:circle")
    .attr("cx", function(d, i) { return positions[i][0]; })
    .attr("cy", function(d, i) { return positions[i][1]; })
    .attr("r", function(d, i) { return Math.sqrt(countByCoop[d.Label]); })
    .sort(function(a, b) { return countByCoop[b.Label] - countByCoop[a.Label]; });
});
});

</script>
