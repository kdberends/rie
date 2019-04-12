/* Leaflet elements */
import {settings, charts} from '../js/mainui.js'

export const version = 0.3;


var velocityLayerID = {};
var map = {}; 
var map2 = {}; 
/* Layer groups */
var mapElementsGroup = new L.layerGroup(); 
var mapZoomGroup = new L.layerGroup();  // shows only on very high levels of zoom


/* STYLES */

/* Dike */
export var LineStyle = {
    "stroke": true,
    "color": "#E28219",
    "weight": 4,
    "dashArray": "1 0",
    "dashOffset": "1",
  };

var MinorEmbankmentStyle = {
    "stroke": true,
    "color": "#53EEF4",
    "weight": 2,
  };

export var DashStyle = {
    "stroke": true,
    "color": "#A96538",
    "weight": 2,
    "dashArray": "10 5",
    "dashOffset": "1"
  };

var StudyAreaStyle = {
    "stroke": true,
    "color": "#6C716C",
    "weight": 2,
    "fillOpacity": 0,
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

var WaalOutlineStyle = {
          "stroke": true,
          "weight": 1,
          "color": "#0CBCD1", // color of fill
          "opacity": 0,  // opacity of stroke
          "fillOpacity": 0.2
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
var attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
var tilelayer1 = {};
var tilelayer2 = {};

export function setTileLayerHost(theme='dark') {
  if (theme == 'dark') {
    host = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";
    
  } else if (theme == "light"){
    // option 1
    host = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

    // option 2
    //host = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png'
    //attr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };
};

export function addTileLayers(){
  tilelayer1 = new L.TileLayer(host);
  tilelayer2 = new L.TileLayer(host);
  map.addLayer(tilelayer1);
  map2.addLayer(tilelayer2);
};

export function removeTileLayers() {
  map.removeLayer(tilelayer1)
  map.removeLayer(tilelayer2)
};

// add maps
map = new L.Map("map", {center: [51.845, 5.36],  // [51.845, 5.36], 13 for st andries, [52, 5], 7 for waal
                            zoom: 13,
                            zoomControl: false,
                            attributionControl:false })

map2 = new L.Map("map_clone", {center: [51.84, 5.46], 
                              zoom: 13,
                              zoomControl: false,
                              attributionControl:false})
addTileLayers();

/* === Maps ===
 */

// sync so that they overlap (the numbers are to correct for the margin of mapclone css)
let xc = (map2.getContainer().parentElement.offsetLeft-20) / map.getSize().x
let yc = (map2.getContainer().parentElement.offsetTop-20) / map.getSize().y
map.sync(map2, {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})

//xc = (map3.getContainer().parentElement.offsetLeft+150) / map.getSize().x
//yc = (map3.getContainer().parentElement.offsetTop+40) / map.getSize().y
//map.sync(map3, {offsetFn: L.Sync.offsetHelper([xc, yc], [0, 0])})


/* === Map elements ===
 */

// Waal river outline
var waal_outline = new L.geoJson(null, {
  style: WaalOutlineStyle,
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {});
  }
});

d3.json('data/waal_bed.json', function(d) {
  waal_outline.addData(d)});

// study area rect.
var studyarea_rect =  L.rectangle([[51.79, 5.267], [51.889, 5.507]], StudyAreaStyle);

// Reference dikes
export var dike =  new L.geoJson(null, {
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
export var riverkmFocus = new L.geoJson(null, {
  style: ActiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, ActiveRiverKmStyle)
  }
});

// Relocated dike
export var dikeNew =  new L.geoJson(null, {
      style: LineStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// minor embankments
export var embankments =  new L.geoJson(null, {
      style: MinorEmbankmentStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Lowered groynes
export var groynes =  new L.geoJson(null, {
      style: MinorEmbankmentStyle,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Constructed side channels
export var sidechannels =  new L.geoJson(null, {
      style: PolySideChannels,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Lowered floodplain
export var lowering =  new L.geoJson(null, {
      style: PolyLowering,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Mowing floodplain
export var mowing =  new L.geoJson(null, {
      style: PolyMowing,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });


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
//mapElementsGroup.addLayer(dike);
//mapElementsGroup.addLayer(waal_outline);
//mapElementsGroup.addLayer(riverkmFocus);
mapElementsGroup.addTo(map);

/* === Map events ===
 */

/* on zoomlevels smaller than 11, remove all elements from map */
map.on('zoomend', function() {
  
  if (map.getZoom() < 10){
      map.removeLayer(mapElementsGroup)
  }
  if (map.getZoom() < 13){
      map.removeLayer(mapZoomGroup)
  }
  if (map.getZoom() >= 10){
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

export function ZoomToStudyArea() {
  map.setView([51.85, 5.35], 12);
};

export function mapZoomToStAndries() {
  map.setView([51.804, 5.3546], 15);
};

export function resetElementsOnMap(){
  mapElementsGroup.clearLayers();
  mapElementsGroup.addLayer(dike);
  mapElementsGroup.addLayer(waal_outline);
  mapElementsGroup.addLayer(riverkmFocus);
  mapElementsGroup.addLayer(studyarea_rect);
  dike.setStyle(LineStyle);
};

export function addElementToMap(element, jsonfile) {
  element.clearLayers()
  d3.json(jsonfile, function (data) {
          mapElementsGroup.addLayer(element.addData(data));
          });
};

/* Coordinates is set of coordinates ([lat,lon], [lat,lon])*/
export function addTooltipToMap(coordinates, options) {
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
              url: 'xml/'+settings.currentLang+'/'+options.file,
              datatype: 'xml',
              success: function(xml) {
                       endPoint.setTooltipContent($(xml).find(options.div).text());
                       }
              });
    };
};

export function addMaximumEffectTooltip() {
  let maxeff = charts.exploreFigure.getLocationOfMaximumEffect();  
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
  let maxeff = charts.exploreFigure.getLocationOfMaximumEffect(-1);  
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

/* removes velocity layer from layer group mapZoomGroup */
export function removeVelocityLayerFromMap(){
  mapZoomGroup.eachLayer(function (l){
    if (l.options.maxVelocity > 0) {mapZoomGroup.removeLayer(l)}});
};

export function addVelocityLayerToMap(file, thismap){
     d3.json(file, function (data) {
      mapZoomGroup.addLayer(new L.velocityLayer({
        displayValues: true, 
        displayOptions: {
          velocityType: 'Flow velocity',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data',
          speedUnit: 'm/s',
          transition: "opacity 1s ease-out"
        },
        data: data,
        maxVelocity: 2,
        velocityScale: 0.01,
        colorScale: settings.velocityColorScale
        }));
  });
};

export function zoom_NL() {
  map.setView([52, 5], 7);
};

export function zoom_Waal() {
  map.setView([51.823, 5.3682], 10);
};
  
export function zoom_StAndries() {
  map.setView([51.823, 5.3682], 12);
};
