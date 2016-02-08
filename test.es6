import * as polyfills from './polyfills.es6';
import {notify, reportError, parseResponse} from './functions.es6';
import {default as handleJSON} from './json_response.es6';
import {default as SocialShare} from './socialshare.es6'
import {default as supports} from "./support_test.es6";
import {default as popState} from "./popstate.es6";
import {default as $} from './zq.es6';
for (let shim in polyfills.classes) {
	try {
		polyfills.checkClass(shim, polyfills.classes[shim]);
	} catch (e) {
		console.error(e);
		continue;
	}
}
['svg', 'audio', 'video', 'picture', 'canvas', 'menuitem', 'details',
'dialog', 'dataset', 'HTMLimports', 'classList', 'connectivity',
'visibility', 'notifications', 'ApplicationCache', 'indexedDB',
'localStorage', 'sessionStorage', 'CSSgradients', 'transitions',
'animations', 'CSSvars', 'CSSsupports', 'CSSmatches', 'querySelectorAll',
'workers', 'promises', 'ajax', 'FormData'].forEach(feat => {
	supports(feat)
		? document.documentElement.classList.add(feat)
		: document.documentElement.classList.add(`no-${feat}`);
});
popState();
$(self).load(load => {
	let url = new URL('fetch.json', location.origin);
	let headers = new Headers();
	headers.set('Accept', 'application/json');
	fetch(url, {
		headers
	}).then(parseResponse).then(handleJSON).catch(reportError);
});
