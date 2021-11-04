export const SELECTOR = '[data-share-title], [data-share-text], [data-share-url]';

export const SUPPORTED = navigator.share instanceof Function;

export function hasShareAttrs(target) {
	return target instanceof Element && target.matches(SELECTOR);
}

async function shareHandler() {
	this.disabled = true;
	const { shareTitle: title, shareText: text, shareUrl: url } = this.dataset;

	try {
		await navigator.share({ title, text, url });
	} catch(err) {
		console.error(err);
	} finally {
		this.disabled = false;
	}
}

export function shareInit(target = document.body) {
	if (typeof target === 'string') {
		target = document.querySelector(target);
	}

	if (SUPPORTED && target instanceof Element) {
		const targets = hasShareAttrs(target) ? [target] : [...target.querySelectorAll(SELECTOR)];

		targets.forEach(el => {
			el.addEventListener('click', shareHandler, { passive: true });
			el.hidden = false;
		});

		return true;
	} else {
		return false;
	}
}
