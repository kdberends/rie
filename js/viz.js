
function display(error, dataset1, dataset2) {
  
  // First plot
  //var plot = backwatercurves();
  //d3.select("#canvas1").data([dataset1]).call(plot)
  // "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  var PolyVisible = {
          "color": "#ff7800",
          "weight": 2,
          "opacity": 0.65
      };

  var PolyInvisible = {
          "color": "#ff7800",
          "weight": 2,
          "opacity": 0
      }

  var host = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  var host = 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png';
  //var host = "http://{s}.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png";
  //var host = "https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}.png";
  //var hspt = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
  var PolyLayer = null;
  var map = new L.Map("canvas1", {center: [52.26, 6.14], zoom: 8})
    .addLayer(new L.TileLayer(host, {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>'}));
  d3.json('shp/relocation_int100.json', function(geojsonFeature){
      PolyLayer = L.geoJson(geojsonFeature, {style: PolyVisible})
      PolyLayer.addTo(map);
       })
  // Second plot
  BackwaterChart.setCanvas("#canvas2")
  BackwaterChart.setData(dataset2)
  BackwaterChart.init()
  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('main'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.2; });

    // activate current section
    if (index == 0){
       map.setView([51.8, 5.5], 8);
       PolyLayer.eachLayer(function(layer) {layer.setStyle({opacity:0})})
     } 
    else if (index == 1){
       map.setView([51.823, 5.3682], 9);
       PolyLayer.eachLayer(function(layer) {layer.setStyle({opacity:0.6})})
     }
     else if (index == 2){
      
      
      map.setView([51.823, 5.3682], 11);
     };
    if (index == 3){
      BackwaterChart.drawZeroLine()
    };
    if (index == 4){
      BackwaterChart.drawValueLine()
      BackwaterChart.hideBands()
    };
    if (index == 5){
      BackwaterChart.showBands()
    };
    //plot.activate(index);
  });
  
  d3.select(window)
   .on("resize.chart", function(){BackwaterChart.resize()})
  


}


d3.queue()
	.defer(d3.json, 'data/smoothing_int99.json')
	.defer(d3.json, 'data/smoothing_int99.json')
	.await(display)