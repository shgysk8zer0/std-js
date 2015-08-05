window.addEventListener('popstate', function() {
	'use strict';
	fetch(location.pathname, {
		method: 'GET',
		headers: new Headers({Accept: 'application/json'})
	}).then(parseResponse).then(handleJSON).catch(reportError);
});
