// Fallback for older browsers: display browser not support message
console.log('display browsernotsupported message')
$("#loadtext").css('pointer-events', 'initial')
$("#loadtext").append("Unfortunately, your current browser is not supported. "
	+ "<br/> We recommend using an up-to-date, modern browser, like "
	+ "<a href='https://www.mozilla.org/en-US/firefox/new/'>Firefox</a>"
	+ ", or <a href='https://vivaldi.com/'>Vivaldi</a>"

	)