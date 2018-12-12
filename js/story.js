/** ////////////////////////////////////////////////////////////
 * Storylines app
 */////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Variables
/////////////////////////////////////////////////////////////

const story_version = 0.3;
var StoryProgress = 1;
var NumberOfStories = 8;
var currentStory = 0;
var currentLang = 'en';
var flagSwipeActive = false; // if true, swiping will advance story
var flagSwipetextLoaded = false;
var StoryFunctions = []; // array with function called at each step in the story
var StoryCarouselScrollers = []; // array which holds perfectscrollbar objects
var scrolloptions = {wheelSpeed: 1,
                     wheelPropagation: false,
                     minScrollbarLength: 20,
                     swipeEasing: true}

/* Variable to set width of progressbar */
let progresstext = Math.round((StoryProgress-1) / NumberOfStories * 100) + "%";
$(".progress-inside").each(function () {
      $(this).css("width", progresstext);
      $(this).children("div").text(progresstext)});


/////////////////////////////////////////////////////////////
// General functions
/////////////////////////////////////////////////////////////

function get_storyXML(){
   return 'xml/'+currentLang+'/stories_'+currentStory+'.xml #'
};

function openStory (storynum) {
  // show story navigation buttons
  $('#StoryOptions').css('opacity', '1');  

  // hide overview
  $('#StoryOverview').css('transform', 'translate(-120%, 0%)')
  
  // set current story
  currentStory = storynum;
  
  // set carousel width
  $('#StoryCarousel').css('width', NumberOfStories*100+'%');  
  
  // load story
  var xmlPath = get_storyXML();
  
  showStoryNavigation();
  flagSwipeActive = true;

  // create story carousel

  for (var i=1;i<NumberOfStories+1;i++){
    let id = 'sic_' + i;

    $("<div class='story-in-carousel' id="+id+"></div>")
    .load(xmlPath+i)
    .appendTo($('#StoryCarousel'))

    // make story scrollable when needed
    StoryCarouselScrollers.push(new PerfectScrollbar('#'+id, scrolloptions).update());
  };
};

function openStoryOverview() {
  resetStory();
  $('#StoryOverview').load('xml/'+currentLang+'/stories_index.xml');
  $('#StoryOverview').css('transform', 'translate(0%, 0%)')
  
  // delete stories in carousel
  $(".story-in-carousel").remove()
  for (var i=1;i<NumberOfStories+1;i++){try {StoryCarouselScrollers[i].destroy()} catch (err){}}
  
  hideStoryNavigation();
  flagSwipeActive = false;
};

function hideStoryNavigation() {
  $('#StoryOptions').css('opacity', '0');  
};

function showStoryNavigation() {
  $('#StoryOptions').css('opacity', '1');  
};

/* Dummy function */
function storyTest () {
  {}
};

function show_welcome() {
  $("#StoryCanvas").css('transform', 'translate(0%, 0%)');
};


function draw_studyarea_rectangle() {
  
};

/////////////////////////////////////////////////////////////
//  SFunct
/////////////////////////////////////////////////////////////




function show_flowcanvas() {
  
};

function hide_flowcanvas() {  
  $('#FlowPanel').css('transform','translate(-120%, 0%)');
};

function map_zoom_NL() {
  map.setView([52, 5], 7);
};

function map_zoom_Waal() {
  map.setView([51.823, 5.3682], 10);
};

function map_zoom_StAndries() {
  map.setView([51.823, 5.3682], 12);
};

function show_interventioncanvas() {
  $('#ExplorePanel').css('transform','translate(0%, 0%)');
  $('#ExplorePanel').css('pointer-events', 'none')
  $('#ExploreScroll').css('transform','translate(-120%, 0%)');
};

function hide_interventioncanvas() {
  $('#ExplorePanel').css('transform','translate(-120%, 0%)');
  $('#ExplorePanel').css('pointer-events', 'initial')
};

function story_discharge_down() {
  FlowFigure.changeDischarge(1250);
};

function story_discharge_up() {
  FlowFigure.changeDischarge(2000);
};

function story_lower_bed() {
  FlowFigure.changeInterventionDepth(-1)
};

function show_storycanvas(){
  show_welcome();
};

function hide_storycanvas(){
  $("#StoryCanvas").css('transform', 'translate(-120%, 0%)');
};

function show_storycanvas_hide_flow(){
  hide_flowcanvas();
  show_welcome();
};

function explorecanvas_show_waterlevels(){
  d3.json("data/reference_waterlevels.json", function (d) {ExploreFigure.updateData(d)});
  ExploreFigure.setYLabel("Water level [m+NAP]")
}

function explorecanvas_show_normalised_waterlevels(){
  d3.json("data/reference_waterlevels_norm.json", function (d) {ExploreFigure.updateData(d)})
  ExploreFigure.setYLabel("Normalised\n water level ")
};

function explorecanvas_show_smoothing(){
   d3.json("data/smoothing_int99.json", function (d) {ExploreFigure.updateData(d)})
   ExploreFigure.setYLabel("Water level decrease [m]")
};

function explorecanvas_show_sidechannels(){
  d3.json("data/sidechannel_int100.json", function (d) {ExploreFigure.updateData(d)})
};

/* story 0*/
function story_showFlow(reverse=false) {
  if (reverse) {
    show_storycanvas();
    $('#FlowPanel').css('transform','translate(-120%, 0%)');
  } else {
    hide_storycanvas();
    $('#FlowPanel').css('transform','translate(0%, 0%)');
    $('#FlowScroll').css('transform','translate(-120%, 0%)');
  };
};

function story_decreaseFriction(reverse=false) {
  if (reverse) {
    FlowFigure.changeFriction(0.04);
  } else {
    FlowFigure.changeFriction(0.02);
  };
};

function story_increaseFriction(reverse=false) {
  if (reverse) {
    FlowFigure.changeFriction(0.02);
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
    $('.archiveline').css('opacity', '1')
    FlowFigure.showFlow();
  } else {
    FlowFigure.drawEffect(1, 0, 'archiveline_1')
    $('.archiveline').css('opacity', '0')
    FlowFigure.hideFlow();
  };
};

/* Resets the story to first step */
function reset_story_0(){
  FlowFigure.emptyArchive();
  FlowFigure.changeInterventionDepth(0)
  FlowFigure.changeDischarge(2000);
  show_welcome();
  showReference();
  hide_flowcanvas();
  hide_interventioncanvas();
  FlowFigure.showFlow();
  FlowFigure.removeEffect();
};

/* story 2*/
function story_showWaal(reverse=false) {
  if (reverse){
    map_zoom_NL();
    show_storycanvas();
  } else {
    map_zoom_Waal();
    $("#StoryCanvas").html("<img class='storycanvasimage' src='img/waal_outline.svg'></img>");
    show_storycanvas();
  }
};

function story_showStAndries(reverse=false){
  if (reverse){
    map_zoom_Waal();
    $("#StoryCanvas").html("<img class='storycanvasimage' src='img/waal_outline.svg'></img>");
    show_storycanvas();
  } else {
    map_zoom_StAndries();
    draw_studyarea_rectangle();
    $("#StoryCanvas").html("<img class='storycanvasimage' src='img/waal_outline_withAndries.svg'></img>");
    show_storycanvas();
  };
};

function story_show_uncertainty_waterlevels(reverse=false){
  if (reverse) {
    hide_interventioncanvas();
    show_storycanvas();
  } else {
    hide_storycanvas();
    show_interventioncanvas();  
    explorecanvas_show_waterlevels();
  };
};

function story_show_normalised_uncertainty(reverse=false){
  if (reverse) {
    explorecanvas_show_waterlevels();
  } else {
    explorecanvas_show_normalised_waterlevels();
  };
};

function story_show_floodplain_smoothing(reverse=false){
  if (reverse) {
    explorecanvas_show_normalised_waterlevels();
    showReference();
  } else {
    explorecanvas_show_smoothing();
    showSmooth();
  };
};

function story_show_sidechannels(reverse=false){
  if (reverse){
    explorecanvas_show_smoothing();
    showSmooth();
  } else {
    explorecanvas_show_sidechannels();
    showSIDECHAN();
  }
};

function reset_story_2(){
  map_zoom_Waal();
  hide_interventioncanvas();
  show_storycanvas();
  showReference();
};

/////////////////////////////////////////////////////////////
//  Story 0 functions
/////////////////////////////////////////////////////////////

/* */
StoryFunctions = [[reset_story_0, 
                  storyTest,
                  story_showFlow,
                  storyTest,
                  story_decreaseFriction,
                  story_increaseFriction,
                  story_markWaterLevel,
                  story_lowerBed,
                  story_markDifference,
                  ],[storyTest,
                  storyTest,
                  storyTest,
                  storyTest,
                  storyTest,
                  storyTest,
                  storyTest,
                  storyTest,
                  storyTest
                  ],[reset_story_2,
                  storyTest,
                  story_showWaal,
                  story_showStAndries,
                  story_show_uncertainty_waterlevels,
                  story_show_normalised_uncertainty,
                  story_show_floodplain_smoothing,
                  story_show_sidechannels,
                  storyTest,
                  storyTest]];

/////////////////////////////////////////////////////////////
//  General functions to advance story
/////////////////////////////////////////////////////////////


/* advances story by one increment */
function nextStory () {
  var xmlPath = get_storyXML();
  if (StoryProgress < NumberOfStories) {
    // advance story
    StoryProgress += 1;

    // turn the carousel
    $('#StoryCarousel').css('transform', 'translate('+(StoryProgress-1)/NumberOfStories*-100+'%)')
    
    // call function of step in the story
    StoryFunctions[currentStory][StoryProgress]();

    // update progressbar
    let progresstext = Math.round((StoryProgress-1) / (NumberOfStories-1) * 100) + "%";
    $(".progress-inside").each(function () {
      $(this).css("width", progresstext);
    });
 };
};

/* retards story by one increment */
function previousStory () {
  var xmlPath = get_storyXML();
  if (StoryProgress > 1) {
    // retard story
    StoryProgress -= 1;

    // load text
    //$('#StoryText').load(xmlPath+StoryProgress);
    $('#StoryCarousel').css('transform', 'translate('+(StoryProgress-1)/NumberOfStories*-100+'%)')

    // call reverse function
    StoryFunctions[currentStory][StoryProgress + 1](true);

    // update progressbar
    $(".progress-inside").each(function () {
    let progresstext = Math.round((StoryProgress-1) / NumberOfStories * 100) + "%";
      $(this).css("width", progresstext);
    });
};
};

/* Called when user clicks 'home' button */
function resetStory () {
  StoryProgress = 1;
  var xmlPath = get_storyXML();
  StoryFunctions[currentStory][0]();
  //$('#StoryText').load(xmlPath+StoryProgress);
  $('#StoryCarousel').css('transform', 'translate(0%)')
  $(".progress-inside").each(function () {
    let progresstext = Math.round((StoryProgress-1) / NumberOfStories * 100) + "%"
    $(this).css("width", progresstext);
    $(this).children("div").text(progresstext);
  });
};

/////////////////////////////////////////////////////////////
//  Add Swipe functionality
// modified from http://www.javascriptkit.com/javatutors/touchevents2.shtml
/////////////////////////////////////////////////////////////


function addSwipeDetect(el, callback){
  
    var touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        threshold = 75, //required min distance traveled to be considered swipe
        restraint = 100, // maximum distance allowed at the same time in perpendicular direction
        allowedTime = 300, // maximum time allowed to travel that distance
        elapsedTime,
        startTime,
        handleswipe = callback || function(swipedir){}
        
        touchsurface.addEventListener('touchstart', function(e){
          if (flagSwipeActive){
        var touchobj = e.changedTouches[0]
            swipedir = 'none'
            dist = 0
            startX = touchobj.pageX
            startY = touchobj.pageY
            startTime = new Date().getTime() // record time when finger first makes contact with surface
            //e.preventDefault()
            }}, false)
        
        // On touchy move lefty or righty but not scrolly
        // ie: when scroll is enabled on swipeable div, user can move div
        // in any direction. This is confusing... so when moving left
        // or right, disable scrolling inside div
        touchsurface.addEventListener('touchmove', function(e){
            if (flagSwipeActive){
            var touchobj = e.changedTouches[0],
                distX = touchobj.pageX - startX
                distY = touchobj.pageY - startY 

            // Move div to direction along x axis but only iff..
            $('#StoryCarousel').css('transition', 'all 0s ease-out' )
            
            if ((Math.abs(distY) < 10) ||(Math.abs(distX) > 10)) {
              $('#StoryCarousel').css('transform', 'translate(calc('+(StoryProgress-1)/NumberOfStories*-100+'% + '+distX+'px))')
            };

            //e.preventDefault() // prevent scrolling when inside DIV (doesn't seem to work properly here)
        }}, false);
  
        touchsurface.addEventListener('touchend', function(e){
            if (flagSwipeActive){
              var touchobj = e.changedTouches[0]
                  distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
                  distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
                  elapsedTime = new Date().getTime() - startTime // get time elapsed

              if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // condition for horizontal swipe met
                  swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe, otherwise right
                  // do nothing, ease back animation
                  console.log(swipedir)
                  $('#StoryCarousel').css('transition', 'all 0.2s ease-out' )
              }
              else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                  swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
                  // do nothing, ease back animation
                  console.log(swipedir)
                  $('#StoryCarousel').css('transition', 'all 0.2s ease-out' )
                  $('#StoryCarousel').css('transform', 'translate('+(StoryProgress-1)/NumberOfStories*-100+'%)')
              }
              else {
                // 'none', ease back animation
                $('#StoryCarousel').css('transition', 'all 0.2s ease-out' )
                $('#StoryCarousel').css('transform', 'translate('+(StoryProgress-1)/NumberOfStories*-100+'%)')
              }
            // do callback
            handleswipe(swipedir)
        }}, false);
};
  
var el = document.getElementById('StoryFrame');

addSwipeDetect(el, function(swipedir){
    // swipedir contains either "none", "left", "right", "top", or "down"
    if (swipedir=='right'){
      if (StoryProgress!=1){previousStory()}
        else {
          $('#StoryCarousel').css('transition', 'all 0.2s ease-out' )
          $('#StoryCarousel').css('transform', 'translate(0%)')
        }
    } else if (swipedir=='left'){
      if (StoryProgress!=NumberOfStories){nextStory()}
      else {$('#StoryCarousel').css('transform', 'translate('+(StoryProgress-1)/NumberOfStories*-100+'%)')}

      
    };
});

//