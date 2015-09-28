window.addEventListener('popstate', () => {
	'use strict';
	ajax({
		url: location.pathname,
		type: 'GET'
	}).then(handleJSON).catch(err => {
		$('body > progress').remove();
		reportError(err);
	});
});
