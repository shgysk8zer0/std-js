import SchemaNode from './SchemaNode.js';
import SchemaData from './SchemaData.js';

const SCHEMA_ATTRS = [
	'itemtype',
	'itemprop',
	'itemscope'
];

export default class SchemaTemplate extends DocumentFragment {
	constructor(templateId) {
		super();
		let template = document.getElementById(templateId);
		if (! (template instanceof HTMLElement)) {
			throw new Error(`Template "${templateId}" not found.`);
		}
		this.appendChild(template.content.cloneNode(true));
	}

	toString() {
		return this.firstElementChild.outerHTML;
	}

	get itemtype() {
		return this.getAttribute('itemtype');
	}

	get itemprop() {
		return this.getAttribute('itemprop');
	}

	set itemprop(itemprop) {
		this.setAttribute('itemprop', itemprop);
	}

	get itemscope() {
		return this.getAttribute('itemscope');
	}

	set itemscope(value) {
		this.setAttribute('itemscope', value);
	}

	set data(data) {
		let thing = new SchemaData(data);
		if (thing.itemtype !== this.itemtype) {
			throw new Error(`Template has itemtype of ${this.itemtype} but required ${thing.itemtype}`);
		}
		for (let [prop, node] of this.entries()) {
			if (! thing.has(prop)) {
				node.remove();
			} else if (typeof thing.get(prop) === 'object') {
				if (node.dataset.hasOwnProperty('schemaTemplate')) {
					try {
						let template = new SchemaTemplate(node.dataset.schemaTemplate);
						template.itemprop = prop;
						template.itemscope = '';
						template.data = thing.get(prop);
						node.parentElement.replaceChild(template, node.node);
					} catch (e) {
						console.error(e);
						node.remove();
					}
				} else {
					console.error(`Missing data-template attribute for ${thing.type}`);
					node.remove();
				}
			} else if (node.hasAttribute('href')) {
				node.setAttribute('href', thing.get(prop));
			} else if(node.hasAttribute('src')) {
				node.setAttribute('src', thing.get(prop));
			} else if (node.hasAttribute('content')) {
				node.setAttribute('content', thing.get(prop));
			} else {
				node.html = thing.get(prop);
			}
		}
	}

	get classList() {
		return this.firstElementChild.classList;
	}

	get dataset() {
		return this.firstElementChild.dataset;
	}

	appendTo(node) {
		this.itemscope = this.itemscope || '';
		node.appendChild(node.ownerDocument.importNode(this.firstElementChild, true));
	}

	hasAttribute(attr) {
		return this.firstElementChild.hasAttribute(attr);
	}

	getAttribute(attr) {
		return this.firstElementChild.getAttribute(attr);
	}

	setAttribute(attr, val) {
		this.firstElementChild.setAttribute(attr, val);
	}

	removeAttribute(attr) {
		this.firstElementChild.removeAttribute(attr);
	}

	has(prop) {
		return this.firstElementChild.querySelector(`[itemprop="${prop}"]`) instanceof HTMLElement;
	}

	find(prop) {
		return new SchemaNode(this.firstElementChild.querySelector(`[itemprop="${prop}"]`));
	}

	removeMicrodata() {
		SCHEMA_ATTRS.forEach(attr => {
			this.removeAttribute(attr);
			this.querySelectorAll(`[${attr}]`).forEach(node => {
				node.removeAttribute(attr);
			});
		});
	}

	*keys() {
		const nodes = this.firstElementChild.querySelectorAll('[itemprop]');
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			yield nodes.item(i).getAttribute('itemprop');
		}
	}

	*values() {
		const nodes = this.firstElementChild.querySelectorAll('[itemprop]');
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			yield new SchemaNode(nodes.item(i));
		}
	}

	*entries() {
		for (let node of this.values()) {
			yield [node.itemprop, node];
		}
	}
}
