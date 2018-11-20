/** ////////////////////////////////////////////////////////////
 * todo: add meta info 
 * 
 * 
 */////////////////////////////////////////////////////////////
const version = 0.1;

/** ////////////////////////////////////////////////////////////
 * Extend jquery
 * 
 *
 */////////////////////////////////////////////////////////////

(function($){
  $(document).ready(function(){
    $('.cssmenu li.has-sub > ul').slideUp(200)
    $('.cssmenu li.has-sub>a').on('click', function(){
          //$(this).removeAttr('href');
          var element = $(this).parent('li');
          if (element.hasClass('open')) {
            element.removeClass('open');
            element.find('li').removeClass('open');
            element.find('ul').slideUp(200);
          }
          else {
            element.addClass('open');
            element.children('ul').slideDown(200);
            element.siblings('li').children('ul').slideUp(200);
            element.siblings('li').removeClass('open');
            element.siblings('li').find('li').removeClass('open');
            element.siblings('li').find('ul').slideUp(200);
          }
        });
    // after click, propagate collapse upstream
    $('.cssmenu li.no-sub > a').on('click', function(){
          var element = $(this).parent('li');
          element.removeClass('open');
          element.parent('li').removeClass('open');
          element.parent('ul').slideUp(200);
          element.parent('ul').parent('li').removeClass('open');
          element.parent('ul').parent('li').children('a').text($(this).text());
    });
  });
})(jQuery);

/** ////////////////////////////////////////////////////////////
 * Navigation toggles
 * 
 *
 */////////////////////////////////////////////////////////////

// Flags that remember which panel is out
var AppMenuToggle = true;
var AppToggles = [true, false, false, false, false];
var AppIds = ["#AboutPanel", "#StoryPanel", "#InterventionPanel", "#ComparePanel", "#PaperPanel"];
var ExploreToggle = true;
 
// Function to toggle navigation menu
var toggleAppMenu = function () {
  if (AppMenuToggle){
    $('#leftbar').css('transform','translate(-100%, 0%)');
    $('#appnavigation').css('transform','translate(0%, -150%)');
    AppMenuToggle = false;    
  } else {
    $('#leftbar').css('transform','translate(0%, 0%)');
    $('#appnavigation').css('transform','translate(0%, 0%)');
    AppMenuToggle = true;
  };
};

// Function to switch between apps
var toggleApp = function (appindex) {
  for (let i=0;i<AppToggles.length;i++){
    if (i == appindex) {
      $(AppIds[appindex]).css('transform','translate(0%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      $($('#appnavigation span').get(i)).addClass('app-active');
    } else{
      $(AppIds[i]).css('transform','translate(-120%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      $($('#appnavigation span').get(i)).removeClass('app-active');
  };
  };
};

// Default layout
toggleApp(4)


/** ////////////////////////////////////////////////////////////
 * Invisible scrollbar (perfectscrollbarjs)
 * For overflowing divs 
 *
 */////////////////////////////////////////////////////////////


const fs = new PerfectScrollbar('#CompareDescription', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
fs.update()

const ps = new PerfectScrollbar('#InterventionDescription', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
ps.update()

const scroll_welcomemenu = new PerfectScrollbar('#AboutPanel', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
scroll_welcomemenu.update()

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

/* === Maps ===
 */
var map = new L.Map("map", {center: [52,5],  // [51.845, 5.36], 13 for st andries
                            zoom: 7,
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

dike.addTo(map);

d3.json('shp/banddijken.json', function (data) {
    dike.addData(data)
  });

// All rhinekilometers
var riverkm = new L.geoJson(null, {
  style: InactiveRiverKmStyle,
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, InactiveRiverKmStyle)
  }
});

riverkm.addTo(map)

// When hovering over the backwater chart, the river km corresponding to the 
// x coordinate is highlighted
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
      style: PolyVisible,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });

// Lowered floodplain
var lowering =  new L.geoJson(null, {
      style: PolyVisible,
      pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {});
      }
  });


/* === Map events ===
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
);

/* === Map Functions ===
 */

var velocityLayer = {};

function removeVelocityLayerFromMap(){
  map.eachLayer(function (l) {
    if (l.id == 'velos'){
      map.removeLayer(l)
    }
  })
};

function addVelocityLayerToMap(file, thismap){
     d3.json(file, function (data) {
      velocityLayer = L.velocityLayer({
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
};



/** ////////////////////////////////////////////////////////////
 * Exploreation app
 */////////////////////////////////////////////////////////////

/* === UI ===
 */

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
      };
    };
  };
}; 

/* === IO ===
 */

function showReference() {
  /* Titles and descriptions */
  //document.getElementById("InterventionTitle").innerHTML = "Referentiesituatie";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 0 cm (--)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: --% (--)";
  $('#InterventionDescription').load('xml/reference_NL.xml');
  /* Figure */
  d3.json('data/reference_waterlevels_norm.json', function (d) {ExploreFigure.updateData(d)});
  

  /* Map */
  removeVelocityLayerFromMap();
  //addVelocityLayerToMap('data/waal_reference_0000.json', map)

  if (map.hasLayer(dikeNew)) {map.removeLayer(dikeNew)};
  if (map.hasLayer(embankments)) {map.removeLayer(embankments)};
  if (map.hasLayer(groynes)) {map.removeLayer(groynes)};
  if (map.hasLayer(sidechannels)) {map.removeLayer(sidechannels)};

  dike.setStyle(LineStyle);
}

function showRelo() {
  /* Titles and descriptions */
  //document.getElementById("InterventionTitle").innerHTML = "Dijkverlegging";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 108 cm (<span class='label_high'>hoog</span>)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 15% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('xml/dikerelocation_NL.xml');
  /* Figure */
  d3.json('data/relocation_int100.json', function(d){ExploreFigure.updateData(d)});
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
  //document.getElementById("InterventionTitle").innerHTML = "Maaien van de uiterwaard";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 28 cm (<span class='label_medium'>gemiddeld</span>)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 82% (<span class='label_low'>hoog</span>)";
  $('#InterventionDescription').load('xml/smoothing_NL.xml');
  
  /* Figure */
  d3.json('data/smoothing_int99.json', function(d){ExploreFigure.updateData(d)})  

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
  //document.getElementById("InterventionTitle").innerHTML = "Kribverlaging";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 4 cm (<span class='label_low'>laag</span>)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 23% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('xml/groynelowering_NL.xml');
  /* Figure */
  d3.json('data/groynelowering_int363.json', function(d){ExploreFigure.updateData(d)})  
  
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
  //document.getElementById("InterventionTitle").innerHTML = "Kadeverlaging";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 3 cm (<span class='label_low'>laag</span>)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 52% (<span class='label_low'>hoog</span>)";
  $('#InterventionDescription').load('xml/MINEMBLOW_NL.xml');
  /* Figure */
  d3.json('data/minemblowering_int150.json', function(d){ExploreFigure.updateData(d)})  
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
  //document.getElementById("InterventionTitle").innerHTML = "Uiterwaardvergraving";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 80 cm (<span class='label_high'>hoog</span>)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 28% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('xml/FLPLOW_NL.xml');
  /* Figure */
  d3.json('data/lowering_int99.json', function(d){ExploreFigure.updateData(d)})  
  
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
  //document.getElementById("InterventionTitle").innerHTML = "Nevengeulen";
  //document.getElementById("InterventionEffect").innerHTML = "Maximaal verwacht effect: 36 cm (<span class='label_medium'>gemiddeld</span>)";
  //document.getElementById("InterventionUncertainty").innerHTML = "Relatieve onzekerheid: 28% (<span class='label_high'>laag</span>)";
  $('#InterventionDescription').load('xml/SIDECHAN_NL.xml');
  /* Figure */
  d3.json('data/sidechannel_int100.json', function(d){ExploreFigure.updateData(d)})  

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


/** ////////////////////////////////////////////////////////////
 * Interaction
 *//////////////////////////////////////////////////////////////

/* Create initial shown data & initialise apps */
var ExploreFigure = {};
var CompareFigure = {};

function display(error, dataset, comparedata) {
  // === Background map ===
  //addVelocityLayerToMap('data/waal_reference_0000.json', map);
  
  // === Explore App ===
  protoSchematicRiverChart.apply(ExploreFigure);
  ExploreFigure.setCanvas('#ExploreCanvas');
  ExploreFigure.setData(dataset);
  ExploreFigure.init();
  ExploreFigure.moveAxis('x', 'zero')
  ExploreFigure.drawMedian();
  ExploreFigure.drawBands();
  ExploreFigure.showBands();
  $('#version-number-explore').text('Explore app: v' + ExploreFigure.getVersion());
  

  // Set callback between map and figure
  ExploreFigure.setXaxisCallback(function (coor) {
    d3.json('shp/rivierkilometers.json', function (data) {
      riverkmFocus.clearLayers();
      let index = (coor - 854) 
      riverkmFocus.addData(data.features[index]).bindTooltip('km '+coor, {direction: 'top'});//.openTooltip();
      });
    });

  // === Compare App ===
  //protoCompareChart.apply(CompareFigure);
  //CompareFigure.setCanvas('#CompareCanvas');
  //CompareFigure.setData(comparedata);
  //CompareFigure.init();
  //CompareFigure.drawInterventionLine();
  //CompareFigure.drawDesiredEffect();
  protoSteadyFlowApp.apply(CompareFigure)
  CompareFigure.setCanvas('#CompareCanvas');
  CompareFigure.init();
  $('#version-number-flow').text('Flow app: v' + CompareFigure.getVersion());
  showReference()
  // Make sure figure updates when window resizes
   d3.select(window)
      .on("resize.chart", function(){
          ExploreFigure.resize();
          CompareFigure.resize();
          ExploreFigure.setXaxisCallback(function (coor) {
            d3.json('shp/rivierkilometers.json', function (data) {
            riverkmFocus.clearLayers();
            let index = (coor - 854) 
            riverkmFocus.addData(data.features[index]);
          });
        });
      });
};


// Kick off everything
d3.queue()
  .defer(d3.json, 'data/relocation_int100.json')
  .defer(d3.json, 'data/exceedance_diagram_data.json')
  .await(display);


// === ~final

// Intervention width slider
$("#flat-slider")
    .slider({
        max: 10000,
        min: 0,
        range: true,
        values: [4000, 6000],
        change: function(event, ui) {
          CompareFigure.changeInterventionExtent(ui.values)
        }
    })
    .slider("pips", {
        first: "pip",
        last: "pip"
    });

// Downstream water level                    
$("#flat-slider-vertical-1")
  .slider({
        max: 7,
        min: 3,
        range: "min",
        value: 4,
        step: 0.5,
        orientation: "vertical",
        change: function(event, ui) {
          CompareFigure.changeBoundary(ui.value)
        }
    })
  .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

// Discharge
$("#flat-slider-vertical-2")
  .slider({
        max: 3000,
        min: 1000,
        range: "min",
        value: 2000,
        step: 200,
        orientation: "vertical",
        change: function(event, ui) {
          CompareFigure.changeDischarge(ui.value)
        }
    })
  .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

// Bed slope
$("#flat-slider-vertical-3")
  .slider({
        max: 6.5,
        min: 3.5,
        range: "min",
        value: 5,
        step: 0.25,
        orientation: "vertical",
        change: function(event, ui) {
          CompareFigure.changeSlope(ui.value/10000)
        }
    })
  .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

// Dredging depth
$("#flat-slider-vertical-4")
  .slider({
        max: 2,
        min: 0,
        range: "min",
        value: 0,
        step: 0.5,
        orientation: "vertical",
        change: function(event, ui) {
          CompareFigure.changeInterventionDepth(-1*ui.value)
        }
    })
  .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");

/** ////////////////////////////////////////////////////////////
 * Storyline app
 */////////////////////////////////////////////////////////////

var StoryProgress = 0;
var NumberOfStories = 12;

function storyTest () {
  console.log("StoryTestFunc fired")
};

function show_welcome() {
  $("#StoryCanvas").css('transform', 'translate(0%, 0%)');
};

function hide_welcome() {
  $("#StoryCanvas").css('transform', 'translate(-100%, 0%)');
};

function show_flowcanvas() {
  hide_welcome();
  $('#ComparePanel').css('transform','translate(0%, 0%)');
  $('#CompareOptions').css('transform','translate(-120%, 0%)');
  $('#CompareDescription').css('transform','translate(-120%, 0%)');
}

function map_zoom_NL() {
  map.setView([52, 5], 7);
};

function map_zoom_Waal() {
  hide_welcome()
  map.setView([51.823, 5.3682], 9);
};

function map_zoom_StAndries() {
  map.setView([51.823, 5.3682], 11);
  story_show_uncertainty();
};

function hide_flowcanvas() {  
  $('#ComparePanel').css('transform','translate(-120%, 0%)');
}

function show_interventioncanvas() {
  $('#InterventionPanel').css('transform','translate(0%, 0%)');
  $('#IntensitySwitchDiv').css('transform','translate(-120%, 0%)');
  $('#InterventionTable').css('transform','translate(-120%, 0%)');
  $('#Description').css('transform','translate(-120%, 0%)');
};

function hide_interventioncanvas() {
  $('#InterventionPanel').css('transform','translate(-120%, 0%)');
};

function story_discharge_down() {
  CompareFigure.changeDischarge(1250);
};

function story_discharge_up() {
  CompareFigure.changeDischarge(2000);
};

function story_show_uncertainty() {
  hide_flowcanvas();
  show_interventioncanvas();
};

function story_lower_bed() {
  CompareFigure.changeInterventionDepth(-1)
};

function reset_story(){
  CompareFigure.changeInterventionDepth(0)
  CompareFigure.changeDischarge(2000);
  show_welcome();
  showReference();
  hide_flowcanvas();
  hide_interventioncanvas();
  map_zoom_NL();
};

function show_storycanvas_hide_flow(){
  hide_flowcanvas();
  show_welcome()
};

var StoryFunctions = [reset_story, 
                      show_flowcanvas, 
                      story_discharge_down, 
                      story_discharge_up, 
                      storyTest,
                      storyTest, 
                      show_storycanvas_hide_flow,
                      map_zoom_Waal, 
                      hide_interventioncanvas,
                      map_zoom_StAndries,
                      showSmooth,
                      showSIDECHAN,
                      storyTest,
                      storyTest
                      ]

$('#StoryText').load('xml/story0.xml');

$(".progress").each(function () {
  var $outside = $("<div></div>").addClass("progress-outside");
  var $inside = $("<div></div>").addClass("progress-inside").css('width', "0px");
  var $label = $("<span></span>").addClass("val").text($(this).text()).css("color", "transparent");
  $(this).text('');
  $inside.append($label);
  $outside.append($inside);  
  $(this).append($outside);
});

function nextStory () {
  
  if (StoryProgress < NumberOfStories) {
    StoryProgress += 1 
    $('#StoryText').load('xml/stories.xml #'+StoryProgress);
    StoryFunctions[StoryProgress]();
    let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%"
  $(".progress .progress-inside").each(function () {
    $(this).css("width", progresstext);
    $(this).text(progresstext);
    $(this).children(".val").css("color", "inherit");
  });
};
};

function previousStory () {
  if (StoryProgress > 0) {
    StoryProgress -= 1
    $('#StoryText').load('xml/stories.xml #'+StoryProgress);
    StoryFunctions[StoryProgress]();
    $(".progress .progress-inside").each(function () {
    let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%"
    $(this).css("width", progresstext);
    $(this).text(progresstext);
    $(this).children(".val").css("color", "inherit");
  });
};
};

function resetStory () {
  StoryProgress = 0;
  reset_story();
  $('#StoryText').load('xml/stories.xml #'+StoryProgress);
  $(".progress .progress-inside").each(function () {
    let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%"
    $(this).css("width", progresstext);
    $(this).text(progresstext);
    $(this).children(".val").css("color", "inherit");
  });
};

$(document).ready(function () {
  // renderProgress();
});

$('#version-number-site').text('Website: v' + version);

