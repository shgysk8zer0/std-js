import { createPolicy } from './trust.js';
import { callOnce } from './utility.js';
import {
	allowElements, allowAttributes, allowComments, blockElements, dropAttributes,
	dropElements,
} from './SanitizerConfigW3C.js';

export const trustedOrigins = [
	location.origin,
	'https://cdn.kernvalley.us',
	'https://unpkg.com',
];

export const googleOrigins = [
	'https://www.googletagmanager.com',
	'https://www.google-analytics.com',
];

export const youtubeEmbedOrigins = [
	'https://www.youtube.com',
	'https://www.youtube-nocookie.com',
];

export const youtubeEmbeds = [
	'https://www.youtube.com/embed/',
	'https://www.youtube-nocookie.com/embed/',
];

export function isTrustedScriptOrigin(input) {
	const { origin } = new URL(input, document.baseURI);
	return trustedOrigins.includes(origin);
}

export function isGoogleOrigin(input) {
	const { origin } = new URL(input, document.baseURI);
	return googleOrigins.includes(origin);
}

export function isYouTubeEmbed(input) {
	const { origin, pathname } = new URL(input, document.baseURI);
	return youtubeEmbedOrigins.includes(origin) && pathname.startsWith('/embed/');
}

export function isDisqusEmbedScript(input) {
	return /^https:\/\/[\w-]+\.disqus\.com\/embed\.js$/.test(input);
}

export function isDisqusEmbed(input) {
	return input.startsWith('https://disqus.com/embed/comments/');
}

function createSanitizerCallback(sanitizer = new Sanitizer(Sanitizer.getDefaultConfiguration())) {
	if (Sanitizer.prototype.sanitizeFor instanceof Function) {
		return input => sanitizer.sanitizeFor('div', input).innerHTML;
	} else if (Element.prototype.setHTML instanceof Function) {
		return input => {
			const el = document.createElement('div');
			el.setHTML(input, { sanitizer });
			return el.innerHTML;
		};
	} else {
		return input => input;
	}
}

export const createEmptyHTML = () => trustedTypes.emptyHTML;
export const createEmptyScript = () => trustedTypes.emptyScript;

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

export const getDefaultPolicy = callOnce(() => {
	const sanitizer = new Sanitizer(sanitizerConfig);

	return createPolicy('default', {
		createHTML: createSanitizerCallback(sanitizer),
		createScript: createEmptyScript,
		createScriptURL: input => {
			if (isTrustedScriptOrigin(input)) {
				return input;
			} else {
				throw new TypeError(`Disallowed script origin: ${input}`);
			}
		}
	});
});

export const getDefaultPolicyWithDisqus = callOnce(() => {
	const sanitizer = new Sanitizer(Sanitizer.getDefaultConfiguration());

	return createPolicy('default', {
		createHTML: createSanitizerCallback(sanitizer),
		createScript: createEmptyScript,
		createScriptURL: input => {
			if (isTrustedScriptOrigin(input) || isDisqusEmbed(input)) {
				return input;
			} else {
				throw new TypeError(`Disallowed script origin: ${input}`);
			}
		}
	});
});

export const getKRVPolicy = callOnce(() => {
	const sanitizer = new Sanitizer(sanitizerConfig);

	return createPolicy('krv', {
		createHTML: createSanitizerCallback(sanitizer),
		createScript: createEmptyScript,
		createScriptURL: input => {
			if (isTrustedScriptOrigin(input)) {
				return input;
			} else {
				throw new TypeError(`Disallowed script origin: ${input}`);
			}
		}
	});
});

export const getYouTubePolicy = callOnce(() => createPolicy('youtube#embed', {
	createScriptURL: input => {
		if (isYouTubeEmbed(input)) {
			return input;
		} else {
			throw new TypeError(`Invalid YouTube URL: ${input}`);
		}
	}
}));

export const getGooglePolicy = callOnce(() => createPolicy('ga#script-url', {
	createHTML: createEmptyHTML,
	createScript: createEmptyScript,
	createScriptURL: input => {
		if (isGoogleOrigin(input)) {
			return input;
		} else {
			throw new TypeError(`${input} is not a known Google origin.`);
		}
	}
}));

export const getDisqusPolicy = callOnce(() => createPolicy('disqus#script-url', {
	createScriptURL: input => {
		if (isDisqusEmbedScript(input)) {
			return input;
		} else {
			throw new TypeError(`Invalid Disqus URL: ${input}`);
		}
	}
}));

export const getDefaultNoOpPolicy = callOnce(() => createPolicy('default', {}));
