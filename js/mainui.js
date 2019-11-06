
import * as story from '../js/story.js'
import * as map from '../js/map.js'

const version = "0.51";
var currentFlowData = 'data/waal_reference_0000.json'; // path to flow data, changes if other intervention is selected
var currentTheme = 'dark';
var currentLang = 'nl';
var currentIntervention = 'reference'
var currentApp = 0;

// Flags to remember which panel is out
var AppMenuToggle = true;
var AppToggles = [true, false, false, false, false, false];
var AppIds = ["#StoryPanel", "#ExplorePanel", "#PaperPanel", "#AboutPanel", "#SettingsPanel", '#FlowPanel'];
var ExploreToggle = true;


// Print welcome
/*
console.log('Hi there!')
console.log("You are running version v"+version)
console.log('According to your browser, your preferred language is: '+navigator.language)
*/

// Global constants
export var settings = {currentTheme: 'dark', 
                       currentLang: 'en',
                       currentIntervention: 'reference', 
                       currentFlowData: 'data/waal_reference_0000.json',
                       ui_version: 0.52,
                       map_version: 0.3,
                       story_version: 0.2,
                       velocityColorScale: ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"]
                      }

export var charts = {exploreFigure: {},
                     flowFigure: {}}

// Load content 
function loadContent() {
  $('#AboutContent').load('xml/'+settings.currentLang+'/about.xml');
  $('#PaperContent').load('xml/'+settings.currentLang+'/learn.xml');
  $('#InterventionDescription').load('xml/'+settings.currentLang+'/explore_'+settings.currentIntervention+'.xml');
  
  d3.json('xml/'+settings.currentLang+'/titles.json', function(langString) {
      $('#AppTitle').text(langString.apptitle);
      $('#MenuCurrentIntervention').text(langString[currentIntervention]);
      $('.str_ref').text(langString.reference);
      $('.str_smooth').text(langString.smooth);
      $('.str_relo').text(langString.relo);
      $('.str_groynlow').text(langString.groynlow);
      $('.str_minemblow').text(langString.minemblow);
      $('.str_sidechan').text(langString.sidechan);
      $('.str_flplow').text(langString.flplow);
    });
}


/** ////////////////////////////////////////////////////////////
 * Intervention selector
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

/*If user clicks outside selector, close selector */
document.addEventListener('click', function(event) {
  if (!event.target.closest('.cssmenu')) {
    var element = $('.cssmenu li');
    // when already open, close
    element.removeClass('open');
    element.find('li').removeClass('open');
    element.find('ul').slideUp(300);
  }}, false);

/** ////////////////////////////////////////////////////////////
 * Navigation toggles
 * 
 *
 */////////////////////////////////////////////////////////////


 
// Function to toggle navigation menu
export function toggleAppMenu () {
  if (AppMenuToggle){
    $('#leftbar').css('transform','translate(-100%, 0%)');
    $('#appnavigation').css('transform','translate(0%, -150%)');
    $('#MapTopFlexUI').get(0).style.setProperty('--left', '5px');
    AppMenuToggle = false;    
  } else {
    $('#leftbar').css('transform','translate(0%, 0%)');
    $('#appnavigation').css('transform','translate(0%, 0%)');
    $('#MapTopFlexUI').get(0).style.setProperty('--left', '355px');
    AppMenuToggle = true;
  };
};

// Function to switch between apps
export function toggleApp (appindex) {
  currentApp = appindex;
  console.log("Go to app "+currentApp)
  for (let i=0;i<AppToggles.length;i++){
    if (i == appindex) { 
      // show requested app and its children
      $(AppIds[i]).css('transform','translate(0%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      // highlight current app in navigator
      $($('#appnavigation span').get(i)).addClass('app-active');
      // if click on story, reset and go to overview
      if (i==0){story.openStoryOverview()}
    } else{
      // hide other apps and their children 
      $(AppIds[i]).css('transform','translate(-120%, 0%)');
      $(AppIds[i]).children().css('transform','translate(0%, 0%)');
      $($('#appnavigation span').get(i)).removeClass('app-active');
  };
  };
};


export function setTheme (theme) {
  if (theme=='dark'){ 
    document.getElementById('theme_css').href = 'css/dark-theme.css';
    
    // Background map
    map.setTileLayerHost('dark');
    map.removeTileLayers();
    map.addTileLayers();
    
    // Flow velocity visualisation
    settings.velocityColorScale = ["rgb(36,104, 180)", "rgb(60,157, 194)", "rgb(128,205,193 )", "rgb(151,218,168 )", "rgb(198,231,181)", "rgb(238,247,217)", "rgb(255,238,159)", "rgb(252,217,125)", "rgb(255,182,100)", "rgb(252,150,75)", "rgb(250,112,52)", "rgb(245,64,32)", "rgb(237,45,28)", "rgb(220,24,32)", "rgb(180,0,35)"];
    map.removeVelocityLayerFromMap();
    map.addVelocityLayerToMap(currentFlowData);

    // update flag
    currentTheme = 'dark';
    
  } else {
    document.getElementById('theme_css').href = 'css/light-theme.css';
    
    // Background map
    map.setTileLayerHost('light');
    map.removeTileLayers();
    map.addTileLayers(); 

    // Flow velocity visualisation
    settings.velocityColorScale = ['#000000','#1C191B','#362C38','#3E3854','#3E5371','#3E8D8D','#38A965','#4CC62C','#BCE62C','#FF9600'];
    map.removeVelocityLayerFromMap();
    map.addVelocityLayerToMap(currentFlowData);

    // update flag
    currentTheme = 'light';

    
  };
};

export function toggleTheme () {
  if (currentTheme=='light'){setTheme('dark')}
  else {setTheme('light')};
};

export function setLanguage (lan) {
    console.log('language set to ' + lan)
    let color = 'white';

    // switch flag
    settings.currentLang = lan;
    currentLang = settings.currentLang;
    
    // change icon
    if (lan=='nl'){
      $('#MapLang').children('img').attr('src', 'img/flag_dutch.svg')
    }else{
      $('#MapLang').children('img').attr('src', 'img/flag_english.svg')
    };
    
    // reload content
    loadContent();

    // if story app is current, reload story app 
    if (currentApp == 0){
      story.openStoryOverview()
    }
};

export function toggleLanguage () {
    if (settings.currentLang=='en'){setLanguage('nl')} 
    else {setLanguage('en')};
};

/** ////////////////////////////////////////////////////////////
 * Invisible scrollbar (perfectscrollbarjs)
 * Scrollbars are hidden until hovered above (by mouse)
 *
 */////////////////////////////////////////////////////////////


//const bs = new PerfectScrollbar('#banner', {
//  wheelSpeed: 1,
//  wheelPropagation: false,
//  minScrollbarLength: 20,
//  swipeEasing: true
//});
//bs.update()

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

/* === IO ===
 */

export function showReference() {
  /* Titles and descriptions */
  currentIntervention = 'reference';
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_'+currentIntervention+'.xml');
  
  /* Figure */
  d3.json('data/reference_waterlevels_norm.json', function (d) {charts.exploreFigure.updateData(d)});
  
  /* map */
  // Velocity visualisation  
  currentFlowData = 'data/waal_reference_0000.json';
  map.removeVelocityLayerFromMap();
  map.addVelocityLayerToMap(currentFlowData, map);

  // Add visual elements for this intervention
  map.resetElementsOnMap();
};

export function showRelo() {
  /* Titles and descriptions */
  settings.currentIntervention = 'relo';


  $('#InterventionDescription').load('xml/'+settings.currentLang+'/explore_'+settings.currentIntervention+'.xml');
  /* Figure */
  d3.json('data/relocation_int100.json', function(d){
          charts.exploreFigure.updateData(d, function(){
              map.addMaximumEffectTooltip();
              //addDownstreamPeak();
          })});
  
  /* map */
  // Velocity visualisation  
  currentFlowData = 'data/waal_int07_0000.json';
  map.removeVelocityLayerFromMap();
  map.addVelocityLayerToMap(currentFlowData, map);

  // Add visual elements for this intervention
  map.resetElementsOnMap();
  map.addElementToMap(map.dikeNew, 'shp/banddijken_relocation_int100.json');
  map.dike.setStyle(map.DashStyle);

  // add 'legend'
  map.addTooltipToMap([[51.81, 5.31], [51.80, 5.30]], 
                 {file:'tooltip_relo.xml', 
                  id: 'relotooltip0',
                  div: '#0',
                  align: 'left'});

  map.addTooltipToMap([[51.841, 5.37], [51.87, 5.37]], 
                 {file:'tooltip_relo.xml', 
                  id: 'relotooltip1',
                  div: '#1',
                  align: 'left'});

  map.addTooltipToMap([[51.854, 5.40], [51.86, 5.43]], 
                 {file:'tooltip_relo.xml', 
                  id: 'relotooltip2',
                  div: '#2',
                  align: 'right'});

  // Add animated SVG
  //addInterventionAnimation(loopDikes)
};

export function showSmooth() {
  /* Titles and descriptions */
  currentIntervention = 'smooth';
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_'+currentIntervention+'.xml');
  /* Explore figure */
  d3.json('data/smoothing_int99.json', function(d){
    charts.exploreFigure.updateData(d, function () {
      map.addMaximumEffectTooltip();
      //addDownstreamPeak();
    })
  })  

  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int11_0000.json';
  map.removeVelocityLayerFromMap()
  map.addVelocityLayerToMap(currentFlowData, map);

  // Add visual elements for this intervention
  map.resetElementsOnMap();
  map.addElementToMap(map.mowing, 'shp/flplowering_int99.json');

  // add marker to explain what's going on
  map.addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_smooth.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'}); 

  // Add animated SVG
  //addInterventionAnimation(loopVegetation)
};

export function showGroynlow(){
  /* Titles and descriptions */
  currentIntervention = 'groynlow';
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_'+currentIntervention+'.xml');
  /* Figure */
  d3.json('data/groynelowering_int363.json', function(d){
           charts.exploreFigure.updateData(d, function() {
            map.addMaximumEffectTooltip();
           })});
  
  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int01_0000.json';
  map.removeVelocityLayerFromMap()
  map.addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  map.resetElementsOnMap();
  map.addElementToMap(map.groynes, 'shp/groynlow.json');

  // add marker to explain what's going on
  map.addTooltipToMap([[51.8135, 5.3745], [51.80, 5.40]], 
                {file: 'tooltip_groynlow.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

  // Add animated SVG
  //addInterventionAnimation(loopGroynes)
};

export function showMinemblow(){
  /* Titles and descriptions */
  currentIntervention = 'minemblow';
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_'+currentIntervention+'.xml');

  /* Figure */
  d3.json('data/minemblowering_int150.json', function(d){
           charts.exploreFigure.updateData(d, function() {
              map.addMaximumEffectTooltip();
              map.addMaximumEffectTooltip();
              //addDownstreamPeak();
           })}); 
  
  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int04_0000.json';
  map.removeVelocityLayerFromMap()
  map.addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  map.resetElementsOnMap();
  map.addElementToMap(map.groynes, 'shp/minemblow.json');

  // add marker to explain what's going on
  map.addTooltipToMap([[51.8279, 5.3931], [51.81, 5.41]], 
                {file: 'tooltip_minemblow.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

  // Add animated SVG
  //addInterventionAnimation(loopEmbankments)
};

export function showFlplow(){
  /* Titles and descriptions */
  currentIntervention = 'flplow';
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_'+currentIntervention+'.xml');
  /* Figure */
  d3.json('data/lowering_int99.json', function(d){
           charts.exploreFigure.updateData(d, function() {
            map.addMaximumEffectTooltip();
            //addDownstreamPeak();
           })}) ; 
  
  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int03_0000.json';
  map.removeVelocityLayerFromMap()
  map.addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  map.resetElementsOnMap();
  map.addElementToMap(map.lowering, 'shp/flplowering_int99.json');

  // add marker to explain what's going on
  map.addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_flplow.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

  // Add animated SVG
  //addInterventionAnimation(loopLowerFloodplain)
};

export function showSidechan(){
  /* Titles and descriptions */
  currentIntervention = 'sidechan';
  $('#InterventionDescription').load('xml/'+currentLang+'/explore_'+currentIntervention+'.xml');

  /* Figure */
  d3.json('data/sidechannel_int100.json', function(d){
            charts.exploreFigure.updateData(d, function() {
              map.addMaximumEffectTooltip();
              //addDownstreamPeak();
            })});  

  /* Map */
  // Velocity visualisation
  currentFlowData = 'data/waal_int09_0000.json';
  map.removeVelocityLayerFromMap()
  map.addVelocityLayerToMap(currentFlowData, map);
  
  // Add visual elements for this intervention
  map.resetElementsOnMap();
  map.addElementToMap(map.sidechannels, 'shp/sidechannel_int100.json');

  // add marker to explain what's going on
  map.addTooltipToMap([[51.830, 5.396], [51.810, 5.42]], 
                {file: 'tooltip_sidechan.xml', 
                 id: 'smoothtooltip',
                 div: '#0',
                 align: 'right'});

  // Add animated SVG
  //addInterventionAnimation(loopSidechannel)
};




/** ////////////////////////////////////////////////////////////
 * Interaction
 *//////////////////////////////////////////////////////////////

function addInterventionAnimation(callback){
// remove old svg
$("#vis svg").remove()

// Load from source
d3.xml("img/invanim_test.svg", function(xml) {
      var importedNode = document.importNode(xml.documentElement, true);
      d3.select("#vis")
        .each(function() {
          this.appendChild(importedNode);
        })


        callback()


        // inside of our d3.xml callback, call another function
        // that styles individual paths inside of our imported svg
        //loopSidechannel()
        //loopVegetation()
        //loopGroynes()
        //loopEmbankments()
        //loopDikes()
        //loopLowerFloodplain()
      });
};

//addInterventionAnimation(loopSidechannel)
function loopSidechannel () {
  d3.select('#vis svg ')
    .selectAll('#sidechannel')
    .transition()
    .duration(1500)
    .style('opacity', 1)
    .transition()
    .duration(500)
    .style('opacity', 0)
    .on("end", loopSidechannel)
    }

function loopVegetation () {
        d3.select('#vis svg')
          .selectAll('#vegetation')
          .transition()
          .duration(1500)
          .style('opacity', 1)
          .transition()
          .duration(500)
          .style('opacity', 0)
          .on("end", loopVegetation)
      }


function loopGroynes () {
        d3.select('#vis svg')
          .selectAll('#groynes')
          .transition()
          .duration(1500)
          .attr('transform', 'translate(0, 10)')
          .transition()
          .duration(500)
          .attr('transform', 'translate(0, 0)')
          .on("end", loopGroynes)
      }

function loopEmbankments () {
        d3.select('#vis svg')
          .selectAll('#embankment')
          .transition()
          .duration(1500)
          .attr('transform', 'translate(0, 10)')
          .transition()
          .duration(500)
          .attr('transform', 'translate(0, 0)')
          .on("end", loopEmbankments)
      }

function loopDikes () {
        d3.select('#vis svg')
          .selectAll('#leftdikegroup')
          .transition()
          .duration(1500)
          .attr('transform', 'translate(-20, 0)')
          .transition()
          .duration(500)
          .attr('transform', 'translate(0, 0)')
          .on("end", loopDikes)
      }

function loopLowerFloodplain () {
        d3.select('#vis svg')
          .selectAll('#lowerfloodplain')
          .transition()
          .duration(1500)
          .attr('transform', 'translate(0, 22)')
          .transition()
          .duration(500)
          .attr('transform', 'translate(0, 0)')
          .on("end", loopLowerFloodplain)
      }



// === ~final