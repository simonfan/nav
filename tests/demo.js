define(['jquery','nav'], function($, Nav) {

	console.log('nav demo', Nav);


	window.horiz = Nav.build({
		$ul: $('#nav-horizontal'),
		dropdownInteraction: 'click',
	});

	window.verti = $('#nav-vertical').Nav({
		expandableInteraction: 'hover',
	}).data('Nav');
});