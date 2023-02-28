import { createPolicy } from './trust.js';
import { callOnce } from './utility.js';
import {
	allowElements, allowAttributes, allowComments, blockElements, dropAttributes,
	dropElements,
} from './SanitizerConfig.js';

const trustedOrigins = [
	location.origin,
	'https://cdn.kernvalley.us',
	'https://unpkg.com',
];

const googleOrigins = [
	'https://www.googletagmanager.com',
	'https://www.google-analytics.com',
];

/**
 * @TODO: Add support for SVG
 */
export const sanitizerConfig = {
	allowComments,
	allowCustomElements: true,
	allowElements: [
		...allowElements, 'krv-ad', 'krv-events', 'leaflet-map', 'leaflet-marker',
		'youtube-player', 'spotify-player', 'weather-current', 'weather-forecast',
		'github-user', 'github-repo', 'github-gist', 'wfd-events', 'codepen-embed',
		'bacon-ipsum', 'facebook-post',
	],
	allowAttributes: {
		...allowAttributes,
		'theme': [
			'krv-ad', 'weather-current', 'weather-forecast', 'wfd-events',
			'codepen-embed',
		],
		'loading': [
			...allowAttributes.loading, 'krv-ad', 'weather-current',
			'weather-forecast', 'youtube-player', 'spotify-player',
			'github-user', 'github-repo', 'wfd-events', 'codepen-embed',
		],
		'crossorigin': [...allowAttributes.crossorigin, 'leaflet-map'],
		'source': ['krv-ad', 'krv-events', 'wfd-events'],
		'medium': ['krv-ad', 'krv-events', 'wfd-events'],
		'content': ['krv-ad', 'krv-events', 'wfd-events'],
		'campaign': ['krv-ad', 'krv-events', 'wfd-events'],
		'term': ['krv-ad', 'krv-events', 'wfd-events'],
		'count': ['krv-events'],
		'layout': ['krv-ad'],
		'center': ['leaflet-map'],
		'zoom': ['leaflet-map'],
		'tilesrc': ['leflet-map'],
		'allowlocate': ['leaflet-map'],
		'allowfullscreen': ['leaflet-map'],
		'zoomcontrol': ['leaflet-map'],
		'minzoom': ['leaflet-map', 'leaflet-marker'],
		'maxzoom': ['leaflet-map', 'leaflet-marker'],
		'longitude': ['leaflet-marker'],
		'latitude': ['leaflet-marker'],
		'open': [...allowAttributes.open, 'krv-ad'],
		'appid': ['weather-current', 'weather-forecast'],
		'postalcode': ['weather-current', 'weather-forecast'],
		'height': [
			...allowAttributes.height, 'youtube-player', 'github-gist',
			'codepen-embed', 'facebook-post',
		],
		'width': [
			...allowAttributes.width, 'youtube-player', 'github-gist',
			'codepen-embed', 'facebook-post',
		],
		'large': ['spotify-player'],
		'uri': ['spotify-player'],
		'user': [
			'github-repo', 'github-user', 'github-gist', 'codepen-embed',
			'facebook-post',
		],
		'bio': ['github-user'],
		'gist': ['github-gist'],
		'file': ['github-gist'],
		'repo': ['github-repo'],
		'pen': ['codepen-embed'],
		'tab': ['codepen-embed'],
		'editable': ['codepen-embed'],
		'clicktoload': ['codepen-embed'],
		'lines': ['bacon-ipsum'],
		'paras': ['bacon-ipsum'],
		'start-with-lorem': ['bacon-ipsum'],
		'filler': ['bacon-ipsum'],
		'post': ['facebook-post'],
		'showtext': ['facebook-post'],
	},
	dropAttributes,
	blockElements,
	dropElements,
};

export const sanitizer = new Sanitizer(sanitizerConfig);

export const getDefaultPolicy = callOnce(() => createPolicy('default', {
	createHTML: input => {
		if (sanitizer.sanitize instanceof Function && sanitizer.sanitizeFor instanceof Function) {
			return sanitizer.sanitizeFor('div', input).innerHTML
		} else if (Element.prototype.setHTML instanceof Function) {
			const el = document.createElement('div');
			el.setHTML(input, { sanitizer });
			return el.innerHTML;
		} else {
			return input;
		}
	},
	createScript: () => trustedTypes.emptyScript.toString(),
	createScriptURL: input => {
		const url = new URL(input, document.baseURI);

		if (trustedOrigins.includes(url.origin)) {
			return url.href;
		} else {
			throw new TypeError(`Disallowed script origin: ${url.origin}`);
		}
	}
}));

export const getGooglePolicy = callOnce(() => createPolicy('ga#script-url', {
	createHTML: () => trustedTypes.emptyHTML,
	createScript: trustedTypes.emptyScript,
	createScriptURL: input => {
		const url = new URL(input, document.baseURI);

		if (googleOrigins.includes(url.origin)) {
			return url.href;
		} else {
			throw new TypeError(`${url.origin} is not a known Google origin.`);
		}
	}
}) );
