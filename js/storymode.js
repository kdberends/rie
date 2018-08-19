
/** ////////////////////////////////////////////////////////////
 * Scrollsnap
 *
 *
 */////////////////////////////////////////////////////////////




/** ////////////////////////////////////////////////////////////
 * Figure
 *
 *
 */////////////////////////////////////////////////////////////
var Figure = {};
function display(error, dataset1, dataset2) {
  var datasets = [dataset1, dataset2]

  protoSchematicRiverChart.apply(Figure)
  Figure.setCanvas('#FigureCanvas')
  Figure.setData(dataset2)
  Figure.init()


  // Set callback between map and figure
  Figure.setXaxisCallback(function (coor) {
    d3.json('shp/rivierkilometers.json', function (data) {
      riverkmFocus.clearLayers();
      let index = (coor - 854) 
      riverkmFocus.addData(data.features[index]).bindTooltip('km '+coor, {direction: 'top'});//.openTooltip();
      });
    });

  // Make sure figure updates when window resizes
 d3.select(window)
    .on("resize.chart", function(){
        Figure.resize()
        Figure.setXaxisCallback(function (coor) {
        d3.json('shp/rivierkilometers.json', function (data) {
        riverkmFocus.clearLayers();
        let index = (coor - 854) 
        riverkmFocus.addData(data.features[index]);
        });
      });
    });

  // Scroller
};


d3.queue()
  .defer(d3.json, 'data/relocation_int100.json')
  .defer(d3.json, 'data/smoothing_int99.json')
  .await(display);

/** ////////////////////////////////////////////////////////////
 * Story scroller
 *
 *
 */////////////////////////////////////////////////////////////
var scroll = scroller().container(d3.select('#storycontainer'));

// pass in .step selection as the steps
scroll(d3.selectAll('.storystep'));
// setup event handling
scroll.on('active', function (index, positions) {
  // highlight current step text
  d3.selectAll('.storystep')
    .style('opacity', 
    	   function (d, i) { return i === index ? 1 : 0.2; });
 
  // activate current section
  if (index==0){
    //storyScrollTo(positions[0]+50)
    d3.select('.figurebox')
      .transition()
      .duration(500)
      .style("opacity", 1)
      .style("pointer-events", "initial")
    d3.json('data/reference_waterlevels.json', function(d){
      Figure.updateData(d)
      Figure.drawMedian()
      })
  }
  else if (index==1) {
    //storyScrollTo(positions[1]+50)
    d3.json('data/relocation_int100.json', function(d){
      Figure.updateData(d)
      Figure.moveAxis('x', 'bottom')
    });
  }
  else if (index==2){
    //storyScrollTo(positions[2]+50)
    d3.select('.figurebox')
      .transition()
      .duration(500)
      .style("opacity", 0)
      .style("pointer-events", "none")
  } 
});

function scrollTopTween(scrollTop) {
  console.log('scrolling to '+ scrollTop)
  return function() {
    var i = d3.interpolateNumber(d3.select('#storycontainer').node().scrollTop, scrollTop);
    return function(t) { d3.select('#storycontainer').node().scrollTop = i(t); };
 };
};

function storyScrollTo(scrollTop){
  d3.select("#storycontainer")
    .transition()
    .duration(1000)
    .tween('scrollme', scrollTopTween(scrollTop))  
};

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
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
ps.update()

/** ////////////////////////////////////////////////////////////
 * Background map
 *
 *
 */////////////////////////////////////////////////////////////

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



var map = new L.Map("map", {center: [52.5, 4.4], 
                              zoom: 8,
                              zoomControl: false})
  .addLayer(new L.TileLayer(host, {
      maxzoom: 19,
      attribution: attr
    }));

/** ////////////////////////////////////////////////////////////
 * Map clones 
 *
 *
 */////////////////////////////////////////////////////////////
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

/** ////////////////////////////////////////////////////////////
 * Map elements (dikes etc)
 *
 *
 */////////////////////////////////////////////////////////////


var points = null

// Dikes
var dike_reference =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
}).addTo(map);

var dike_new =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
});

d3.json('shp/banddijken.json', function (data) {
    dike_reference.addData(data)
    dike_reference.setStyle({opacity: 0})
  });

// rhine kilometers
var riverkm = new L.geoJson(null, {
  style: InactiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, InactiveRiverKmStyle)
  }
}).addTo(map)

var riverkmFocus = new L.geoJson(null, {
  style: ActiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, ActiveRiverKmStyle)
  }
}).addTo(map);


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


/** ////////////////////////////////////////////////////////////
 * Map events
 *
 *
 */////////////////////////////////////////////////////////////

map.on('zoomend', function() {
    let dikes = [dike_reference, dike_new]
    for (var i=0;i<dikes.length;i++){
      if (map.getZoom() < 11){
        // Only show dike while zoomed in
          if (map.hasLayer(dikes[i])) {
              //map.removeLayer(dike);
              dikes[i].setStyle({opacity: 0.0})
          } 
      }
      else if (map.getZoom() >= 11){
          if (map.hasLayer(dikes[i])){
              dikes[i].setStyle({opacity: 1.0})
          }
        }
    }
});


/** ////////////////////////////////////////////////////////////
 * Map functions
 *
 *
 */////////////////////////////////////////////////////////////

function removeVelocityLayerFromMap(){
  map.eachLayer(function (l) {
    if (l.id == 'velos'){
      map.removeLayer(l)
    }
  })
};

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
};


