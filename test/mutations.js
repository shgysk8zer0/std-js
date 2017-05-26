import * as handlers from '../dataHandlers.js';
import {$} from '../functions.js';
import SchemaTemplate from '../SchemaTemplate.js';

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
		default:
			throw new Error(`Unhandled attribute change [${this.attributeName}]`);

		}
	},
	childList: function() {
		$(this.addedNodes).each(node => {
			if (node.nodeType === 1) {
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
	$('[data-show-modal]', base).click(handlers.showModal);
	$('[data-close]', base).click(handlers.close);
	$('[data-remove]', base).click(handlers.remove);
	$('[data-toggle-hidden]', base).click(handlers.toggleHidden);
	$('[data-schema-content]', base).each(importSchema);
	$('[data-social-share]', base).click(handlers.socialShare);
	$('[data-fullscreen]', base).click(handlers.fullscreen);
	$('dialog form', base).invalid(invalidForm);
}

function invalidForm(invalid) {
	console.log(invalid);
	invalid.target.closest('dialog').animate([
		{transform: 'none'},
		{transform: 'translate(-1rem, 0.2rem)'},
		{transform: 'none'},
		{transform: 'translate(1rem, -0.2rem)'}
	], {
		duration: 60,
		iterations: 5,
		direction: 'alternate'
	});
}

/**
 * Expects node to have a data-schema-content attribute containing a URL with
 * a hash / anchor of the <template> ID for template to populate and append
 */
function importSchema(node) {
	const url = new URL(node.dataset.schemaContent, location.origin);
	const template = new SchemaTemplate(url.hash.substring(1));
	const headers = new Headers();
	headers.set('Accept', 'application/json');
	url.hash = '';

	fetch(url, {
		headers,
		method: 'Get'
	}).then(resp => {
		if (resp.ok) {
			return resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}).then(json => {
		template.data = json;
		template.appendTo(node);
	}).catch(console.error);
}
