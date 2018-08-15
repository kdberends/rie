/* Story scroller
 *
 *
 *
 */
var scroll = scroller().container(d3.select('#storycontainer'));

// pass in .step selection as the steps
scroll(d3.selectAll('.storystep'));
// setup event handling
scroll.on('active', function (index) {
  // highlight current step text
  d3.selectAll('.storystep')
    .style('opacity', 
    	   function (d, i) { return i === index ? 1 : 0.2; });
 
  // activate current section
  if (index==0){
    d3.select('.figurebox')
      .transition()
      .duration(500)
      .style("opacity", 0)
      .style("pointer-events", "none")
  } else if (index==1){
    d3.select('.figurebox')
      .transition()
      .duration(500)
      .style("opacity", 1)
      .style("pointer-events", "initial")
  };
});

function scrollTopTween(scrollTop) {
  return function() {
    var i = d3.interpolateNumber(d3.select('#storycontainer').scrollTop, scrollTop);
    return function(t) { d3.select('#storycontainer').scrollTop = i(t); };
 };
}

function storyScrollToTop(e){
d3.select('#storycontainer').on('click', function() {
  d3.select('#storycontainer')
    .transition()
    .tween('scrolltotoptween', scrollTopTween(0))
  e.stopPropagation()
});
};

$("#aScrollToTop").click(function(e) {
  $("#storycontainer").animate({scrollTop: 0}, 500)
});

/* perfect scrollbar
 */

const ps = new PerfectScrollbar('#storycontainer', {
  wheelSpeed: 2,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
ps.update()

/* Background map
 *
 *
 */
var host = "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png";
//var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
//var host = "https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}";
//var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png";
//var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
//var host = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
  
var attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'

var LineStyle = {
    "stroke": true,
    "color": "#6C716C",
    "weight": 5,
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


/* LEAFLET
 *
 *
 */
var map = new L.Map("map", {center: [52.5, 4.4], 
                              zoom: 8,
                              zoomControl: false})
  .addLayer(new L.TileLayer(host, {
      maxzoom: 19,
      attribution: attr
    }));

/* Map clones
 *
 */
var mc1 = new L.Map("mapclone_one", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false,
                              attributionControl:false})
                         .addLayer(new L.TileLayer(host));

// sync so that they overlap
xc = mc1.getContainer().parentElement.offsetLeft / map.getSize().x
yc = mc1.getContainer().parentElement.offsetTop / map.getSize().y
map.sync(mc1, 
        {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})


var mc2 = new L.Map("mapclone_two", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false,
                              attributionControl:false})
                         .addLayer(new L.TileLayer(host));

// sync so that they overlap
xc = mc2.getContainer().parentElement.offsetLeft / map.getSize().x
yc = mc2.getContainer().parentElement.offsetTop / map.getSize().y
map.sync(mc2, 
        {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})

/* =========================== */

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
      //riverkm.addData(data.features[1]).bindTooltip(data.features[i].properties.MODELKILOM, {direction: 'top'});//.openTooltip();
});

var dikeNew =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

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
    if (map.getZoom() < 11){
        if (map.hasLayer(dikeNew)) {
            map.removeLayer(dikeNew);
        } else {
            1+1;
        }
    }
    if (map.getZoom() >= 11){
        if (map.hasLayer(dikeNew)){
            1+1;
        } else {
            map.addLayer(dikeNew);
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
        maxVelocity: 4
        });
      velocityLayer.id = 'velos'
      thismap.addLayer(velocityLayer)
      
  });
}


