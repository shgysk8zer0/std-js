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
import KeyBase from './keybase.js';

const handlers = {
	showModal: function() {
		document.querySelector(this.dataset.showModal).showModal();
	},
	close: function() {
		document.querySelector(this.dataset.close).close();
	},
	remove: function() {
		$(this.dataset.remove).remove();
	}
}
document.body.classList.remove('no-js');
document.body.classList.add('js');
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
	$('header h1').html = `<u>${document.title}</u>`;
	$('[data-show-modal]').click(handlers.showModal);
	$('[data-close]').click(handlers.close);
	$('[data-remove]').click(handlers.remove);
	$('form[name="keybase-search"]').submit(async submit => {
		submit.preventDefault();
		const form = new FormData(submit.target);
		const query = form.get('keybase[query]');
		let results = null;

		switch(form.get('keybase[location]')) {
		case 'usernames':
			results = await KeyBase.searchUsers(query);
			break;
		case 'twitter':
			results = await KeyBase.searchTwitter(query);
			break;
		case 'github':
			results = await KeyBase.searchGithub(query);
			break;
		}

		console.log(results);
	});
	console.info(Weather, SocialShare, WYSIWYG, FileUpload);
	let url = new URL('fetch.json', location.origin);
	let headers = new Headers();
	headers.set('Accept', 'application/json');
	fetch(url, {
		headers
	}).then(parseResponse).then(handleJSON).catch(reportError);
});
