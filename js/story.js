/** ////////////////////////////////////////////////////////////
 * Storyline app
 */////////////////////////////////////////////////////////////


const story_version = 0.1;

var StoryProgress = 1;
var NumberOfStories = 8;
var currentStory = 0;
var currentLang = 'en';

// initialise story
$('#StoryText').load('xml/stories_index_'+currentLang+'.xml');

function get_storyXML(){
   return 'xml/stories_'+currentStory+'_'+currentLang+'.xml #'
};


function openStory (storynum) {
  $('#StoryOptions').css('transform', 'translate(0%, 0%)');  
  currentStory = storynum;
  // load story
  var xmlPath = get_storyXML();
  $('#StoryText').load(xmlPath+1);

  // register controls
   $('#StoryText').bind('DOMMouseScroll', function(e){
        console.log('koen')
        if(e.originalEvent.wheelDelta /120 > 0) {
            console.log('scrolling up !');
        }
        else{
            console.log('scrolling down !');
        };
      });
};

function openStoryOverview() {
  resetStory();
  $('#StoryText').load('xml/stories_index_'+currentLang+'.xml');
  $('#StoryOptions').css('transform', 'translate(-150%, 0%)');  
};
/* STORY  1 FUNCTIONS

These functions are called at various points alongn the story to progress
the figures & map.
*/

/* Dummy function */
function storyTest () {
  console.log("StoryTestFunc fired")
};

function show_welcome() {
  $("#StoryCanvas").css('transform', 'translate(0%, 0%)');
};

function hide_welcome() {
  $("#StoryCanvas").css('transform', 'translate(-100%, 0%)');
};

function story_showFlow(reverse=false) {
  if (reverse) {
    $("#StoryCanvas").css('transform', 'translate(0%, 0%)');
    $('#FlowPanel').css('transform','translate(-120%, 0%)');
  } else {
    $("#StoryCanvas").css('transform', 'translate(-100%, 0%)');
    $('#FlowPanel').css('transform','translate(0%, 0%)');
    $('#FlowScroll').css('transform','translate(-120%, 0%)');
  };
};

function story_decreaseFriction(reverse=false) {
  if (reverse) {
    FlowFigure.changeFriction(0.04);
  } else {
    FlowFigure.changeFriction(0.03);
  };
};

function story_increaseFriction(reverse=false) {
  if (reverse) {
    FlowFigure.changeFriction(0.03);
  } else {
    FlowFigure.changeFriction(0.04);
  };
};

function story_markWaterLevel(reverse=false) {
  if (reverse) {
    FlowFigure.emptyArchive();
  } else {
    FlowFigure.saveLineToArchive();
    FlowFigure.drawLatestFromArchive('archiveline');
  };
};

function story_lowerBed(reverse=false) {
  if (reverse) {
    FlowFigure.changeInterventionDepth(0)
    FlowFigure.deleteFromArchive(1);
  } else {
    FlowFigure.changeInterventionDepth(-1)
    FlowFigure.saveLineToArchive();
    FlowFigure.drawLatestFromArchive('differenceline')
  };
};

function story_markDifference(reverse=false){
  if (reverse) {
    FlowFigure.drawLatestFromArchive('differenceline', 'archiveline_1')
    FlowFigure.showFlow();
  } else {
    
    FlowFigure.drawEffect(1, 0, 'archiveline_1')
    FlowFigure.emptyArchive();
    FlowFigure.hideFlow();
  };
};


/* STORY  2 FUNCTIONS

These functions are called at various points alongn the story to progress
the figures & map.
*/

function show_flowcanvas() {
  
};

function hide_flowcanvas() {  
  $('#FlowPanel').css('transform','translate(-120%, 0%)');
};

function map_zoom_NL() {
  map.setView([52, 5], 7);
};

function map_zoom_Waal() {
  hide_welcome()
  map.setView([51.823, 5.3682], 9);
};

function map_zoom_StAndries() {
  map.setView([51.823, 5.3682], 13);
  story_show_uncertainty();
};



function show_interventioncanvas() {
  $('#ExplorePanel').css('transform','translate(0%, 0%)');
  $('#ExploreScroll').css('transform','translate(-120%, 0%)');
};

function hide_interventioncanvas() {
  $('#ExplorePanel').css('transform','translate(-120%, 0%)');
};

function story_discharge_down() {
  FlowFigure.changeDischarge(1250);
};

function story_discharge_up() {
  FlowFigure.changeDischarge(2000);
};

function story_show_uncertainty() {
  hide_flowcanvas();
  show_interventioncanvas();
};

function story_lower_bed() {
  FlowFigure.changeInterventionDepth(-1)
};

function reset_story(){
  FlowFigure.emptyArchive();
  FlowFigure.changeInterventionDepth(0)
  FlowFigure.changeDischarge(2000);
  show_welcome();
  showReference();
  hide_flowcanvas();
  hide_interventioncanvas();
  map_zoom_NL();
  FlowFigure.showFlow();
  FlowFigure.removeEffect();
};

function show_storycanvas_hide_flow(){
  hide_flowcanvas();
  show_welcome()
};

function testa1() {
  FlowFigure.saveLineToArchive();
  FlowFigure.drawLatestFromArchive('archiveline')
  FlowFigure.changeInterventionDepth(-1)
  FlowFigure.saveLineToArchive();
  FlowFigure.drawLatestFromArchive('differenceline')
};

function testa2() {

  FlowFigure.drawEffect(1, 0, 'archiveline_1')
  FlowFigure.emptyArchive();
  FlowFigure.hideFlow();
};


/* order in which function shoul dbe called
var StoryFunctions = [storyTest,
                      reset_story, 
                      story_showFlow, 
                      story_discharge_down, 
                      story_discharge_up, 
                      testa1,
                      testa2, 
                      show_storycanvas_hide_flow,
                      map_zoom_Waal, 
                      hide_interventioncanvas,
                      map_zoom_StAndries,
                      showSmooth,
                      showSIDECHAN,
                      storyTest,
                      storyTest
                      ]
*/

var StoryFunctions = [reset_story, 
                      storyTest,
                      story_showFlow,
                      storyTest,
                      story_decreaseFriction,
                      story_increaseFriction,
                      story_markWaterLevel,
                      story_lowerBed,
                      story_markDifference,
                      ]

// initialise story


let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%";
$(".progress-inside").each(function () {
      $(this).css("width", progresstext);
      $(this).children("div").text(progresstext)});

/* advances story by one increment */
function nextStory () {
  var xmlPath = get_storyXML();
  if (StoryProgress < NumberOfStories) {
    // advance story
    StoryProgress += 1;

    // load text
    $('#StoryText').load(xmlPath + StoryProgress);

    // call function
    StoryFunctions[StoryProgress]();

    // update progressbar
    let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%";
    $(".progress-inside").each(function () {
      $(this).css("width", progresstext);
      $(this).children("div").text(progresstext);
      /* special color if completed! */
      if (StoryProgress == NumberOfStories){
        $(".progress-inside").css(' ', 'var(--accent-3)')
      };
  });
 };
};

function previousStory () {
  var xmlPath = get_storyXML();
  if (StoryProgress > 1) {
    // retard story
    StoryProgress -= 1;

    // load text
    $('#StoryText').load(xmlPath+StoryProgress);

    // call reverse function
    StoryFunctions[StoryProgress+1](true);

    // update progressbar
    $(".progress .progress-inside").each(function () {
    let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%";
      $(this).css("width", progresstext);
      $(this).children("div").text(progresstext);
    });
};
};

function resetStory () {
  StoryProgress = 1;
  var xmlPath = get_storyXML();
  reset_story();
  $(".progress .progress-inside").css('background-color', 'var(--accent-4)')
  $('#StoryText').load(xmlPath+StoryProgress);
  $(".progress .progress-inside").each(function () {
    let progresstext = Math.round(StoryProgress / NumberOfStories * 100) + "%"
    $(this).css("width", progresstext);
    $(this).children("div").text(progresstext);
  });
};