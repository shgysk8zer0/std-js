const ENDPOINTS = {
	facebook:   'https://www.facebook.com/sharer/sharer.php',
	twitter:     'https://twitter.com/intent/tweet/',
	googlePlus: 'https://plus.google.com/share/',
	linkedIn:   'https://www.linkedin.com/shareArticle/',
	pinterest:   'https://www.pinterest.com/pin/create/button/',
	reddit:     'https://www.reddit.com/submit/'
};

function getDescription(base = document.head) {
	let description = base.querySelector('[itemprop="description"], meta[name="description"]');
	if (description instanceof HTMLElement) {
		return description.hasAttribute('content')
			? description.getAttribute('content')
			: description.textContent;
	} else {
		return '';
	}
}

function getKeywords(base = document.head) {
	let keywords = base.querySelector('[itemprop="keywords"], meta[name="keywords"]');
	if (keywords instanceof HTMLElement) {
		return keywords.hasAttribute('content')
			? keywords.getAttribute('content').split(',')
			: keywords.textContent.split(',');
	} else {
		return [];
	}
}

export default class SocialShare {
	static get facebook() {
		return SocialShare.getFacebook();
	}

	static get twitter() {
		return SocialShare.getTwitter();
	}

	static get googlePlus() {
		return SocialShare.getGooglePlus();
	}

	static get linkedIn() {
		return SocialShare.getLinkedIn();
	}

	static get pinterest() {
		return SocialShare.getPinterest();
	}

	static get reddit() {
		return SocialShare.getReddit();
	}

	static getFacebook(href = location.href) {
		let url = new URL(ENDPOINTS.facebook);
		url.searchParams.set('u', href);
		return url;
	}

	static getTwitter(href = location.href, {
		text     = '',
		via      = null,
		hashtags = getKeywords()
	} = {}) {
		let url = new URL(ENDPOINTS.twitter);
		url.searchParams.set('text', text);
		url.searchParams.set('url', href);
		if (typeof via === 'string') {
			url.searchParams.set('via', via);
		}
		if (hashtags.length > 0) {
			url.searchParams.set('hashtags', hashtags.join(','));
		}
		return url;
	}

	static getGooglePlus(href = location.href) {
		let url = new URL(ENDPOINTS.googlePlus);
		url.searchParams.set('url', href);
		return url;
	}

	static getLinkedIn(href = location.href, {
		title   = document.title,
		summary = getDescription(),
		mini    = 'true'
	} = {}) {
		let url = new URL(ENDPOINTS.linnkedIn);
		url.searchParams.set('mini', mini);
		url.searchParams.set('url', href);
		url.searchParams.set('title', title);
		url.searchParams.set('summary', summary);
		return url;
	}

	static getPinterest(href = location.href, {
		media       = null,
		description = getDescription(),
		hashtags    = getKeywords(),
	} = {}) {
		let url = new URL(ENDPOINTS.pinterest);
		url.searchParams.set('url', href);
		if (typeof media === 'string') {
			url.searchParams.set('media', media);
		}
		url.searchParams.set('description', description);
		if (hashtags.length > 0) {
			url.searchParams.set('hashtags', hashtags.join(','));
		}
		return url;
	}

	static getReddit(href = location.href) {
		let url = new URL(ENDPOINTS.reddit);
		url.searchParams.set('url', href);
		return url;
	}

	static openPopup(url, {
		title      = document.title,
		height     = 600,
		width      = 600,
		left       = 0,
		top        = 0,
		menubar    = 'no',
		toolbar    = 'no',
		resizable  = 'yes',
		scrollbars = 'yes'
	} = {}) {
		return window.open(
			url,
			title,
			`menubar=${menubar},toolbar=${toolbar},resizable=${resizable},scrollbars=${scrollbars},width=${width},height=${height},left=${left},top=${top}`
		);
	}
}
