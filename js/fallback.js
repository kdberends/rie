// Fallback for older browsers: display browser not support message
console.log('display browsernotsupported message')
$('#loader').css('visibility', 'hidden');
$('#loadlogo').css('visibility', 'hidden');
$("#loadtext").css('width', '400px')
$("#loadtext").css('font-size', '18px')
$("#loadtext").css('top', '100px')
$("#loadtext").css('border', '0 0 0 0')
$("#loadtext").css('pointer-events', 'initial')
$("#loadtext").append("Unfortunately, your current browser is not supported. "
	+ "<br/> We recommend using an up-to-date, modern browser, like "
	+ "<a href='https://www.mozilla.org/en-US/firefox/new/'>Firefox</a>"
	)