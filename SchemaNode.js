export default class SchemaNode {
	constructor(node) {
		this.node = node;
	}

	toString() {
		return this.node.outerHTML;
	}

	get text() {
		return this.node.textContent;
	}

	set text(str) {
		this.node.textContent = str;
	}

	get html() {
		return this.node.innerHTML;
	}

	set html(html) {
		this.node.innerHTML = html;
	}

	get itemprop() {
		return this.getAttribute('itemprop');
	}

	set itemprop(value) {
		this.setAttribute('itemprop', value);
	}

	set value(value) {
		if (this.hasAttribute('content')) {
			this.setAttribute('content', value);
		} else {
			this.html = value;
		}
	}

	get classList() {
		return this.node.classList;
	}

	get dataset() {
		return this.node.dataset;
	}

	get parentElement() {
		return this.node.parentElement;
	}

	remove() {
		this.node.remove();
	}

	hasAttribute(attr) {
		return this.node.hasAttribute(attr);
	}

	setAttribute(attr, val) {
		this.node.setAttribute(attr, val);
	}

	getAttribute(attr) {
		return this.node.getAttribute(attr);
	}

	removeAttribute(attr) {
		this.node.removeAttribute(attr);
	}

	appendTo(node) {
		node.appendChild(this.node);
	}

	replace(node) {
		node.parentElement.replaceChild(this.node, node);
	}
}
