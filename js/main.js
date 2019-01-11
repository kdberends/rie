/** ////////////////////////////////////////////////////////////
_                           ______                        
|_   __ \    (_)                        .' ___  |                       
  | |__) |   __  _   __  .---.  _ .--. / .'   \_| ,--.   _ .--.  .---.  
  |  __ /   [  |[ \ [  ]/ /__\\[ `/'`\]| |       `'_\ : [ `/'`\]/ /__\\ 
 _| |  \ \_  | | \ \/ / | \__., | |    \ `.___.'\// | |, | |    | \__., 
|____| |___|[___] \__/   '.__.'[___]    `.____ .'\'-;__/[___]    '.__.' 
                                                                        
contact: k.d.berends@utwente.nl | koen.berends@deltares.nl
*/////////////////////////////////////////////////////////////


const version = "0.5";
var ExploreFigure = {}; // figure that has uncertainty bands
var FlowFigure = {}; // figure that has 1D steady flow simulation running
var currentFlowData = 'data/waal_reference_0000.json'; // path to flow data, changes if other intervention is selected


// Print welcome
console.log('Hi there!')
console.log("You are running version v"+version)
console.log('According to your browser, your preferred language is: '+navigator.language)

// Load content
$('#AboutContent').load('xml/en/about.xml');
$('#PaperContent').load('xml/en/learn.xml');

/** ////////////////////////////////////////////////////////////
 * Extend jquery for css menu (intervention selector)
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
var AppIds = ["#StoryPanel", "#ExplorePanel", "#PaperPanel", "#AboutPanel", "#SettingsPanel", '#FlowPanel'];
var ExploreToggle = true;
 
// Function to toggle navigation menu
var toggleAppMenu = function () {
  if (AppMenuToggle){
    $('#leftbar').css('transform','translate(-100%, 0%)');
    $('#appnavigation').css('transform','translate(0%, -150%)');
    //$('#Scenarioselector').css('transform','translate(0px, 0%)');
    $('#MapButtons').css('transform','translate(0px, 0%)');
    $('#Scenarioselector').get(0).style.setProperty('--left', '5px');
    AppMenuToggle = false;    
  } else {
    $('#leftbar').css('transform','translate(0%, 0%)');
    $('#appnavigation').css('transform','translate(0%, 0%)');
    //$('#Scenarioselector').css('transform','translate(350px, 0%)');
    $('#MapButtons').css('transform','translate(380px, 0%)');
    $('#Scenarioselector').get(0).style.setProperty('--left', '355px');
    AppMenuToggle = true;
  };
};

// Function to switch between apps
var toggleApp = function (appindex) {
  console.log("Go to app "+appindex)
  for (let i=0;i<AppToggles.length;i++){
    if (i == appindex) { 
      // show requested app and its children
      $(AppIds[i]).css('transform','translate(0%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      // highlight current app in navigator
      $($('#appnavigation span').get(i)).addClass('app-active');
      // if click on story, reset and go to overview
      if (i==0){openStoryOverview()}
    } else{
      // hide other apps and their children 
      $(AppIds[i]).css('transform','translate(-120%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      $($('#appnavigation span').get(i)).removeClass('app-active');
  };
  };
};

var toggleTheme = function (themename) {
  if (themename=='dark'){ 
    document.getElementById('theme_css').href = 'css/dark-theme.css';
    
    // Background map
    setTileLayerHost('dark');
    removeTileLayers();
    addTileLayers();
    
    // Flow velocity visualisation
    velocityColorScale = ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"];
    removeVelocityLayerFromMap();
    addVelocityLayerToMap(currentFlowData);
    
  } else {
    document.getElementById('theme_css').href = 'css/light-theme.css';
    
    // Background map
    setTileLayerHost('light');
    removeTileLayers();
    addTileLayers(); 

    // Flow velocity visualisation
    velocityColorScale = ['#000000','#1C191B','#362C38','#3E3854','#3E5371','#3E8D8D','#38A965','#4CC62C','#BCE62C','#FF9600'];
    removeVelocityLayerFromMap();
    addVelocityLayerToMap(currentFlowData);

    
  };
};

/** ////////////////////////////////////////////////////////////
 * Invisible scrollbar (perfectscrollbarjs)
 * Scrollbars are hidden until hovered above (by mouse)
 *
 */////////////////////////////////////////////////////////////

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

/* === UI === */

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
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_reference.xml');
  $('#MenuCurrentIntervention').text('Reference')
  /* Figure */
  d3.json('data/reference_waterlevels_norm.json', function (d) {ExploreFigure.updateData(d)});
  
  /* map */
  // Velocity visualisation  
  currentFlowData = 'data/waal_reference_0000.json';
  removeVelocityLayerFromMap();
  addVelocityLayerToMap(currentFlowData, map);

  // Add visual elements for this intervention
  resetElementsOnMap();
};

function showRelo() {
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_relocation.xml');
  $('#MenuCurrentIntervention').text('Dike relocation')
  /* Figure */
  d3.json('data/relocation_int100.json', function(d){
          ExploreFigure.updateData(d, function(){
              addMaximumEffectTooltip();
              //addDownstreamPeak();
          })});
  
  /* map */
  // Velocity visualisation  
  currentFlowData = 'data/waal_int07_0000.json';
  removeVelocityLayerFromMap();
  addVelocityLayerToMap(currentFlowData, map);

  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(dikeNew, 'shp/banddijken_relocation_int100.json');
  dike.setStyle(DashStyle);

  // add 'legend'
  addTooltipToMap([[51.81, 5.31], [51.80, 5.30]], 
                 {file:'tooltip_relocation.xml', 
                  id: 'relotooltip0',
                  div: '#0',
                  align: 'left'});

  addTooltipToMap([[51.841, 5.37], [51.87, 5.37]], 
                 {file:'tooltip_relocation.xml', 
                  id: 'relotooltip1',
                  div: '#1',
                  align: 'left'});

  addTooltipToMap([[51.854, 5.40], [51.86, 5.43]], 
                 {file:'tooltip_relocation.xml', 
                  id: 'relotooltip2',
                  div: '#2',
                  align: 'right'});
};

function showSmooth() {
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_smoothing.xml');
  $('#MenuCurrentIntervention').text('Mowing floodplains')
  /* Explore figure */
  d3.json('data/smoothing_int99.json', function(d){
    ExploreFigure.updateData(d, function () {
      addMaximumEffectTooltip();
      //addDownstreamPeak();
    })
  })  

  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int11_0000.json';
  removeVelocityLayerFromMap()
  addVelocityLayerToMap(currentFlowData, map);

  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(mowing, 'shp/flplowering_int99.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_smoothing.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'}); 
};

function showGROYNLOW(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_groynes.xml');
  $('#MenuCurrentIntervention').text('Groyne lowering')
  /* Figure */
  d3.json('data/groynelowering_int363.json', function(d){
           ExploreFigure.updateData(d, function() {
            addMaximumEffectTooltip();
           })});
  
  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int01_0000.json';
  removeVelocityLayerFromMap()
  addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(groynes, 'shp/groynlow.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.8135, 5.3745], [51.80, 5.40]], 
                {file: 'tooltip_groynes.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});
};

function showMINEMBLOW(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_minemb.xml');
  $('#MenuCurrentIntervention').text('Embankment lowering')

  /* Figure */
  d3.json('data/minemblowering_int150.json', function(d){
           ExploreFigure.updateData(d, function() {
              addMaximumEffectTooltip();
              addMaximumEffectTooltip();
              //addDownstreamPeak();
           })}); 
  
  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int04_0000.json';
  removeVelocityLayerFromMap()
  addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(groynes, 'shp/minemblow.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.8279, 5.3931], [51.81, 5.41]], 
                {file: 'tooltip_minemb.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});
};

function showFLPLOW(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_lowering.xml');
  $('#MenuCurrentIntervention').text('Floodplain lowering')
  /* Figure */
  d3.json('data/lowering_int99.json', function(d){
           ExploreFigure.updateData(d, function() {
            addMaximumEffectTooltip();
            //addDownstreamPeak();
           })}) ; 
  
  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int03_0000.json';
  removeVelocityLayerFromMap()
  addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(lowering, 'shp/flplowering_int99.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_lowering.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});
};

function showSIDECHAN(){
  /* Titles and descriptions */
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_sidechannels.xml');
  $('#MenuCurrentIntervention').text('Side channels')
  /* Figure */
  d3.json('data/sidechannel_int100.json', function(d){
            ExploreFigure.updateData(d, function() {
              addMaximumEffectTooltip();
              //addDownstreamPeak();
            })});  

  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int09_0000.json';
  removeVelocityLayerFromMap()
  addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  resetElementsOnMap();
  addElementToMap(sidechannels, 'shp/sidechannel_int100.json');

  // add marker to explain what's going on
  addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_sidechannels.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});
};

/** ////////////////////////////////////////////////////////////
 * Interaction
 *//////////////////////////////////////////////////////////////

/* Execute this function on startup */
function display(error, dataset, comparedata) {
  // === Background map ===
  
  // === Explore App ===
  console.log("Loading explore app...")
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
  console.log("Loading flow app...")
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
  
  //showReference()
  
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


$(document).ready(function () {
  // renderProgress();
});

$('#version-number-ui').text('App: v' + version);
$('#version-number-map').text('Map: v' + map_version);

// Kick off everything
d3.queue()
  .defer(d3.json, 'data/relocation_int100.json')
  .defer(d3.json, 'data/exceedance_diagram_data.json')
  .await(display);

// === ~final