import { errorToEvent } from '../dom.js';
/**
 * @deprecated [to be removed in 3.0.0]
 * `<menu type="context">` is no longer supported in any browser
 */
if (! HTMLElement.prototype.hasOwnProperty('contextMenu')){
	Object.defineProperty(HTMLElement.prototype, 'contextMenu', {
		get: function() {
			if (this.hasAttribute('contextmenu')) {
				return document.getElementById(this.getAttribute('contextmenu'));
			} else {
				return null;
			}
		}
	});
}

/**
 * @deprecated [to be removed in 3.0.0]
 */
if (! HTMLLinkElement.prototype.hasOwnProperty('import')) {
	[...document.querySelectorAll('link[rel~="import"]')].forEach(async link => {
		link.import = null;

		try {
			const url = new URL(link.href);
			const resp = await fetch(url);

			if (resp.ok) {
				const tmp = document.createElement('template');
				tmp.innerHTML = await resp.text();
				link.import = tmp.content;
				link.dispatchEvent(new Event('load'));
			} else {
				link.dispatchEvent(errorToEvent(new Error(`<${resp.url}> [${resp.status} ${resp.statusText}]`)));
			}
		} catch(err) {
			link.dispatchEvent(errorToEvent(err));
		}
	});
}

/**
 * @deprecated [to be removed in 3.0.0]
 * Although `template.content` will work just fine, it will not
 * prevent images from loading, etc within a `<template>`
 */
if (! ('content' in document.createElement('template'))) {
	Object.defineProperty(HTMLUnknownElement.prototype, 'content', {
		get: function() {
			const frag = document.createDocumentFragment();
			for (let i = 0; i < this.childNodes.length; i++) {
				frag.appendChild(this.childNodes[i].cloneNode(true));
			}
			return frag;
		}
	});
}
