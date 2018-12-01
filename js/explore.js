/** ////////////////////////////////////////////////////////////
 * todo: add meta info 
 * 
 * 
 */////////////////////////////////////////////////////////////

const version = "0.40";

// find out info about user
console.log('Hi there!')
console.log("You are running version v"+version)
console.log('According to your browser, your preferred language is: '+navigator.language)

// load about
$('#AboutContent').load('xml/about_en.xml');
$('#PaperContent').load('xml/learn_en.xml');

/*
https://stackoverflow.com/questions/50543163/can-i-detect-if-my-pwa-is-launched-as-an-app-or-visited-as-a-website
// Detects if device is on iOS 
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test( userAgent );
};
// Detects if device is in standalone mode
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

// Checks if should display install popup notification:
if (isIos() && !isInStandaloneMode()) {
  this.setState({ showInstallMessage: true });
};

this.setState({ showInstallMessage: true });
*/




/** ////////////////////////////////////////////////////////////
 * Extend jquery
 * 
 *
 */////////////////////////////////////////////////////////////

(function($){
  $(document).ready(function(){
    $('.cssmenu li.has-sub > ul').slideUp(200)
    $('.cssmenu li.has-sub>a').on('click', function(){
          var element = $(this).parent('li');
          if (element.hasClass('open')) {
            // when already open, close
            element.removeClass('open');
            element.find('li').removeClass('open');
            element.find('ul').slideUp(300);
          }
          else {
            // when closed, open
            element.addClass('open');
            element.children('ul').slideDown(300);
            element.siblings('li').children('ul').slideUp(300);
            element.siblings('li').removeClass('open');
            element.siblings('li').find('li').removeClass('open');
            element.siblings('li').find('ul').slideUp(300);
          }
        });
    // after click, propagate collapse upstream and set text
    $('.cssmenu li.no-sub > a').on('click', function(){
          var element = $(this).parent('li');
          element.removeClass('open');
          element.parent('li').removeClass('open');
          element.parent('ul').slideUp(200);
          element.parent('ul').parent('li').removeClass('open');
          element.parent('ul').parent('li').children('a').text($(this).text());
          $('#MapInterventionTitle').text($(this).text())
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
var AppToggles = [true, false, false, false, false, false];
var AppIds = ["#AboutPanel", "#StoryPanel", "#ExplorePanel", "#PaperPanel", "#SettingsPanel", '#FlowPanel'];
var ExploreToggle = true;
 
// Function to toggle navigation menu
var toggleAppMenu = function () {
  if (AppMenuToggle){
    $('#leftbar').css('transform','translate(-100%, 0%)');
    $('#appnavigation').css('transform','translate(0%, -150%)');
    $('#Scenarioselector').css('transform','translate(0px, 0%)');
    $('#MapButtons').css('transform','translate(0px, 0%)');
    $('#Scenarioselector').get(0).style.setProperty('--left', '5px');
    AppMenuToggle = false;    
  } else {
    $('#leftbar').css('transform','translate(0%, 0%)');
    $('#appnavigation').css('transform','translate(0%, 0%)');
    $('#Scenarioselector').css('transform','translate(350px, 0%)');
    $('#MapButtons').css('transform','translate(380px, 0%)');
    $('#Scenarioselector').get(0).style.setProperty('--left', '355px');
    AppMenuToggle = true;
  };
};

// Function to switch between apps
var toggleApp = function (appindex) {
  for (let i=0;i<AppToggles.length;i++){
    if (i == appindex) { 
      // show requested app and its children
      $(AppIds[i]).css('transform','translate(0%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      // highlight current app in navigator
      $($('#appnavigation span').get(i)).addClass('app-active');
      // if click on story, reset and go to overview
      if (i==1){openStoryOverview()}
    } else{
      // hide other apps and their children 
      $(AppIds[i]).css('transform','translate(-120%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      $($('#appnavigation span').get(i)).removeClass('app-active');
  };
  };
};

// Default layout
toggleApp(0)


/** ////////////////////////////////////////////////////////////
 * Invisible scrollbar (perfectscrollbarjs)
 * For overflowing divs 
 *
 */////////////////////////////////////////////////////////////


const ss = new PerfectScrollbar('#StoryScroll', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
ss.update()

//const fs = new PerfectScrollbar('#FlowScroll', {
//  wheelSpeed: 1,
//  wheelPropagation: false,
//  minScrollbarLength: 20,
//  swipeEasing: true
//});
//fs.update()

const es = new PerfectScrollbar('#ExploreScroll', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
es.update()

const as = new PerfectScrollbar('#AboutPanel', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
as.update()

const ps = new PerfectScrollbar('#PaperContent', {
  wheelSpeed: 1,
  wheelPropagation: false,
  minScrollbarLength: 20,
  swipeEasing: true
});
ps.update()


/** ////////////////////////////////////////////////////////////
 * Exploration app
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
  $('#InterventionDescription').load('xml/reference_NL.xml');
  
  /* Figure */
  d3.json('data/reference_waterlevels_norm.json', function (d) {ExploreFigure.updateData(d)});
  
  /* map */
  // Velocity visualisation  
  removeVelocityLayerFromMap();
  addVelocityLayerToMap('data/waal_reference_0000.json', map);

  // Add visual elements for this intervention
  resetElementsOnMap();
};

function showRelo() {
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/dikerelocation_NL.xml');
  
  /* Figure */
  d3.json('data/relocation_int100.json', function(d){
          ExploreFigure.updateData(d, function(){
              addMaximumEffectTooltip();
              //addDownstreamPeak();
          })});
  
  /* map */
  // Velocity visualisation  
  removeVelocityLayerFromMap();
  addVelocityLayerToMap('data/waal_int07_0000.json', map);

  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(dikeNew, 'shp/banddijken_relocation_int100.json');
  dike.setStyle(DashStyle);

  // add 'legend'
  addTooltipToMap([[51.81, 5.31], [51.80, 5.30]], 
                 {file:'tooltip_relocation_en.xml', 
                  id: 'relotooltip0',
                  div: '#0',
                  align: 'left'});

  addTooltipToMap([[51.841, 5.37], [51.87, 5.37]], 
                 {file:'tooltip_relocation_en.xml', 
                  id: 'relotooltip1',
                  div: '#1',
                  align: 'left'});

  addTooltipToMap([[51.854, 5.40], [51.86, 5.43]], 
                 {file:'tooltip_relocation_en.xml', 
                  id: 'relotooltip2',
                  div: '#2',
                  align: 'right'});
};


function showSmooth() {
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/smoothing_NL.xml');
  
  /* Explore figure */
  d3.json('data/smoothing_int99.json', function(d){
    ExploreFigure.updateData(d, function () {
      addMaximumEffectTooltip();
      //addDownstreamPeak();
    })
  })  

  /* Map */
  // Velocity visualisation
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int11_0000.json', map);

  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(mowing, 'shp/flplowering_int99.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_smoothing_en.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

  
};

function showGROYNLOW(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/groynelowering_NL.xml');
  
  /* Figure */
  d3.json('data/groynelowering_int363.json', function(d){
           ExploreFigure.updateData(d, function() {
            addMaximumEffectTooltip();
           })});
  
  /* Map */
  // Velocity visualisation
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int01_0000.json', map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(groynes, 'shp/groynlow.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.8135, 5.3745], [51.80, 5.40]], 
                {file: 'tooltip_groynes_en.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});
  
};

function showMINEMBLOW(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/MINEMBLOW_NL.xml');
  /* Figure */
  d3.json('data/minemblowering_int150.json', function(d){
           ExploreFigure.updateData(d, function() {
              addMaximumEffectTooltip();
              addMaximumEffectTooltip();
              //addDownstreamPeak();
           })}); 
  
  /* Map */
  // Velocity visualisation
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int04_0000.json', map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(groynes, 'shp/minemblow.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.8279, 5.3931], [51.81, 5.41]], 
                {file: 'tooltip_minemb_en.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

};

function showFLPLOW(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/FLPLOW_NL.xml');
  
  /* Figure */
  d3.json('data/lowering_int99.json', function(d){
           ExploreFigure.updateData(d, function() {
            addMaximumEffectTooltip();
            //addDownstreamPeak();
           })}) ; 
  
  /* Map */
  // Velocity visualisation
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int03_0000.json', map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(lowering, 'shp/flplowering_int99.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_lowering_en.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});
};

function showSIDECHAN(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/SIDECHAN_NL.xml');
  
  /* Figure */
  d3.json('data/sidechannel_int100.json', function(d){
            ExploreFigure.updateData(d, function() {
              addMaximumEffectTooltip();
              //addDownstreamPeak();
            })});  

  /* Map */
  // Velocity visualisation
  removeVelocityLayerFromMap()
  addVelocityLayerToMap('data/waal_int09_0000.json', map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(sidechannels, 'shp/sidechannel_int100.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_sidechannels_en.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

};


/** ////////////////////////////////////////////////////////////
 * Interaction
 *//////////////////////////////////////////////////////////////

/* Create initial shown data & initialise apps */
var ExploreFigure = {};
var FlowFigure = {};

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
  $('#version-number-explore').text('Explore: v' + ExploreFigure.getVersion());
  

  // Set callback between map and figure
  ExploreFigure.setXaxisCallback(function (coor) {
    d3.json('shp/rivierkilometers.json', function (data) {
      riverkmFocus.clearLayers();
      let index = (coor - 854) 
      riverkmFocus.addData(data.features[index]).bindTooltip('km '+coor, {direction: 'top'});//.openTooltip();
      });
    });

  // === Compare App ===
  //protoCompareChart.apply(CompareFigure );
  //CompareFigure.setCanvas('#CompareCanvas');
  //CompareFigure.setData(comparedata);
  //CompareFigure.init();
  //CompareFigure.drawInterventionLine();
  //CompareFigure.drawDesiredEffect();
  protoSteadyFlowApp.apply(FlowFigure)
  FlowFigure.setCanvas('#FlowCanvas');
  FlowFigure.init();
  $('#version-number-flow').text('Flow: v' + FlowFigure.getVersion());
  
  showReference()
  
  // Make sure figure updates when window resizes
   d3.select(window)
      .on("resize.chart", function(){
          ExploreFigure.resize();
          FlowFigure.resize();
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
          FlowFigure.changeInterventionExtent(ui.values)
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
          FlowFigure.changeBoundary(ui.value)
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
          FlowFigure.changeDischarge(ui.value)
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
          FlowFigure.changeSlope(ui.value/10000)
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
          FlowFigure.changeInterventionDepth(-1*ui.value)
        }
    })
  .slider("pips", {
        first: "pip",
        last: "pip"
    })
    .slider("float");



$(document).ready(function () {
  // renderProgress();
});

$('#version-number-ui').text('App: v' + version);
$('#version-number-map').text('Map: v' + map_version);
