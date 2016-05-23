"use strict";

$(document).ready(function() {

	new Move({
		el: '.js-move'
	});

	new Popup({
		el: '.js-popup'
	});

	timer();

	// var wow = new WOW({
	// 	offset: 200
	// });
	// wow.init();

	new WOW().init();

	$('#str_nm').streetSuggestion(
		$('#str_id'),
		function (streetId, streetName) {
			$('#dom_id').html('<option value="0">Дом</option>').load('get_houses.php', {street_id: streetId}, function () {
				$('#dom_id').prop('disabled', false);
				$('body').css('cursor', 'default');
			});
			},
		function () {
			$('#dom_id').prop('disabled', true);
		}
	);

});
