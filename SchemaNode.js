export default class SchemaNode {
	constructor(node) {
		this.node = node;
	}

	replaceWith(...nodes) {
		this.node.replaceWith(...nodes);
	}

	before(...nodes) {
		this.node.before(...nodes);
	}

	after(...nodes) {
		this.node.after(...nodes);
	}

	append(...nodes) {
		this.node.append(...nodes);
	}

	prepend(...nodes) {
		this.node.prepend(...nodes);
	}

	toString() {
		return this.node.outerHTML;
	}

	hasChildNodes() {
		return this.node.hasChildNodes();
	}

	get textContent() {
		return this.node.textContent;
	}

	get innerHTML() {
		return this.node.innerHTML;
	}

	get outerHTML() {
		return this.node.outerHTML;
	}

	set textContent(text) {
		this.node.textContent = text;
	}

	set innerHTML(html) {
		this.node.innerHTML = html;
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

	get children() {
		return this.node.children;
	}

	get childNodes() {
		return this.node.childNodes;
	}

	get title() {
		return this.node.title;
	}

	set title(text) {
		this.node.title = text;
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
