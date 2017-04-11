import polyfill from './polyfills.es6';
import Weather from './openweathermap.es6';
import WYSIWYG from './wysiwyg.es6';
import FileUpload from './fileupload.es6';
import {$} from './functions.es6';
import {reportError, parseResponse} from './functions.es6';
import handleJSON from './json_response.es6';
import SocialShare from './socialshare.es6';
import {supportsAsClasses} from './support_test.es6';
// import popState from './popstate.es6';
import kbdShortcuts from './kbd_shortcuts.es6';
import * as pattern from './patterns.es6';
window.pattern = pattern;
polyfill();
// popState();
addEventListener('keypress', kbdShortcuts);
supportsAsClasses('svg', 'audio', 'video', 'picture', 'canvas', 'menuitem',
'details', 'dialog', 'dataset', 'HTMLimports', 'classList', 'connectivity',
'visibility', 'notifications', 'ApplicationCache', 'indexedDB',
'localStorage', 'sessionStorage', 'CSSgradients', 'transitions',
'animations', 'CSSvars', 'CSSsupports', 'CSSmatches', 'querySelectorAll',
'workers', 'promises', 'ajax', 'FormData');
// if ('serviceWorker' in navigator) {
// 	try {
// 		let url = new URL('serviceWorker.es6', location.origin);
// 		navigator.serviceWorker.register(url, {
// 			scope: location.pathname
// 		}).catch(error => {
// 			console.error(error);
// 		});
// 	} catch(error) {
// 		console.error(error);
// 	}
// }
$(self).load(() => {
	console.log($('*'));
	console.info(Weather, SocialShare, WYSIWYG, FileUpload);
	let url = new URL('fetch.json', location.origin);
	let headers = new Headers();
	headers.set('Accept', 'application/json');
	fetch(url, {
		headers
	}).then(parseResponse).then(handleJSON).catch(reportError);
});
