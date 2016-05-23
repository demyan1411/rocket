/*
	jQuery Street Suggestion by Rebel™ [ www.aleksandr.ru ]

	Выдает подсказки возможных нащваний улиц по введенным символам (от 3 букв)
	и устанавливает их ID в указанный input
*/

;(function($) {

/*
	Example
	-------

	<style type="text/css">
		.suggestion { border: solid 1px gray; padding: 1px; width: 300px; overflow: auto; background-color: white; position: absolute; display: none; }
		.suggestion div { padding: 1px; cursor: pointer; }
		.suggestion div.selected { color: white; background-color: #000080; }
	</style>

	<script language="JavaScript">
	<!--
		$(document).ready(function() {
			$('#myTextBox').streetSuggestion(
				$('#idContainer'),
				function(streetId, streetName) {
					alert(streetId + ' ' + streetName);
				},
				function() {
					alert('No Street');
				}
			);
		});
	//-->
	</script>


	Parameters
	----------

	streetIdContainer - объект (с value) для хранения ID улицы (обычно input)
	successCallback   - callback-функция вызываемя при успешной подстановке улицы
	noStreetCallback  - callback-функция вызываемая когда не установлена улица (подробнее когда вызывается см. в коде)
	initValue		  - объект с начальными значениями streetId и streetName, например {streetId: 1, streetName: 'Тест'}
						если присутствеет streetId и streetName, сразу выполняется successCallback
*/


$.fn.streetSuggestion = function(streetIdContainer, successCallback, noStreetCallback, initValue){

	var streetNameContainer = $(this);
	var url = "get_streets.php";
	var t;
	var suggestion = $("<div class='suggestion'></div>").appendTo( streetNameContainer.parent() );

	$(this).attr("autocomplete", "off"); // отключить автозаполнение для IE и FireFox
	if($(streetIdContainer).val() == "") $(streetIdContainer).val(0);

	function setStreet(streetId, streetName)
	{
		$(streetNameContainer).val(streetName);
		$(streetIdContainer).val(streetId);
		$(suggestion).hide();
		$(streetNameContainer).removeClass("suggested");
		$(streetNameContainer).blur();

		if(successCallback) successCallback(streetId, streetName);
	}

	$(streetNameContainer).blur(function(){
		clearTimeout(t);

		setTimeout( function(){
			$(suggestion).hide();
			$(streetNameContainer).removeClass("suggested");
		}, 200);

		if($(streetIdContainer).val() == 0 && noStreetCallback) noStreetCallback();
	});

	$(streetNameContainer).focus(function(){
		setTimeout(function(){
			if($(streetIdContainer).val() == 0)
			{
				if(noStreetCallback) noStreetCallback();
				$(streetNameContainer).keyup();
			}
		}, 10);
	});

	$(streetNameContainer).keyup(function(e){

		var keyID = e.keyCode || e.which;

		if($(streetNameContainer).val().length >= 3 /*&& keyID!=8*/) { // not BackSpace? WTF?

			if(keyID == 38) // Arrow Up
			{
				if($(suggestion).children("div").hasClass("selected"))
				{
					$(suggestion).children("div.selected").prev("div").addClass("selected");
					$(suggestion).children("div.selected:last").removeClass("selected");

					// если нет выделенного (переход с самого верха в самый низ)
					if($(suggestion).children("div.selected").length < 1)
					{
						$(suggestion).children("div:last").addClass("selected");
						$(suggestion).animate({scrollTop: $(suggestion).attr("scrollHeight")});
					}

					// если выеделение ушло вверх (показать блок выше)
					if($(suggestion).children("div.selected").position().top < 0)
					{
						$(suggestion).animate({scrollTop: $(suggestion).attr("scrollTop") - $(suggestion).height() + $(suggestion).children("div.selected").height()});
					}
				}
				else
				{
					$(suggestion).children("div:last").addClass("selected");
					$(suggestion).animate({scrollTop: $(suggestion).attr("scrollHeight")});
				}
			}
			else if(keyID == 40) // Arrow Down
			{
				if($(suggestion).children("div").hasClass("selected"))
				{
					$(suggestion).children("div.selected").next("div").addClass("selected");
					$(suggestion).children("div.selected:first").removeClass("selected");

					// если нет выделенного (переход с самого низа в самый верх)
					if($(suggestion).children("div.selected").length < 1)
					{
						$(suggestion).children("div:first").addClass("selected");
						$(suggestion).animate({scrollTop: 0});
					}

					// если выеделение ушло вниз (показать блок ниже)
					if($(suggestion).children("div.selected").position().top > $(suggestion).height() - $(suggestion).children("div.selected").height())
					{
						$(suggestion).animate({scrollTop: $(suggestion).attr("scrollTop") + $(suggestion).children("div.selected").position().top});
					}
				}
				else
				{
					$(suggestion).children("div:first").addClass("selected");
					$(suggestion).animate({scrollTop: 0});
				}
			}
			else if(keyID == 37 || keyID == 39) // Arrow Left Right
			{
				// do notnig
			}
			else if(keyID == 36 || keyID == 35 || keyID == 33 || keyID == 34) // Home End PgUp PgDn
			{
				// do notnig
			}
			else if(keyID == 9 && $(streetIdContainer).val() > 0) // Tab and sterrt already set
			{
				// do notnig
			}
			else if(keyID == 13 && $(streetIdContainer).val() > 0) // Enter and sterrt already set
			{
				// do notnig
			}
			else
			{
				//if(!$(streetIdContainer).val()) { if(noStreetCallback) noStreetCallback(); }

				$(streetIdContainer).val(0);
				$(suggestion).hide();
				$(streetNameContainer).removeClass('suggested').removeClass('notfound');
				if(noStreetCallback) noStreetCallback();

				clearTimeout(t);
				t = setTimeout( function(){

					$("body").css("cursor", "wait");

					$(suggestion).load(url, {q: $(streetNameContainer).val()}, function(responseText, textStatus, XMLHttpRequest){

						if(responseText)
						{
							$(suggestion).children("div").mousemove(function(e){
								$(suggestion).children("div").removeClass("selected");
								$(this).addClass("selected");
							});

							$(suggestion).children("div").click(function(e){
								$(suggestion).children("div").removeClass("selected");
								$(this).addClass("selected");

								setStreet($(suggestion).children("div.selected").attr("street_id"), $(suggestion).children("div.selected").text());
							});

							if ($(suggestion).children("div").length==1)
							{	$(suggestion).children("div").click();
								return; }

							$(suggestion).show();
							$(suggestion).css("min-width", $(streetNameContainer).width());
							$(suggestion).css("top", $(streetNameContainer).position().top + $(streetNameContainer).outerHeight() -1);
							$(suggestion).css("left", $(streetNameContainer).position().left);

							$(suggestion).css("height", "auto");
							if($(suggestion).height() > 300) $(suggestion).height(250);

							if($(suggestion).width() < $(streetNameContainer).width()) $(suggestion).width($(streetNameContainer).width());

							$(streetNameContainer).addClass("suggested");
						}
						else
						{
							$(suggestion).hide();
							$(streetNameContainer).removeClass('suggested');
							$(streetNameContainer).addClass('notfound');
						}

						$("body").css("cursor", "default");
					});
				}, 300);
			}
		}
		else
		{
			$(streetIdContainer).val(0);
			$(suggestion).hide();
			$(streetNameContainer).removeClass("suggested").removeClass('notfound');
			if(noStreetCallback) noStreetCallback();
		}
	});

	$(streetNameContainer).keydown(function(e){

		var keyID = e.keyCode || e.which;

		if($(suggestion).css("display")=="block") {

			if(keyID == 13) // Enter
			{
				if($(suggestion).children("div").hasClass("selected"))
				{
					setStreet($(suggestion).children("div.selected").attr("street_id"), $(suggestion).children("div.selected").text());
				}
				e.preventDefault();
				e.keyCode = 0;
				e.returnValue = false;
				return false;
			}
		}
	});

	initSettings = jQuery.extend({
		streetId: 0,
		streetName: ""
	}, initValue);

	if(initSettings.streetId && initSettings.streetName) setStreet(initValue.streetId, initValue.streetName)
}

})(jQuery);