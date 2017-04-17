import polyfill from './polyfills.js';
import Weather from './openweathermap.js';
import WYSIWYG from './wysiwyg.js';
import FileUpload from './fileupload.js';
import {$} from './functions.js';
import {reportError, parseResponse} from './functions.js';
import handleJSON from './json_response.js';
import SocialShare from './socialshare.js';
import {supportsAsClasses} from './support_test.js';
// import popState from './popstate.js';
import kbdShortcuts from './kbd_shortcuts.js';
import * as pattern from './patterns.js';
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
