
function display(error, dataset1, dataset2) {
  
  // First plot
  //var plot = backwatercurves();
  //d3.select("#canvas1").data([dataset1]).call(plot)
  // "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  var PolyVisible = {
          "stroke": true,
          "weight": 1,
          "color": "#000000",
          "opacity": 1.0 
      };
  var LineStyle = {
    "stroke": true,
    "color": "#FF0000",
    "opacity": 1.0 
  };
  var PolyInvisible = {
          "color": "#ff7800",
          "weight": 2,
          "opacity": 0
      }

  var host = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  //var host = 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png';
  //var host = "http://{s}.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png";
  //var host = "https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}.png";
  //var hspt = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  var PolyLayer = null;
  // [51.85, 5.5], zoom: 12
  //[51.83, 5.41], zoom: 13
  var map = new L.Map("map", {center: [51.85, 5.5], zoom: 12})
    .addLayer(new L.TileLayer(host, {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>'}));
  
  var stripes = new L.StripePattern({"weight": 2,
                                     "spaceWeight": 2,
                                     "angle": 45,
                                     "opacity": 1.0
                                   })
  .addTo(map); 
  
  var geojsonMarkerOptions = {
    radius: 2,
    fillColor: "#4A4A4A",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


  d3.json('shp/banddijken.json', function(geojsonFeature){
      Dike = L.geoJson(geojsonFeature, {style:LineStyle})
      .addTo(map);
       })
  d3.json('shp/rivierkilometers.json', function(geojsonFeature){
      Dike = L.geoJson(geojsonFeature, {pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions)}})
      .addTo(map);
       })
  d3.json('shp/sidechannel_int100.json', function(geojsonFeature){
      PolyLayer = L.geoJson(geojsonFeature, {style:PolyVisible, fillPattern:stripes, fillOpacity: 1.0})
      .addTo(map);
       })


  

}


d3.queue()
	.defer(d3.json, 'data/smoothing_int99.json')
	.defer(d3.json, 'data/smoothing_int99.json')
	.await(display)