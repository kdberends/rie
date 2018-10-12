/** ////////////////////////////////////////////////////////////
 * Perfect scrollbar
 * 
 *
 */////////////////////////////////////////////////////////////


const ps = new PerfectScrollbar('#InterventionDescription', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
ps.update()

const scroll_welcomemenu = new PerfectScrollbar('#menu', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
scroll_welcomemenu.update()

/** ////////////////////////////////////////////////////////////
 * Background map
 *
 * Other servers: (light themes!)
 * var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
 * var host = "https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}";
 * var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png";
 * var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
 * var host = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
 *
 */////////////////////////////////////////////////////////////

var host = "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png";

// Attribution is now embedded in menu, no longer in map
var attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'

var LineStyle = {
    "stroke": true,
    "color": "#6C716C",
    "weight": 5,
    "dashArray": "1 0",
    "dashOffset": "1"
  };

var MinorEmbankmentStyle = {
    "stroke": true,
    "color": "#0E8E0E",
    "weight": 1,
    "dashArray": "1 0",
    "dashOffset": "1"
  };

var DashStyle = {
    "stroke": true,
    "color": "#6C716C",
    "weight": 2,
    "dashArray": "10 5",
    "dashOffset": "1"
  };

var InactiveRiverKmStyle = {
    radius: 2,
    fillColor: "#FFFFFF",
    color: "#FFFFFF",
    weight: 0,
    opacity: 1,
    fillOpacity: 0.6
};

var ActiveRiverKmStyle = {
    radius: 4,
    fillColor: "#FFFFFF",
    color: "#FFFFFF",
    weight: 0,
    opacity: 1,
    fillOpacity: 1
};

var PolyVisible = {
          "stroke": true,
          "weight": 1,
          "color": "#00C09E",
          "opacity": 0.5 
      };

/* LEAFLET
 *
 *
 */
var map = new L.Map("map", {center: [51.845, 5.36], 
                            zoom: 13,
                            zoomControl: false,
                            attributionControl:false })
  .addLayer(new L.TileLayer(host, {
      maxzoom: 19,
      attribution: attr}
    )
  );

var map2 = new L.Map("map_clone", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false,
                              attributionControl:false})
  .addLayer(new L.TileLayer(host));

// sync so that they overlap
xc = map2.getContainer().parentElement.offsetLeft / map.getSize().x
yc = map2.getContainer().parentElement.offsetTop / map.getSize().y
map.sync(map2, {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})

var points = null
//d3.json('shp/banddijken.json', function(geojsonFeature){
//      points = L.geoJson(geojsonFeature, {style:LineStyle}).addTo(map);
//       })
//
var dike =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });
dike.addTo(map);
d3.json('shp/banddijken.json', function (data) {
    dike.addData(data)
  });


var riverkm = new L.geoJson(null, {
  style: InactiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, InactiveRiverKmStyle)
  }
});
riverkm.addTo(map)

var riverkmFocus = new L.geoJson(null, {
  style: ActiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, ActiveRiverKmStyle)
  }
});
riverkmFocus.addTo(map)

d3.json('shp/rivierkilometers.json', function (data) {
    for (var i=0;i<100;i++){
        L.geoJson(null, 
          {style: InactiveRiverKmStyle,
           pointToLayer: function (feature, latlng) {
                          return L.circleMarker(latlng, InactiveRiverKmStyle)
                         }
          })
         .addData(data.features[i])
         .addTo(map)
         .bindTooltip('Rhine kilometer: '+data.features[i].properties.MODELKILOM.substring(0, 3),
                      {direction: 'top',
                       className: 'kmtooltip'}
                      )
       }
});

var dikeNew =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

var embankments =  new L.geoJson(null, {
      style: MinorEmbankmentStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

var groynes =  new L.geoJson(null, {
      style: MinorEmbankmentStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

var sidechannels =  new L.geoJson(null, {
      style: PolyVisible,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

var lowering =  new L.geoJson(null, {
      style: PolyVisible,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Marker tooltips
/*
L.marker([51.807, 5.3765], {
     icon: L.divIcon({
           html: '<i class="fas fa-question-circle fa-lg" style="color: white"></i>',
           iconSize: [20, 20],
           className: 'myDivIcon'
            })
})
.bindTooltip("Huidige locatie van de dijk", {direction: 'bottom',
                                 offset: L.point(0, 10)})
 .addTo(map)
 .openTooltip()
*/
/* Events for Map Interaction
 *
 *
 */
map.on('zoomend', function() {
    if (map.getZoom() < 11){
        if (map.hasLayer(dike)) {
            map.removeLayer(dike);
        } else {
            console.log("no point layer active");
        }
    }
    if (map.getZoom() >= 11){
        if (map.hasLayer(dike)){
            console.log("dike_ref already added");
        } else {
            map.addLayer(dike);
        }
    }
}
)
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
        maxVelocity: 4,
        velocityScale: 0.01

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
  
  addVelocityLayerToMap('data/waal_reference_0000.json', map)
  //addVelocityLayerToMap('data/waal_reference_0000.json', map2)



  // Backwaterchart figure 
	BackwaterChart.setCanvas("#canvas2")
	BackwaterChart.setData(dataset2)
	BackwaterChart.init()
  BackwaterChart.setXaxisCallback(function (coor) {
    d3.json('shp/rivierkilometers.json', function (data) {
      riverkmFocus.clearLayers();
      let index = (coor - 854) 
      riverkmFocus.addData(data.features[index]).bindTooltip('km '+coor, {direction: 'top'});//.openTooltip();
      });
    });
	////BackwaterChart.drawValueLine()
	//BackwaterChart.showBands()
  //bwc = new BackWaterChart("#canvas2", dataset2)
  //bwc.setXaxisCallback(function (coor) {console.log('new func: ' + coor)})
	d3.select(window)
	   .on("resize.chart", function(){
      BackwaterChart.resize()
      BackwaterChart.setXaxisCallback(function (coor) {
    d3.json('shp/rivierkilometers.json', function (data) {
      riverkmFocus.clearLayers();
      let index = (coor - 854) 
      riverkmFocus.addData(data.features[index]);
      });
    });
    })
}



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
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Referentiesituatie";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 0 cm (--)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: --% (--)";
  $('#InterventionDescription').load('html/reference_NL.html');
  /* Figure */
  BackwaterChart.hideBands()
  BackwaterChart.drawZeroLine()

  /* Map */
  removeVelocityLayerFromMap();
  addVelocityLayerToMap('data/waal_reference_0000.json', map)

  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};


  dike.setStyle(LineStyle);
}

function showRelo() {
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Dijkverlegging";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 108 cm (<span class='label_high'>hoog</span>)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 15% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('html/dikerelocation_NL.html');
  /* Figure */
  d3.json('data/relocation_int100.json', function(d){BackwaterChart.updateData(d)});
  removeVelocityLayerFromMap();
  addVelocityLayerToMap('data/waal_int07_0000.json', map);
  dike.setStyle(DashStyle);
  
  /* map */
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};

  dikeNew.addTo(map);
  d3.json('shp/banddijken_relocation_int100.json', function (data) {
      dikeNew.addData(data)
    });

}

function showSmooth() {
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Maaien van de uiterwaard";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 28 cm (<span class='label_medium'>gemiddeld</span>)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 82% (<span class='label_low'>hoog</span>)";
  $('#InterventionDescription').load('html/smoothing_NL.html');
  /* Figure */
  d3.json('data/smoothing_int99.json', function(d){BackwaterChart.updateData(d)})  

  /* Map */
  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};
  dike.setStyle(LineStyle);

  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int11_0000.json', map);

  sidechannels.addTo(map);
  sidechannels.clearLayers();
  d3.json('shp/flplowering_int99.json', function (data) {
      sidechannels.addData(data)
    });

};

function showGROYNLOW(){
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Kribverlaging";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 4 cm (<span class='label_low'>laag</span>)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 23% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('html/groynelowering_NL.html');
  /* Figure */
  d3.json('data/groynelowering_int363.json', function(d){BackwaterChart.updateData(d)})  
  
  /* Map */
  removeVelocityLayerFromMap()
  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};
  dike.setStyle(LineStyle);
  groynes.addTo(map)
  d3.json('shp/groynlow.json', function (data) {
      groynes.addData(data)
    });

  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int01_0000.json', map);
};

function showMINEMBLOW(){
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Kadeverlaging";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 3 cm (<span class='label_low'>laag</span>)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 52% (<span class='label_low'>hoog</span>)";
  $('#InterventionDescription').load('html/MINEMBLOW_NL.html');
  /* Figure */
  d3.json('data/minemblowering_int150.json', function(d){BackwaterChart.updateData(d)})  
  dike.setStyle(LineStyle);
  /* Map */
  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};

  embankments.addTo(map);
  d3.json('shp/minemblow.json', function (data) {
      embankments.addData(data)
    });

  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int04_0000.json', map);
};

function showFLPLOW(){
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Uiterwaardvergraving";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 80 cm (<span class='label_high'>hoog</span>)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 28% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('html/FLPLOW_NL.html');
  /* Figure */
  d3.json('data/lowering_int99.json', function(d){BackwaterChart.updateData(d)})  
  
  /* Map */
  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};
  dike.setStyle(LineStyle);
  sidechannels.addTo(map);
  d3.json('shp/flplowering_int99.json', function (data) {
      sidechannels.addData(data)
    });

  removeVelocityLayerFromMap();
  sidechannels.clearLayers();
  addVelocityLayerToMap('data/waal_int03_0000.json', map);

};

function showSIDECHAN(){
  /* Titles and descriptions */
  document.getElementById("InterventionTitle").innerHTML = "Nevengeulen";
  document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 36 cm (<span class='label_medium'>gemiddeld</span>)";
  document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 28% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('html/SIDECHAN_NL.html');
  /* Figure */
  d3.json('data/sidechannel_int100.json', function(d){BackwaterChart.updateData(d)})  

  /* Map */
  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};
  dike.setStyle(LineStyle);
  sidechannels.addTo(map);
  sidechannels.clearLayers();
  d3.json('shp/sidechannel_int100.json', function (data) {
      sidechannels.addData(data)
    });

  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int09_0000.json', map);
};

d3.queue()
  .defer(d3.json, 'data/relocation_int100.json')
  .defer(d3.json, 'data/smoothing_int99.json')
  .await(display);

