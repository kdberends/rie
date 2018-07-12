var host = "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png";
//var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
var attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
var map = new L.Map("map", {center: [51.855, 5.36], 
                              zoom: 13,
                              zoomControl: false})
  .addLayer(new L.TileLayer(host, {
      maxzoom: 19,
      attribution: attr
    }));

var map2 = new L.Map("mappo", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false,
                              attributionControl:false})
  .addLayer(new L.TileLayer(host));

// sync so that they overlap
console.log(map2.getContainer().parentElement.offsetLeft)
// for footer this works fine
xc = map2.getContainer().parentElement.offsetLeft / map.getSize().x
yc = map2.getContainer().parentElement.offsetTop / map.getSize().y
console.log(xc, yc)
map.sync(map2, {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})
//map.sync(map2, {offsetFn: offsetGlobal})
var LineStyle = {
    "stroke": true,
    "color": "#FF0000",
    "opacity": 0.5 
  };
d3.json('shp/banddijken.json', function(geojsonFeature){
      console.log(geojsonFeature)
      L.geoJson(geojsonFeature, {style:LineStyle}).addTo(map);
       })
/*
 *
 *
 */
function removeVelocityLayerFromMap(){
  map.eachLayer(function (l) {
    if (l.id == 'velos'){
      map.removeLayer(l)
    }
  })
}

function addVelocityLayerToMap(file, thismap){
     d3.json(file, function (data) {
      var velocityLayer = L.velocityLayer({
        displayValues: true, 
        displayOptions: {
          velocityType: 'Flow velocity',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data',
          speedUnit: 'm/s'
        },
        data: data,
        maxVelocity: 4
        });
      velocityLayer.id = 'velos'
      thismap.addLayer(velocityLayer)
      
  });
}


function display(error, dataset1, dataset2) {
  
  // Background map 
  // https://leaflet-extras.github.io/leaflet-providers/preview/
  var attr = 'koen'
  var host = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  var host = "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png";
  //var host = "https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}";
  //var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png";
  //var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  //var host = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
  
  addVelocityLayerToMap('data/waal_reference_0000.json', map)
  //addVelocityLayerToMap('data/waal_reference_0000.json', map2)



  // Backwaterchart figure
	BackwaterChart.setCanvas("#canvas2")
	BackwaterChart.setData(dataset2)
	BackwaterChart.init()
	//BackwaterChart.drawValueLine()
	BackwaterChart.showBands()

	d3.select(window)
	   .on("resize.chart", function(){BackwaterChart.resize()})
}


d3.queue()
  .defer(d3.json, 'data/relocation_int100.json')
  .defer(d3.json, 'data/smoothing_int99.json')
  .await(display)


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropDownFunction() { 
    document.getElementById("InterventionDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
} 


function showReference() {
  BackwaterChart.hideBands()
  BackwaterChart.drawZeroLine()
  map.eachLayer(function (l) {
    if (l.id == 'velos'){
      map.removeLayer(l)
    }
  })
  addVelocityLayerToMap('data/waal_reference_0000.json', map)
}

function showRelo() {
  d3.json('data/relocation_int100.json', function(d){BackwaterChart.updateData(d)})  
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int07_0000.json', map)

}

function showSmooth() {
  d3.json('data/smoothing_int99.json', function(d){BackwaterChart.updateData(d)})  
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int11_0000.json', map)
}