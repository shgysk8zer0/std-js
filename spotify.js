import { createPolicy } from './trust.js';
import { createIframe } from './elements.js';

const SPOTIFY = 'https://open.spotify.com/embed/';
const SANDBOX = ['allow-scripts', 'allow-popups', 'allow-same-origin'];
const ALLOW = ['encrypted-media'];
const TYPES = [
	'album',
	'artist',
	'playlist',
	'show',
	'track',
];

export const policy = createPolicy('spotify#script-url', {
	createScriptURL: input => {
		if (input.startsWith(SPOTIFY)) {
			return input;
		} else {
			throw new TypeError(`Not a Spotify embed URL: ${input}`);
		}
	}
});

export function parseURI(uri) {
	if (typeof uri !== 'string') {
		throw new Error('URI is not a string');
	} else if (! uri.startsWith('spotify:')) {
		throw new Error('URI is not a valid Spotify URI');
	} else {
		const [, type = '', id = ''] = uri.split(':');

		if (! TYPES.includes(type)) {
			throw new Error(`Unsupported type: ${type}`);
		} else {
			return { type, id };
		}
	}
}

export function linkToUri(link) {
	if (typeof link === 'string' && link.startsWith('https:')) {
		const url = new URL(link);
		const [type = null, id = null] = url.pathname.substr(1).split('/');

		if (
			url.host.toLowerCase() === 'open.spotify.com'
			&& TYPES.includes(type)
			&& typeof id === 'string'
		) {
			return `spotify:${type}:${id}`;
		} else {
			return null;
		}
	} else {
		return null;
	}
}

export function uriToLink(uri) {
	if (typeof uri === 'string' && uri.startsWith('spotify:')) {
		const [, type = null, id = null] = uri.split(':');

		if (TYPES.includes(type) && typeof id === 'string') {
			const url = new URL(`${type}/${id}`, 'https://open.spotify.com');
			return url.href;
		} else {
			return null;
		}
	} else {
		return null;
	}
}

function createSpotifyIframe(type, id, { title = 'Spotify Player', large = false, slot, part } = {}) {
	return createIframe(policy.createScriptURL(new URL(`./${type}/${id}`, SPOTIFY)), {
		width: 300,
		height: large ? 380 : 80,
		referrerPolicy: 'origin',
		slot,
		part,
		sandbox: SANDBOX,
		allow: ALLOW,
		title,
	});
}

export function createSpotifyAlbum(id, { title, large, slot, part } = {}) {
	return createSpotifyIframe('album', id, { title, large, slot, part });
}

export function createSpotifyArtist(id, { title, large, slot, part } = {}) {
	return createSpotifyIframe('artist', id, { title, large, slot, part });
}

export function createSpotifyPlaylist(id, { title, large, slot, part } = {}) {
	return createSpotifyIframe('playlist', id, { title, large, slot, part });
}

export function createSpotifyShow(id, { title, large, slot, part } = {}) {
	return createSpotifyIframe('show', id, { title, large, slot, part });
}

export function createSpotifyTrack(id, { title, large, slot, part } = {}) {
	return createSpotifyIframe('track', id, { title, large, slot, part });
}

export const trustPolicies = [policy.name];
