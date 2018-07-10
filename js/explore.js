var host = "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png";
//var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
var attr = 'koen'
var map = new L.Map("map", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false})
  .addLayer(new L.TileLayer(host, {
      attribution: attr
    }));

function removeVelocityLayerFromMap(){
  map.eachLayer(function (l) {
    if (l.id == 'velos'){
      map.removeLayer(l)
    }
  })
}

function addVelocityLayerToMap(file){
     d3.json(file, function (data) {
      var velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: 'Global Wind',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data'
        },
        data: data,
        maxVelocity: 4
        });
      velocityLayer.id = 'velos'
      map.addLayer(velocityLayer)
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
  
  addVelocityLayerToMap('data/waal_reference_0000.json')


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
  addVelocityLayerToMap('data/waal_reference_0000.json')
}

function showRelo() {
  d3.json('data/relocation_int100.json', function(d){BackwaterChart.updateData(d)})  
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int07_0000.json')

}

function showSmooth() {
  d3.json('data/smoothing_int99.json', function(d){BackwaterChart.updateData(d)})  
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int11_0000.json')
}