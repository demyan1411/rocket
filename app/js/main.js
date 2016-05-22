"use strict";

$(document).ready(function() {

	new Move({
		el: '.js-move'
	});

	new Popup({
		el: '.js-popup'
	});

	timer();

});
