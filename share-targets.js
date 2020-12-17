export const Facebook = {
	name: 'Facebook',
	short_name: 'Facebook',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/facebook.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://www.facebook.com/sharer/sharer.php',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: null,
			text: 't',
			url: 'u',
		}
	}
};

export const Twitter = {
	name: 'Twitter',
	short_name: 'Twitter',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/twitter.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://twitter.com/intent/tweet/',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: null,
			text: 'text',
			url: 'url',
		}
	}
};

export const LinkedIn = {
	name: 'LinkedIn',
	short_name: 'LinkedIn',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/linkedin.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://www.linkedin.com/shareArticle/',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: 'title',
			text: 'summary',
			url: 'url',
		}
	}
};

export const Reddit = {
	name: 'Reddit',
	short_name: 'Reddit',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/reddit.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://www.reddit.com/submit/',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: 'title',
			text: null,
			url: 'url',
		}
	}
};

export const Gmail = {
	name: 'Gmail',
	short_name: 'Gmail',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/gmail.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: 'su',
			text: 'body',
			url: null,
		}
	}
};

export const Email = {
	name: 'Email',
	short_name: 'Email',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/adwaita-icons/actions/mail-send.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'mailto:',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: 'subject',
			text: 'body',
			url: null,
		}
	}
};

export const Tumblr = {
	name: 'Tumblr',
	short_name: 'Tumblr',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/tumblr.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://www.tumblr.com/widgets/share/tool',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: 'title',
			text: null,
			url: 'canonicalUrl',
		}

	}
};

export const Telegram = {
	name: 'Telegram',
	short_name: 'Telegram',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/telegram.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://telegram.me/share/url',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: null,
			text: 'text',
			url: 'url',
		}

	}
};

export const Pinterest = {
	name: 'Pinterest',
	short_name: 'Pinterest',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/pinterest.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://www.pinterest.it/pin/create/button/',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: null,
			text: null,
			url: 'url',
		}
	}
};

export const Evernote = {
	name: 'Evernote',
	short_name: 'Evernote',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/evernote.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://www.evernote.com/clip.action',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: null,
			text: null,
			url: 'url',
		}
	}
};

export const GooglePlus = {
	name: 'Google+',
	short_name: 'Google+',
	icons: [{
		src: 'https://cdn.kernvalley.us/img/logos/google-plus.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://plus.google.com/share/',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: null,
			text: null,
			url: 'url',
		}
	}
};

export const KRVAds = {
	title: 'Kern Valleys Ads',
	short_name: 'KRV Ads',
	icons:[{
		src: 'https://cdn.kernvalley.us/img/branding/ads.kernvalley.us.svg',
		type: 'image/svg+xml',
	}],
	share_target: {
		action: 'https://ads.kernvalley.us/#text',
		method: 'GET',
		enctype: 'application/x-www-form-urlencoded',
		params: {
			title: 'label',
			text: 'description',
			url: 'url',
		}
	}
};

export function parseURL(target, url = new URL(location.href)) {
	if (! ('share_target' in target && 'action' in target.share_target && 'params' in target.share_target)) {
		throw new Error('Invalid share target');
	} else if (typeof url === 'string') {
		url = new URL(url);
	}

	const { params = { title: 'title', text: 'text', url: 'url' }} = target.share_target;

	return {
		title: url.searchParams.get(params.title),
		text: url.searchParams.get(params.text),
		url: url.searchParams.get(params.url),
	};
}

export function getShareURL(target, { title, text, url, files } = {}) {
	if (! ('share_target' in target && 'action' in target.share_target && 'params' in target.share_target)) {
		throw new Error('Invalid share target');
	} else if (Array.isArray(files) && files.length !== 0) {
		throw new Error('Sharing files is not supported');
	} else if (typeof target.method === 'string' && target.method.toLowerCase() !== 'get') {
		throw new Error(`Sharing by ${target.method} is not supported`);
	} else if (typeof text !== 'string' && typeof title !== 'string' && typeof url !== 'string') {
		throw new Error('No text, url, and title given to share');
	} else {
		if (url instanceof URL) {
			url = url.href;
		}

		const { action, params = { title: 'title', text: 'text', url: 'url' }} = target.share_target;

		const endpoint = new URL(action);

		if (typeof params.title === 'string' && typeof title === 'string') {
			endpoint.searchParams.set(params.title, title);
		}

		if (typeof params.url === 'string' && typeof url === 'string' && typeof params.text === 'string' && typeof text === 'string') {
			endpoint.searchParams.set(params.url, url);
			endpoint.searchParams.set(params.text, text);
		} else if (typeof params.text === 'string' && typeof text === 'string' && typeof url === 'string') {
			endpoint.searchParams.set(params.text, `${text} | ${url}`);
		} else if (typeof params.url === 'string' && typeof url === 'string') {
			endpoint.searchParams.set(params.url, url);
		} else if (typeof params.text === 'string' && typeof text === 'string') {
			endpoint.searchParams.set(params.text, text);
		}

		return endpoint.href;
	}
}

export const ALL_TARGETS = [Facebook, Twitter, Reddit, LinkedIn, Tumblr, Telegram, Pinterest, Gmail, Email];
