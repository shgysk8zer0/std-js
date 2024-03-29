import * as handlers from './dataHandlers.js';
import { $ } from './functions.js';
import { clickHandler } from './actions.js';
import { createHTML } from './trust.js';
let observer = null;

if (IntersectionObserver instanceof Function) {
	observer = new IntersectionObserver(lazyLoad, {rootMargin: '500px 0px 0px 0px'});
}

async function infiniteScroll({ target, isIntersecting }, observer) {
	if (isIntersecting) {
		const url = new URL(target.dataset.infiniteScroll, location.origin);

		try {
			const resp = await fetch(url);

			if (url.searchParams.has('page')) {
				url.searchParams.set('page', parseInt(url.searchParams.get('page')) + 1);
				target.dataset.infiniteScroll = url;
			}

			if (resp.ok) {
				const parser = new DOMParser();
				const html = await resp.text();
				const doc = parser.parseFromString(createHTML(html), 'text/html');
				const frag = document.createDocumentFragment();
				frag.append(...doc.body.children);
				target.before(frag);
			} else {
				throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
			}
		} catch (error) {
			console.error(error);
			observer.observe(target);
		}
	}
}

function lazyLoad(entries, observer) {
	entries.filter(entry => entry.isIntersecting).forEach(async entry => {
		try {
			const url = new URL(entry.target.dataset.loadFrom, location.href);
			const resp = await fetch(url);
			if (resp.ok) {
				const parser = new DOMParser();
				const html = await resp.text();
				const content =  parser.parseFromString(createHTML(html), 'text/html');
				entry.target.append(...content.body.childNodes);
			} else {
				throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
			}
		} catch (error) {
			console.error(error);
		} finally {
			observer.unobserve(entry.target);
			delete entry.target.dataset.loadFrom;
		}
	});
}

function toggleDetails() {
	const details = this.closest('details');
	details.open != details.open;
}

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
			case 'data-share':
				if (this.target.dataset.hasOwnProperty('share')) {
					this.target.addEventListener('click', handlers.share);
				} else {
					this.target.removeEventListener('click', handlers.share);
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
			case 'data-click':
				clickHandler(this.target);
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
	'data-share',
	'data-fullscreen',
	'data-click',
	'data-copy',
];

export const options = [
	'subtree',
	'attributeOldValue'
];

export function init(base = document.body) {
	$('[data-show]', base).click(handlers.show);
	$('[data-show-modal]', base).click(handlers.showModal);
	$('[data-close]', base).click(handlers.close);
	$('[data-remove]', base).click(handlers.remove);
	$('[data-toggle-hidden]', base).click(handlers.toggleHidden);
	// $('[data-schema-content]', base).each(importSchema);
	$('[data-share]', base).click(handlers.share);
	$('[data-fullscreen]', base).click(handlers.fullscreen);
	$('[data-scroll-to]', base).click(handlers.scrollTo);
	$('[data-click]', base).each(el => clickHandler(el));
	$('[data-copy]').click(handlers.copy);

	if (document.createElement('dialog') instanceof HTMLUnknownElement) {
		$('dialog form[method="dialog"]', base).submit(event => {
			event.preventDefault();
		}).then($forms => {
			[...$forms].forEach(form => {
				$('[type="submit"], button:not([type])', form).click(event => {
					event.target.closest('dialog').close(event.target.value);
				});
			});
		});
	}

	if (IntersectionObserver instanceof Function) {
		$('[data-infinite-scroll]', base).intersect(infiniteScroll);
		$('[data-load-from]', base).each(node => observer.observe(node));
	}

	if (document.createElement('details') instanceof HTMLUnknownElement) {
		$('details > summary').click(toggleDetails);
	}
}
