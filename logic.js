console.log("working")
//base street map layers
var myMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// base layer
var map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers:[topo,myMap]
});
myMap.addTo(map)
// console.log()
var baseMaps ={
    "Basic Map": myMap,
    Topography: topo
};

// add earthquake plate layer
var earthquakes = new L.LayerGroup();
var overlays = {
    "Earthquakes": earthquakes
};

// retrieve & insert geoJSON data 4.5+ earthquakes in the past week
L.control
        .layers(baseMaps, overlays)
        .addTo(map);
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 0.5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "black",
            radius: getRadius(feature.properties.map),
            stroke: true,
            weight: 0.5
        };
    }

console.log(earthquakes);

// format colors for depth
    function getColor(depth) {
        switch (true){
            case depth > 90:
                return "red";
            case depth > 70:
                return "orangered";
            case depth > 50:
                return "orange";
            case depth > 30:
                return "gold";
            case depth > 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 6;
        }
// GeoJSON layer
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
    style: styleInfo,
//add in pop-up info
    onEachFeature: function (feature, layer) {
        layer.bindPopup(
            "Magnitude: "
            +feature.properties.mag
            +"<br>Depth: "
            +feature.geometry.coordinates[2]
            +"<br>Location: "
            +feature.properties.place
        );
    }
}).addTo(earthquakes);
earthquakes.addTo(map);
// legend formatting
    var legend =L.control({
        position: "topright"
    });
    legend.onAdd= function(){
      var div = L.DomUtil.create("div", "info Legend");
      var depth = [-10, 10, 30, 50, 70, 90];
      var colors = [
          "lightgreen",
          "yellow",
          "gold",
          "orange",
          "#redorange",
          "red"];
      for (var i = 0; i < depth.length; i++) {
          div.innerHTML += "<i style='background: "
              +colors[i]
              +" '></i>"
              +depth[i]
              +(depth[i+1] ? "&ndash;" +depth[i+1]+ "<br>" : "+");
      }
      return div;
    };
    legend.addTo(map);
});