/* Leaflet elements */

const map_version = 0.2;
var velocityLayer = {};
/* STYLES */

/* Dike */
var LineStyle = {
    "stroke": true,
    "color": "#E4E4E4",
    "weight": 4,
    "dashArray": "1 0",
    "dashOffset": "1",
  };

var MinorEmbankmentStyle = {
    "stroke": true,
    "color": "#53EEF4",
    "weight": 2,
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

var PolyMowing = {
          "stroke": true,
          "weight": 1,
          "color": "#3BA120", // color of fill
          "opacity": 0,  // opacity of stroke
          "fillOpacity": 0.4,
};

var PolySideChannels = {
          "stroke": true,
          "weight": 1,
          "color": "#0CBCD1", // color of fill
          "opacity": 0,  // opacity of stroke
          "fillOpacity": 0.4
};

var PolyLowering = {
          "stroke": true,
          "weight": 1,
          "color": "#3BA120", // color of fill
          "opacity": 0,  // opacity of stroke
          "fillOpacity": 0.4,
};
/** ////////////////////////////////////////////////////////////
 * Background map (Leaflet)
 *
 * Other servers: (light themes!)
 * var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
 * var host = "https://korona.geog.uni-heidelberg.de/tiles/roadsg/x={x}&y={y}&z={z}";
 * var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png";
 * var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png";
 * var host = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
 *
 */////////////////////////////////////////////////////////////


/* === Styles ===
 */

//var host = "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png";
var host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";
// Attribution is now embedded in menu, no longer in map
var attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'



/* === Maps ===
 */
var map = new L.Map("map", {center: [51.845, 5.36],  // [51.845, 5.36], 13 for st andries, [52, 5], 7 for waal
                            zoom: 13,
                            zoomControl: false,
                            attributionControl:false })
  .addLayer(new L.TileLayer(host, {
      maxzoom: 19,
      attribution: attr}
    )
  );

// Clone of map for 'glass blur' effect
var map2 = new L.Map("map_clone", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false,
                              attributionControl:false})
  .addLayer(new L.TileLayer(host));

// sync so that they overlap
xc = map2.getContainer().parentElement.offsetLeft / map.getSize().x
yc = map2.getContainer().parentElement.offsetTop / map.getSize().y
map.sync(map2, {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})


/* === Map elements ===
 */

// Reference dikes
var dike =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

d3.json('shp/banddijken.json', function (data) {
    dike.addData(data)
  });

// When hovering over the backwater chart, the river km corresponding to the 
// x coordinate is highlighted
var riverkmFocus = new L.geoJson(null, {
  style: ActiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, ActiveRiverKmStyle)
  }
});

// Relocated dike
var dikeNew =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// minor embankments
var embankments =  new L.geoJson(null, {
      style: MinorEmbankmentStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Lowered groynes
var groynes =  new L.geoJson(null, {
      style: MinorEmbankmentStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Constructed side channels
var sidechannels =  new L.geoJson(null, {
      style: PolySideChannels,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Lowered floodplain
var lowering =  new L.geoJson(null, {
      style: PolyLowering,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Mowing floodplain
var mowing =  new L.geoJson(null, {
      style: PolyMowing,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

/* Add groups */
var mapElementsGroup = new L.layerGroup(); 
var mapZoomGroup = new L.layerGroup();  // shows only on very high levels of zoom

/* Add to Map */
function addRiverkilometerToMap() {
  d3.json('shp/rivierkilometers.json', function (data) {
    for (var i=1;i<100;i+=5){
        mapZoomGroup.addLayer(new L.geoJson(null, 
          {style: InactiveRiverKmStyle,
           pointToLayer: function (feature, latlng) {
                          return L.circleMarker(latlng, InactiveRiverKmStyle)
                         }
          })
         .addData(data.features[i])
         .bindTooltip('km '+ data.features[i].properties.MODELKILOM.substring(0, 3),
                      {direction: 'top',
                       permanent: true,
                       className: 'kmtooltip'}
                      )
    )};
  });
};
addRiverkilometerToMap()
mapElementsGroup.addLayer(dike);
mapElementsGroup.addLayer(riverkmFocus);
mapElementsGroup.addTo(map);

/* === Map events ===
 */

/* on zoomlevels smaller than 11, remove all elements from map */
map.on('zoomend', function() {
  
  if (map.getZoom() < 11){
      map.removeLayer(mapElementsGroup)
  }
  if (map.getZoom() < 13){
      map.removeLayer(mapZoomGroup)
  }
  if (map.getZoom() >= 11){
      map.addLayer(mapElementsGroup)
    }
  if (map.getZoom() >= 13){
      map.addLayer(mapZoomGroup)
    }
  }
);

/* === Map Functions ===
 */

/* adds a tooltip at the second set of coordinates, marker at both 
   sets and a line in between
 */

function mapZoomToStudyArea() {
  map.setView([51.85, 5.35], 12);
};


function resetElementsOnMap(){
  mapElementsGroup.clearLayers();
  mapElementsGroup.addLayer(dike);
  mapElementsGroup.addLayer(riverkmFocus);
  dike.setStyle(LineStyle);
};

function addElementToMap(element, jsonfile) {
  element.clearLayers()
  d3.json(jsonfile, function (data) {
          mapElementsGroup.addLayer(element.addData(data));
          });
};

/* Coordinates is set of coordinates ([lat,lon], [lat,lon])*/
function addTooltipToMap(coordinates, options) {
    if (typeof options.style == "undefined") {options.style = 'map-tooltip'};
    
    // Add marker at first coordinate
    mapElementsGroup.addLayer(new L.circleMarker(coordinates[0], {
            color: 'white',
            pane: 'tooltipPane',
            fillColor: 'white',
            fillOpacity: 1,
            radius: 3
        }));
    
    // Add marker at last coordinate
    var endPoint = new L.circleMarker(coordinates[1], {
        color: 'white',
        fillColor: 'white',
        pane: 'tooltipPane',
        fillOpacity: 1,
        radius: 2
    }).bindTooltip('tooltiptext', {className: options.style +' '+options.id,
                                       direction: options.align,
                                       id: 'koenm',
                                       permanent: true})
      .openTooltip();

    // Add point to group & add line to join the two points
    mapElementsGroup.addLayer(endPoint);
    mapElementsGroup.addLayer(new L.Polyline(coordinates, {
      color: 'white',
      weight: 3,
      opacity: 1,
      pane: 'tooltipPane',
      smoothFactor: 1
    }));

    // Change text in tooltip
    if (options.text) {
        endPoint.setTooltipContent(options.text);
    } else {
      $.ajax({type: "GET",
              url: 'xml/'+options.file,
              datatype: 'xml',
              success: function(xml) {
                       endPoint.setTooltipContent($(xml).find(options.div).text());
                       }
              });
    };
};

function addMaximumEffectTooltip() {
  let maxeff = ExploreFigure.getLocationOfMaximumEffect();  
  let tooltiptext = 'The maximum decrease in flood levels is reached here, at km '+
                    maxeff[0] + ' and is on average ' + maxeff[1].toFixed(2)+ 'm'; 
  d3.json('shp/rivierkilometers.json', function (data) {
     let maxloc = data.features[maxeff[0] - 854].geometry.coordinates.reverse();
     let tiploc = [maxloc[0] + 0.01, maxloc[1]]
     addTooltipToMap([maxloc, tiploc],
                     {text: tooltiptext,
                      align: 'top', 
                      style: 'map-tooltip-special'})      
  });
};

function addDownstreamPeak() {
  let maxeff = ExploreFigure.getLocationOfMaximumEffect(-1);  
  let tooltiptext = 'Downstream from the intervention there is a small increase ' +
                    'in water level. This is largest at km '+
                    maxeff[0] + ' and is on average ' + maxeff[1].toFixed(2)+ 'm'; 
  d3.json('shp/rivierkilometers.json', function (data) {
     let maxloc = data.features[maxeff[0] - 854].geometry.coordinates.reverse();
     let tiploc = [maxloc[0] + 0.01, maxloc[1]]
     console.log(maxeff)
     addTooltipToMap([maxloc, tiploc],
                     {text: tooltiptext,
                      align: 'top', 
                      style: 'map-tooltip-special'})      
  });
};

function removeVelocityLayerFromMap(){
  mapZoomGroup.removeLayer(velocityLayer)
};

function addVelocityLayerToMap(file, thismap){
     d3.json(file, function (data) {
      velocityLayer = new L.velocityLayer({
        displayValues: true, 
        displayOptions: {
          velocityType: 'Flow velocity',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data',
          speedUnit: 'm/s',
          transition: "opacity 1s ease-out"
        },
        data: data,
        maxVelocity: 4,
        velocityScale: 0.01,
        //colorScale: ['#FFFFFF','#0C00FF']
        });
      velocityLayer.id = 'velos'
      mapZoomGroup.addLayer(velocityLayer)
  });
};
