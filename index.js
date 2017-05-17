// import polyfill from './polyfills.js';
// import Weather from './openweathermap.js';
// import WYSIWYG from './wysiwyg.js';
// import FileUpload from './fileupload.js';
import {$} from './functions.js';
import {reportError, parseResponse} from './functions.js';
import handleJSON from './json_response.js';
// import SocialShare from './socialshare.js';
import {supportsAsClasses} from './support_test.js';
// import popState from './popstate.js';
import kbdShortcuts from './kbd_shortcuts.js';
import * as pattern from './patterns.js';
// import KeyBase from './keybase.js';
import * as handlers from './dataHandlers.js';
import SchemaTemplate from './SchemaTemplate.js';

if (document.createElement('dialog') instanceof HTMLUnknownElement) {
	if (! ('open' in HTMLElement.prototype)) {
		Object.defineProperty(HTMLElement.prototype, 'open', {
			get: function() {
				return this.hasAttribute('open');
			},
			set: function(open) {
				open ? this.setAttribute('open', '') : this.removeAttribute('open');
			}
		});
	}

	HTMLElement.prototype.show = function() {
		this.open = true;
	};

	HTMLElement.prototype.close = function() {
		this.open = false;
		this.classList.remove('modal');
	};

	HTMLElement.prototype.showModal = function() {
		this.open = true;
		this.classList.add('modal');
	};
} else if (document.createElement('details') instanceof HTMLUnknownElement) {
	if (! ('open' in HTMLElement.prototype)) {
		Object.defineProperty(HTMLElement.prototype, 'open', {
			get: function() {
				return this.hasAttribute('open');
			},
			set: function(open) {
				open ? this.setAttribute('open', '') : this.removeAttribute('open');
			}
		});
	}
}

if (!('replace' in DOMTokenList.prototype)) {
	DOMTokenList.prototype.replace = function (oldToken, newToken) {
		if (this.contains(oldToken)) {
			this.remove(oldToken);
			this.add(newToken);
		}
	};
}

// import GitHub from './GitHub.js';

// const handlers = {
// 	showModal: function() {
// 		document.querySelector(this.dataset.showModal).showModal();
// 	},
// 	close: function() {
// 		document.querySelector(this.dataset.close).close();
// 	},
// 	remove: function() {
// 		$(this.dataset.remove).remove();
// 	}
// }
document.body.classList.remove('no-js');
document.body.classList.add('js');
window.pattern = pattern;
// polyfill();
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
/**
 * Expects node to have a data-schema-content attribute containing a URL with
 * a hash / anchor of the <template> ID for template to populate and append
 */
function importSchema(node) {
	const url = new URL(node.dataset.schemaContent, location.origin);
	const template = new SchemaTemplate(url.hash.substring(1));
	const headers = new Headers();
	headers.set('Accept', 'application/json');
	url.hash = '';

	fetch(url, {
		headers,
		method: 'Get'
	}).then(resp => {
		if (resp.ok) {
			return resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}).then(json => {
		template.data = json;
		template.appendTo(node);
	}).catch(console.error);
}
const events = {
	attributes: function() {
		switch(this.attributeName) {
		case 'data-remove':
			if (this.target.dataset.hasOwnProperty('remove')) {
				this.target.addEventListener('click', handlers.remove);
			} else {
				this.target.removeEventListener('click', handlers.remove);
			}
			break;
		case 'data-show-modal':
			if (this.target.dataset.hasOwnProperty('showModal')) {
				this.target.addEventListener('click', handlers.showModal);
			} else {
				this.target.removeEventListener('click', handlers.showModal);
			}
			break;
		case 'data-show':
			if (this.target.dataset.hasOwnProperty('show')) {
				this.target.addEventListener('click', handlers.show);
			} else{
				this.target.removeEventListener('click', handlers.show);
			}
			break;
		case 'data-close':
			if (this.target.dataset.hasOwnProperty('close')) {
				this.target.addEventListener('click', handlers.close);
			} else {
				this.target.removeEventListener('click', handlers.close);
			}
			break;
		case 'data-toggle-hidden':
			if (this.target.dataset.hasOwnProperty('toggleHidden')) {
				this.target.addEventListener('click', handlers.toggleHidden);
			} else {
				this.target.removeEventListener('click', handlers.toggleHidden);
			}
			break;
		case 'data-social-share':
			if (this.target.dataset.hasOwnProperty('socialShare')) {
				this.target.addEventListener('click', handlers.socialShare);
			} else {
				this.target.removeEventListener('click', handlers.socialShare);
			}
			break;
		default:
			throw new Error(`Unhandled attribute change [${this.attributeName}]`);

		}
	},
	childList: function() {
		$(this.addedNodes).each(node => {
			if (node.nodeType === 1) {
				init(node);
			}
		});
	}
};
const filter = [
	'data-remove',
	'data-show-modal',
	'data-show',
	'data-close',
	'data-toggle-hidden',
	'data-social-share',
];

const options = [
	'subtree',
	'attributeOldValue'
];

function init(base = document.body) {
	$('[data-show-modal]', base).click(handlers.showModal);
	$('[data-close]', base).click(handlers.close);
	$('[data-remove]', base).click(handlers.remove);
	$('[data-toggle-hidden]', base).click(handlers.toggleHidden);
	$('[data-schema-content]', base).each(importSchema);
	$('[data-social-share]', base).click(handlers.socialShare);
}

$(self).load(() => {
	if (document.createElement('details') instanceof HTMLUnknownElement) {
		$('details > summary').click(() => {
			this.parentElement.open = ! this.parentElement.open;
		});
	}
	$('header h1').html = `<u>${document.title}</u>`;
	init();
	$(document.body).watch(events, options, filter);

	// $('form[name="keybase-search"]').submit(async submit => {
	// 	submit.preventDefault();
	// 	const form = new FormData(submit.target);
	// 	const query = form.get('keybase[query]');
	// 	let results = null;

	// 	switch(form.get('keybase[location]')) {
	// 	case 'usernames':
	// 		results = await KeyBase.searchUsers(query);
	// 		break;
	// 	case 'twitter':
	// 		results = await KeyBase.searchTwitter(query);
	// 		break;
	// 	case 'github':
	// 		results = await KeyBase.searchGithub(query);
	// 		break;
	// 	}

	// 	console.log(results);
	// });
	// console.info(Weather, SocialShare, WYSIWYG, FileUpload);
	let url = new URL('fetch.json', location.origin);
	let headers = new Headers();
	headers.set('Accept', 'application/json');
	fetch(url, {
		headers
	}).then(parseResponse).then(handleJSON).catch(reportError);
});
// (async username => {
// 	let user = await GitHub.getUser(username);
// 	console.log(user);
// })('shgysk8zer0');
