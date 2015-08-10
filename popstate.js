window.addEventListener('popstate', function() {
	'use strict';
	ajax({
		url: location.pathname,
		type: 'GET'
	}).then(handlJSON).catch(function(err) {
		$('body > progress').remove();
		reportError(err);
	});
});
