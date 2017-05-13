import SchemaNode from './SchemaNode.js';

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
		if (
			data.hasOwnProperty('@type')
			&& data.hasOwnProperty('@context')
			&& this.itemtype === `${new URL(data['@type'], data['@context'])}`
		) {
			for (let [prop, node] of this.entries()) {
				if (! data.hasOwnProperty(prop)) {
					node.remove();
				} else if (typeof data[prop] === 'object') {
					if (node.dataset.hasOwnProperty('schemaTemplate')) {
						try {
							let template = new SchemaTemplate(node.dataset.schemaTemplate);
							template.itemprop = prop;
							template.itemscope = '';
							template.data = data[prop];
							node.parentElement.replaceChild(template, node.node);
						} catch (e) {
							console.error(e);
							node.remove();
						}
					} else {
						console.error(`Missing data-template attribute for ${data[prop]['@type']}`);
						node.remove();
					}
				} else if(node.hasAttribute('src')) {
					node.setAttribute('src', data[prop]);
				} else if (node.hasAttribute('content')) {
					node.setAttribute('content', data[prop]);
				} else {
					node.html = data[prop];
				}
			}
		} else {
			throw new Error('Invalid or missing @type / @context for SchemaTemplate');
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
		console.log({
			template: this,
			attr, val
		});
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
