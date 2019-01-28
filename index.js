// javascript
data = d3.csv("sc_nodes-geocoded.csv", d => ({
  type: "Feature",
  properties: d,
  geometry: {
    type: "Point",
    coordinates: [+d.lng, +d.lat]
  }
}))

projection = d3.geoAlbers()
    .scale(1280)
    .translate([480, 300]);



// topojson = require("topojson-client@3");

// d3 = require("d3@5", "d3-geo-voronoi@1");


var svg = d3.select("body").append("svg")
      .attr("width", 960)
      .attr("height", 500)
      .style("width", "100%")
      .style("height", "auto");

d3.json("https://unpkg.com/us-atlas@1/us/10m.json"), function(error, us) {
  if (error) throw console.error();

  svg.append("path")
      .datum(topojson.merge(us, us.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")))
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath());

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath());

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("pointer-events", "all")
    .selectAll("path")
    .data(d3.geoVoronoi().polygons(data).features)
    .enter().append("path")
      .attr("d", d3.geoPath(projection))
    .append("title")
      .text(d => {
        const p = d.properties.site.properties;
        return `${p.name} Airport
${p.city}, ${p.state}`;
      });

  svg.append("path")
      .datum({type: "FeatureCollection", features: data})
      .attr("d", d3.geoPath(projection).pointRadius(1.5));

  return svg.node();
}
