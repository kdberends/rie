// call functions at start
$(window).on('load', function() {
    // your code here
    console.log('Opening story overview')
    openStoryOverview();
	toggleApp(0);
	$('#loader-wrapper').addClass('loaded');

	/*
	var maptip = new Tooltip($("#menuToggle"), {
	  title: "Click here to explore all datasets!",
	  placement: 'bottom',
	  trigger: 'manual'
	});
	maptip.show()*/
	//maptip.dispose()
});
