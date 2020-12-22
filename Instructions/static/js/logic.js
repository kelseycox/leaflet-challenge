// API endpoint
var eqUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get request using D3.json
d3.json(eqUrl, function(data) {
    // Use data to create Map
    eqFeatures(data.features);
  });

function eqFeatures(earthquakeData) {

  function eqSize(mag) {
    if (mag <= 1) {
      return(1);
    } else if ((mag > 1) && (mag <= 2)) {
      return(3);
    } else if ((mag > 2) && (mag <= 3)) {
      return(6);
    } else if ((mag > 3) && (mag <= 4)) {
      return(12);
    } else if ((mag > 4) && (mag <= 5)) {
      return(24);
    } else {
      return(48);
    };
  }

  function eqColor(mag) {
    if (mag <= 1) {
      return("green");
    } else if ((mag > 1) && (mag <= 2)) {
      return("yellow");
    } else if ((mag > 2) && (mag <= 3)) {
      return("orange");
    } else if ((mag > 3) && (mag <= 4)) {
      return("red");
    } else if ((mag > 4) && (mag <= 5)) {
      return("purple");
    } else {
      return("brown");
    };
  }

  // Create popup feature for place and time of each earthquake
  function popUp(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.mag + " Magnitude - " + new Date(feature.properties.time) +
      "</h3><hr><p>" + (feature.properties.place) + "</p>");
  }

  function eqCircleMarkers(feature, latlng) {
    return new L.CircleMarker(latlng, {
        radius: eqSize(feature.properties.mag),
        color: eqColor(feature.properties.mag),
        fillOpacity: 0.85
    });
  }

  // Create a GeoJSON layer and add onEachFeature function 
  var allEarthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: popUp,
      pointToLayer: eqCircleMarkers
    });

  // Add to the Map
  createMap(allEarthquakes);
}

function createMap(allEarthquakes) {

  // Define layers
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY
  });

  // Define base
  var base = {
    "Dark Map": darkmap
  };

  // Create over layer
  var overlayer = {
    Earthquakes: allEarthquakes
  };

  // Create map adding layers
  var eqMap = L.map("mapid", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [darkmap, allEarthquakes]
  });

  // Create a layer control
  L.control.layers(base, overlayer, {
    collapsed: false
  }).addTo(eqMap);

   // Create legend
   var legend = L.control({ position: "bottomright" });
   legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var limits = [0,1,2,3,4,5];
      var colors = ["green", "yellow", "orange", "red", "purple", "brown"];
      var labels = ["magnitude <1", "magnitude between 1-2", "magnitude between 3-4", "mangitude between 4-5", "magnitude +5"];
 
    // Add minnimum and maximum
    var legendColors = "<h1>legend</h1>" +
      "<div class=\"labels\">" +
      "<div class=\"min\">" + limits[0] + "</div>" +
      "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

      div.insideHTML = legendColors;

      limits.forEach(function (index) {
          labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

    div.insideHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
   // Add legend to map
  legend.addTo(eqMap);
}