// import polyfill from '../polyfills.js';
import './shims.js';
import OpenWeatherMap from '../openweathermap.js';
import GPS from '../GeoLocation.js';
// import WYSIWYG from '../wysiwyg.js';
// import FileUpload from '../fileupload.js';
import {$, reportError, parseResponse} from '../functions.js';
import handleJSON from '../json_response.js';
// import SocialShare from '../socialshare.js';
import {supportsAsClasses} from '../support_test.js';
// import popState from '../popstate.js';
import kbdShortcuts from '../kbd_shortcuts.js';
import * as pattern from '../patterns.js';
import KeyBase from '../keybase.js';
import * as KEYS from './keys.js';
import deprefix from '../deprefixer.js';
import * as mutations from './mutations.js';

deprefix();

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

function keybaseSearch(submit) {
	submit.preventDefault();
	(async form => {
		const query = form.get('keybase[query]').split(',');
		let results = null;

		switch(form.get('keybase[location]')) {
		case 'usernames':
			results = await KeyBase.searchUsers(...query);
			break;
		case 'twitter':
			results = await KeyBase.searchTwitter(...query);
			break;
		case 'github':
			results = await KeyBase.searchGithub(...query);
			break;
		default:
			throw new Error(`Invalid keybase query: "${form.get('keybase[query]')}"`);
		}
		console.log(results);
		const template = document.getElementById('keybase-user-template');
		const dialog = document.createElement('dialog');
		let close = document.createElement('button');
		let header = document.createElement('header');
		dialog.id='keybase-search-results';
		close.dataset.remove = `#${dialog.id}`;
		close.textContent = 'x';
		dialog.appendChild(header);
		header.appendChild(close);
		results.them.forEach(user => {
			console.info(user);
			let entry = document.importNode(template.content, true);
			$('[data-keybase-prop]', entry).each(node => {
				switch(node.dataset.keybaseProp) {
				case 'picture':
					node.src = user.pictures.primary.url;
					node.width = user.pictures.primary.width;
					node.height = user.pictures.primary.height;
					break;
				case 'name':
					node.textContent = user.profile.full_name;
					break;
				case 'location':
					node.textContent = user.profile.location;
					break;
				case 'keybase-url':
					node.href = `https://keybase.io/${user.basics.username_cased}`;
					break;
				case 'bio':
					node.textContent = user.profile.bio;
					break;
				case 'proofs':
					user.proofs_summary.all.forEach(proof => {
						let item = document.createElement('li');
						let link = document.createElement('a');
						link.href = proof.proof_url;
						link.textContent = `${proof.nametag} @ ${proof.proof_type}`;
						link.target = '_blank';
						item.appendChild(link);
						node.appendChild(item);
					});
					break;
				case 'keys':
					user.public_keys.pgp_public_keys.forEach(key => {
						let pre = document.createElement('pre');
						pre.textContent = key;
						node.appendChild(pre);
					});
					break;
				default:
					node.remove();
				}

			});
			dialog.appendChild(entry);
		});
		document.body.appendChild(dialog);
		dialog.show();
	})(new FormData(submit.target));
}

function appendWeather(weather) {
	const template = document.getElementById('weather-results');
	const dialog = document.createElement('dialog');
	const header = document.createElement('header');
	const close = document.createElement('button');
	dialog.appendChild(header);
	dialog.appendChild(document.importNode(template.content, true));
	header.appendChild(close);
	close.textContent = 'x';
	dialog.id = 'weather-modal';
	close.dataset.remove = `#${dialog.id}`;
	$('[data-weather-prop]', dialog).each(node => {
		let prop = node.dataset.weatherProp;
		if (node.dataset.hasOwnProperty('weatherSection')) {
			let sect = node.dataset.weatherSection;
			if (prop in weather[sect]) {
				node.textContent = weather[sect][prop];
			} else {
				node.remove();
			}
		} else {
			if (prop in weather) {
				node.textContent = weather[prop];
			} else {
				node.remove();
			}
		}
		// if (node.dataset.weatherProp in weather.main) {
		// 	node.textContent = weather.main[node.dataset.weatherProp];
		// } else if (node.dataset.weatherProp in weather) {
		// 	node.textContent = weather[node.dataset.weatherProp];
		// } else {
		// 	node.remove();
		// }
	});
	document.body.appendChild(dialog);
	$('dialog[open]').each(dialog => dialog.close());
	dialog.showModal();
}

function showLocation() {
	(async () => {
		const gps = new GPS();
		const loc = await gps.getCurrentPosition();
		const dialog = document.createElement('dialog');
		const btn = document.createElement('button');
		const link = document.createElement('a');
		const lat = document.createElement('b');
		const long = document.createElement('b');

		lat.textContent = `Latitude: ${loc.coords.latitude}`;
		long.textContent = `Longitude: ${loc.coords.longitude}`;
		btn.textContent = 'x';
		dialog.appendChild(btn);
		dialog.appendChild(document.createElement('hr'));
		dialog.appendChild(link);
		link.appendChild(lat);
		link.appendChild(document.createElement('br'));
		link.appendChild(long);
		btn.addEventListener('click', () => dialog.remove());
		link.href = GPS.getURI(loc);
		document.body.appendChild(dialog);
		dialog.show();
	})();
}


$(document).ready(async () => {
	if (document.createElement('details') instanceof HTMLUnknownElement) {
		$('details > summary').click(() => {
			this.parentElement.open = ! this.parentElement.open;
		});
	}
	$('form[name="openweather"]').submit(event => {
		event.preventDefault();
		const form = new FormData(event.target);
		const weather = new OpenWeatherMap(KEYS.OpenWeatherMap, {units: form.get('units')});
		weather.getFromZip(form.get('zip'), appendWeather);
	});
	$('#weather-loc').click(() => {
		const weather = new OpenWeatherMap(KEYS.OpenWeatherMap);
		weather.getFromCoords(appendWeather);
	});
	$('header h1').html = `<u>${document.title}</u>`;
	mutations.init();
	$('#gps-btn').click(showLocation);
	$(document.body).watch(mutations.events, mutations.options, mutations.filter);
	$('dialog').on('close', event => console.log(event.target.returnValue));

	$('form[name="keybase-search"]').submit(keybaseSearch);
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
