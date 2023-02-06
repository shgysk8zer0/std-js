import { md5 } from './hash.js';
import { createImage } from './elements.js';
import { setURLParams } from './utility.js';
import { REFERRER_POLICY } from './defaults.js';
const GRAVATAR = 'https://secure.gravatar.com/avatar/';
const SIZE = 80;
const FALLBACK = 'mm';
const FORCE = false;
const RATING = undefined;

export async function gravatarURL(email, {
	size: s = SIZE,
	fallback: d = FALLBACK,
	force: f = FORCE,
	rating: r = RATING,
} = {}) {
	const hash = await md5(email);
	return setURLParams(new URL(hash, GRAVATAR), { s, d, f: f ? 'y': undefined, r });
}

export function changeGravatarSize(url, size) {
	const cpy = new URL(url, GRAVATAR);
	cpy.searchParams.set('s', size);
	return cpy;
}

export function gravatarSrcset(url, ...sizes) {
	return sizes.map(size => changeGravatarSize(url, size));
}

/**
 * @TODO figure out responsive images
 */
export async function createGravatarImage(email, {
	size = SIZE,
	fallback = FALLBACK,
	force = FORCE,
	rating = RATING,
	alt = '',
	id = null,
	crossOrigin = 'anonymous',
	itemprop = null,
	itemtype = null,
	itemscope = true,
	// sizes = null,
	// srcset = null,
	referrerPolicy = REFERRER_POLICY,
	fetchPriority = 'auto',
	loading = 'eager',
	decoding = 'async',
	role = null,
	slot = null,
	part = [],
	classList = [],
	dataset = null,
	styles = null,
	events: {
		capture,
		passive,
		once,
		signal,
		...events
	} = {},
} = {}) {
	const url = await gravatarURL(email, { size, fallback, force, rating });

	return createImage(url, {
		alt, id, crossOrigin, itemprop, itemtype, itemscope, referrerPolicy,
		fetchPriority, loading, decoding, role, slot, part, classList, dataset,
		styles, events: { capture, passive, once, signal, ...events },
	});
}

export function setGravatarSrcset(img, ...sizes) {
	if (! (img instanceof HTMLImageElement)) {
		throw new TypeError('`setGravatarSrcset` requires an `<img>`');
	} else if (sizes.length === 0) {
		throw new Error('No sizes given');
	} else {
		const src = new URL(img.src, GRAVATAR);
		const updateSize = size => {
			src.searchParams.set('s', size);
			return src.href;
		};

		img.srcset = sizes.map(size => `${updateSize(size)} ${size}w`).join(' ');
		return img;
	}
}
