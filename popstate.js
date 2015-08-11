window.addEventListener('popstate', function() {
	'use strict';
	ajax({
		url: location.pathname,
		type: 'GET'
	}).then(handleJSON).catch(function(err) {
		$('body > progress').remove();
		reportError(err);
	});
});
