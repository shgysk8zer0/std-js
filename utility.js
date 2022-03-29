/* global define */
export function amd(name, factory, requires = {}) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		try {
			define(name, requires, factory);
			return true;
		} catch(err) {
			console.error(err);
			return false;
		}
	} else {
		return false;
	}
}

export function setURLParams(url, params) {
	if (! (url instanceof URL)) {
		url = new URL(url, document.baseURI);
	}

	if (params instanceof HTMLFormElement) {
		return setURLParams(url, new FormData(params));
	} else if (params instanceof FormData) {
		return setURLParams(url, Object.fromEntries(params));
	} else if (params instanceof URLSearchParams) {
		return setURLParams(url, Object.fromEntries(params));
	} else if (Array.isArray(params) || typeof params === 'string') {
		return setURLParams(url, new URLSearchParams(params));
	} else if (typeof params === 'object') {
		url.search = new URLSearchParams({ ...Object.fromEntries(url.searchParams), ...params});
	}

	return url;
}

export function setUTMParams(url, {
	source: utm_source,
	medium: utm_medium = 'referral',
	content: utm_content,
	campaign: utm_campaign,
	term: utm_term,
} = {}) {
	if (typeof utm_source === 'string') {
		return setURLParams(url, { utm_source, utm_medium, utm_content, utm_campaign, utm_term });
	} else {
		return new URL(url, document.baseURI);
	}
}
