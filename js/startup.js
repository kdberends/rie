/** ////////////////////////////////////////////////////////////
 _______                                  ______                        
|_   __ \    (_)                        .' ___  |                       
  | |__) |   __  _   __  .---.  _ .--. / .'   \_| ,--.   _ .--.  .---.  
  |  __ /   [  |[ \ [  ]/ /__\\[ `/'`\]| |       `'_\ : [ `/'`\]/ /__\\ 
 _| |  \ \_  | | \ \/ / | \__., | |    \ `.___.'\// | |, | |    | \__., 
|____| |___|[___] \__/   '.__.'[___]    `.____ .'\'-;__/[___]    '.__.' 
                                                                        
contact: k.d.berends@utwente.nl | koen.berends@deltares.nl
*/////////////////////////////////////////////////////////////
console.log('hii')
$('#loadtext').append("River Intervention Explorer v.<br/>")
$('#loadtext').append("Loading javascript libraries <br/>")

import * as story from '../js/story.js'
import * as ui from '../js/mainui.js'
import * as map from '../js/map.js'
import {protoSchematicRiverChart} from '../js/protoSchematicRiverChart.js'
import {protoSteadyFlowApp} from '../js/protoSteadyFlowApp.js'
import {settings, charts} from '../js/mainui.js'



// bind UI functions
$('#loadtext').append("Binding function <br/>")

$('#menuToggle').click(ui.toggleAppMenu)
$('#app-story').click(function(){ui.toggleApp(0)})
$('#app-explore').click(function(){ui.toggleApp(1)})
$('#app-article').click(function(){ui.toggleApp(2)})
$('#app-info').click(function(){ui.toggleApp(3)})

$('#MapTheme').click(function(){ui.toggleTheme()})
$('#MapLang').click(function(){ui.toggleLanguage()})
$('#MapZoom').click(function(){mapZoomToStudyArea()})

$('#exploreShowReference').click(function(){ui.showReference(); ui.toggleApp(1)})
$('#exploreShowSmooth').click(function(){ui.showSmooth(); ui.toggleApp(1)})
$('#exploreShowRelo').click(function(){ui.showRelo(); ui.toggleApp(1)})
$('#exploreShowGroynlow').click(function(){ui.showGroynlow(); ui.toggleApp(1)})
$('#exploreShowMinemblow').click(function(){ui.showMinemblow(); ui.toggleApp(1)})
$('#exploreShowSidechan').click(function(){ui.showSidechan(); ui.toggleApp(1)})
$('#exploreShowFlplow').click(function(){ui.showFlplow(); ui.toggleApp(1)})

$('#buttonStoryPrevious').click(function(){story.previousStory()})
$('#buttonStoryReset').click(function(){story.resetStory()})
$('#buttonStoryOverview').click(function(){story.openStoryOverview()})
$('#buttonStoryNext').click(function(){story.nextStory()})


/* Execute this function on startup */
function start_webapp(error, dataset, comparedata) {
  // === Explore App ===
  console.log("Loading explore app...")
  $('#loadtext').append("Loading Explore app<br/>")
  protoSchematicRiverChart.apply(charts.exploreFigure);
  charts.exploreFigure.setCanvas('#ExploreCanvas');
  charts.exploreFigure.setData(dataset);
  charts.exploreFigure.init();
  charts.exploreFigure.moveAxis('x', 'zero')
  charts.exploreFigure.drawMedian();
  charts.exploreFigure.drawBands();
  charts.exploreFigure.showBands();
  $('#version-number-explore').text('Explore: v' + charts.exploreFigure.getVersion());
  

  // Set callback between map and figure
  charts.exploreFigure.setXaxisCallback(function (coor) {
    d3.json('shp/rivierkilometers.json', function (data) {
      map.riverkmFocus.clearLayers();
      let index = (coor - 854) 
      map.riverkmFocus.addData(data.features[index]).bindTooltip('km '+coor, {direction: 'top'});//.openTooltip();
      });
    });

  // === Compare App ===
  console.log("Loading flow app...")
  $('#loadtext').append("Loading Flow app<br/>")
  protoSteadyFlowApp.apply(charts.flowFigure)
  charts.flowFigure.setCanvas('#FlowCanvas');
  charts.flowFigure.init();
  $('#version-number-flow').text('Flow: v' + charts.flowFigure.getVersion());
  
  //showReference()
  
  // Make sure figure updates when window resizes

   d3.select(window)
      .on("resize.chart", function(){
          charts.exploreFigure.resize();
          charts.flowFigure.resize();
          charts.exploreFigure.setXaxisCallback(function (coor) {
            d3.json('shp/rivierkilometers.json', function (data) {
            map.riverkmFocus.clearLayers();
            let index = (coor - 854) 
            map.riverkmFocus.addData(data.features[index]);
          });
        });
      });

    $('#loadtext').append("Setting language to "+ui.settings.currentLang+" Flow app<br/>")
    ui.setLanguage(ui.settings.currentLang)
    $('#loader-wrapper').addClass('loaded');
};


$(document).ready(function () {
  // renderProgress();
});

$('#version-number-ui').text('App: v' + ui.settings.ui_version);
$('#version-number-map').text('Map: v' + ui.settings.map_version);

// Kick off everything
d3.queue()
  .defer(d3.json, 'data/relocation_int100.json')
  .defer(d3.json, 'data/exceedance_diagram_data.json')
  .await(start_webapp);
