import { each } from './dom.js';
import { listen } from './events.js';
import { createPublicShareIcon } from './icons.js';
import { createElement } from './elements.js';

export const supported = navigator.share instanceof Function;
export const selector = 'button[data-share-title], button[data-share-text], button[data-share-url]';

export async function shareHandler({ currentTarget }) {
	const { shareTitle: title, shareText: text, shareUrl: url } = currentTarget.dataset;
	await navigator.share({ title, text, url });
}

export function shareInit({ base = document, signal, event = 'click', once = false } = {}) {
	if (supported) {
		each(selector, el => {
			listen(el, event, shareHandler, { signal, once });
			el.disabled = false;
			el.hidden = false;
		}, { base });
	} else {
		each(selector, el => el.disabled = true, { base });
	}
}

export function createShareButton({
	title: shareTitle = document.title,
	url: shareUrl = location.href,
	text: shareText,
	classList = ['btn', 'btn-primary'],
	iconSize: size = 20,
	part,
	slot,
	signal,
} = {}) {
	return createElement('button', {
		type: 'button',
		classList, slot, part,
		disabled: ! supported,
		dataset: { shareTitle, shareUrl, shareText },
		events: { click: shareHandler, signal },
		children: [createPublicShareIcon({ size, fill: 'currentColor' })],
	});
}
