// call functions at start
$(window).on('load', function() {
    // your code here
    try{
    console.log('Opening story overview')
    openStoryOverview();
	toggleApp(0);
	$('#loader-wrapper').addClass('loaded');}
	catch(e) {console.log("unsupported browser")}
});
