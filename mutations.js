import * as handlers from './dataHandlers.js';
import {$} from './functions.js';

// function lazyLoad(entries, observer) {
// 	entries.filter(entry => entry.isIntersecting).forEach(async (entry) => {
// 		try {
// 			const url = new URL(entry.target.dataset.loadFrom, location.href);
// 			const resp = await fetch(url);
// 			if (resp.ok) {
// 				const parser = new DOMParser();
// 				const html = await resp.text();
// 				const content =  parser.parseFromString(html, 'text/html');
// 				entry.target.append(...content.body.childNodes);
// 			} else {
// 				throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
// 			}
// 		} catch (error) {
// 			console.error(error);
// 		} finally {
// 			observer.unobserve(entry.target);
// 			delete entry.target.dataset.loadFrom;
// 		}
// 	});
// }

export const events = {
	attributes: function() {
		switch(this.attributeName) {
		case 'data-remove':
			if (this.target.dataset.hasOwnProperty('remove')) {
				this.target.addEventListener('click', handlers.remove);
			} else {
				this.target.removeEventListener('click', handlers.remove);
			}
			break;
		case 'data-show-modal':
			if (this.target.dataset.hasOwnProperty('showModal')) {
				this.target.addEventListener('click', handlers.showModal);
			} else {
				this.target.removeEventListener('click', handlers.showModal);
			}
			break;
		case 'data-show':
			if (this.target.dataset.hasOwnProperty('show')) {
				this.target.addEventListener('click', handlers.show);
			} else{
				this.target.removeEventListener('click', handlers.show);
			}
			break;
		case 'data-close':
			if (this.target.dataset.hasOwnProperty('close')) {
				this.target.addEventListener('click', handlers.close);
			} else {
				this.target.removeEventListener('click', handlers.close);
			}
			break;
		case 'data-toggle-hidden':
			if (this.target.dataset.hasOwnProperty('toggleHidden')) {
				this.target.addEventListener('click', handlers.toggleHidden);
			} else {
				this.target.removeEventListener('click', handlers.toggleHidden);
			}
			break;
		case 'data-social-share':
			if (this.target.dataset.hasOwnProperty('socialShare')) {
				this.target.addEventListener('click', handlers.socialShare);
			} else {
				this.target.removeEventListener('click', handlers.socialShare);
			}
			break;
		case 'data-fullscreen':
			if (this.target.dataset.hasOwnProperty('fullscreen')) {
				this.target.addEventListener('click', handlers.fullscreen);
			} else {
				this.target.removeEventListener('click', handlers.fullscreen);
			}
			break;
		case 'data-scroll-to':
			if (this.target.dataset.hasOwnProperty('scrollTo')) {
				this.target.addEventListener('click', handlers.scrollTo);
			} else {
				this.target.removeEventListener('click', handlers.scrollTo);
			}
			break;
		default:
			throw new Error(`Unhandled attribute change [${this.attributeName}]`);

		}
	},
	childList: function() {
		$(this.addedNodes).each(node => {
			if (node.nodeType === Node.ELEMENT_NODE) {
				init(node);
			}
		});
	}
};
export const filter = [
	'data-remove',
	'data-show-modal',
	'data-show',
	'data-close',
	'data-toggle-hidden',
	'data-social-share',
	'data-fullscreen',
];

export const options = [
	'subtree',
	'attributeOldValue'
];

export function init(base = document.body) {
	// const observer = new IntersectionObserver(lazyLoad, {rootMargin: '500px 0px 0px 0px'});
	$('[data-show]', base).click(handlers.show);
	$('[data-show-modal]', base).click(handlers.showModal);
	$('[data-close]', base).click(handlers.close);
	$('[data-remove]', base).click(handlers.remove);
	$('[data-toggle-hidden]', base).click(handlers.toggleHidden);
	// $('[data-schema-content]', base).each(importSchema);
	$('[data-social-share]', base).click(handlers.socialShare);
	$('[data-fullscreen]', base).click(handlers.fullscreen);
	$('[data-scroll-to]', base).click(handlers.scrollTo);
	// $('[data-load-from]', base).each(node => observer.observe(node));
}
