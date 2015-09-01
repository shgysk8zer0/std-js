class SocialShare {
	static getFacebook(href = location.href) {
		let url = new URL('https://www.facebook.com/sharer/sharer.php');
		url.searchParams.set('u', href);
		return url;
	}
	static getTwitter(href = location.href, text = '', via = null, hashtags = []) {
		let url = new URL('https://twitter.com/intent/tweet');
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
		let url = new URL('https://plus.google.com/share');
		url.searchParams.set('url', href);
		return url;
	}
	static getLinkedIn(href = location.href, title = document.title, summary ='', mini = 'true') {
		let url = new URL('https://www.linkedin.com/shareArticle');
		url.searchParams.set('mini', mini);
		url.searchParams.set('url', href);
		url.searchParams.set('title', title);
		url.searchParams.set('summary', summary);
		return url;
	}
	static getPintrest(href = location.href, media = null, description = '', hashtags = []) {
		let url = new URL('https://www.pinterest.com/pin/create/button/');
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
		let url = new URL('http://www.reddit.com/submit/');
		url.searchParams.set('url', href);
		return url;
	}
	static openPopup(url, title = '', height = 600, width = 600, left = 0, top = 0) {
		return window.open(
			url,
			title,
			`menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=${width},height=${height},left=${left},top=${top}`
		);
	}
}
