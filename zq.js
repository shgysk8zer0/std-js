const PREFIXES = [
	'',
	'moz',
	'webkit',
	'ms'
];

/*============================ zQ Functions =======================*/
export default class zQ {
	constructor(selector, parent = document) {
		this.results = [];
		this.filters = [];
		try {
			if (typeof selector === 'string') {
				this.results = Array.from(parent.querySelectorAll(selector));
				if (parent instanceof HTMLElement && parent.matches(selector)) {
					this.results.push(parent);
				}
			} else if (selector instanceof NodeList || selector instanceof HTMLCollection) {
				this.results = Array.from(selector);
			} else if (typeof selector === 'object') {
				this.results = [selector];
			} else {
				throw new TypeError(`Expected a string or Nodelist but got a ${typeof selector}: ${selector}.`);
			}
			this.query = selector || ':root';
		} catch (error) {
			console.error(error);
		}
	}

	get length() {
		return this.results.length;
	}

	get found() {
		return this.results.length !== 0;
	}

	get text() {
		return this.results.map(node => node.textContent);
	}

	set text(str) {
		this.results.forEach(node => node.textContent = str);
	}

	get html() {
		return this.results.map(node => node.innerHTML);
	}

	set html(html) {
		this.results.forEach(node => node.innerHTML = html);
	}

	toString() {
		return this.query;
	}

	item(n) {
		return this.results[n];
	}

	has(node) {
		return this.results.includes(node);
	}

	each(...args) {
		this.results.forEach(...args);
		return this;
	}

	forEach(...args) {
		this.results.forEach(...args);
		return this;
	}

	*values() {
		const len = this.results.length;
		for(let i = 0; i < len; i++) {
			yield this.results[i];
		}
	}

	/**
	 * Note: This is for `HTMLDialogElement.prototype.show`, not the inverse
	 * of `hide`
	 */
	show() {
		this.results.forEach(node => {
			if ('show' in node) {
				node.show();
			}
		});
		return this;
	}

	close() {
		this.results.forEach(node => {
			if ('close' in node) {
				node.close();
			}
		});
		return this;
	}

	animate(keyframes, opts) {
		if ('animate' in Element.prototype) {
			return this.results.map(node => node.animate(keyframes, opts));
		} else {
			return [];
		}
	}

	indexOf(i) {
		return this.results.indexOf(i);
	}

	some(callback) {
		return this.results.some(callback);
	}

	every(callback) {
		return this.results.every(callback);
	}

	filter(callback) {
		this.filters.push(callback.toString());
		this.results = this.results.filter(callback);
		return this;
	}

	map(callback) {
		return this.results.map(callback);
	}
	/* *getResults() {
		for (let result of this.results) {
			yield result;
		}
	}*/

	addClass(cname) {
		this.results.forEach(el => el.classList.add(cname));
		return this;
	}

	removeClass(cname) {
		this.results.forEach(el => el.classList.remove(cname));
		return this;
	}

	hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}

	toggleClass(cname, force) {
		if (typeof force !== 'undefined') {
			this.results.forEach(node => node.classList.toggle(cname, force));
		} else {
			this.results.forEach(node => node.classList.toggle(cname));
		}
		return this;
	}

	replaceClass(cname1, cname2) {
		this.results.forEach(node => node.classList.replace(cname1, cname2));
		return this;
	}

	pickClass(cname1, cname2, condition) {
		(condition) ? this.addClass(cname1) : this.addClass(cname2);
		return this;
	}

	remove() {
		this.results.forEach(el => el.remove());
		return this;
	}

	hide(hidden = true) {
		this.results.forEach(el => el.hidden = hidden);
		return this;
	}

	unhide(shown = true) {
		return this.hide(!shown);
	}

	append(...nodes) {
		this.results.forEach(el => el.append(...nodes));
		return this;
	}

	prepend(...nodes) {
		this.results.forEach(el => el.prepend(...nodes));
	}

	before(...nodes) {
		this.results.forEach(el => el.before(...nodes));
	}

	after(...nodes) {
		this.results.forEach(el => el.after(...nodes));
	}

	afterBegin(text) {
		this.results.forEach(el => el.insertAdjacentHTML('afterbegin', text));
		return this;
	}

	afterEnd(text) {
		this.results.forEach(el => el.insertAdjacentHTML('afterend', text));
		return this;
	}

	beforeBegin(text) {
		this.results.forEach(el => el.insertAdjacentHTML('beforebegin', text));
		return this;
	}

	beforeEnd(text) {
		this.results.forEach(el => el.insertAdjacentHTML('beforeend', text));
		return this;
	}

	hasAttribute(attr) {
		return this.results.some(el => el.hasAttribute(attr));
	}

	attr(attr, val) {
		if (typeof val == 'undefined' || val === true) {
			val = '';
		}
		if (val === false) {
			this.each(el => el.removeAttribute(attr));
		} else {
			this.each(el => el.setAttribute(attr, val));
		}
		return this;
	}

	pause() {
		this.results.forEach(media => media.pause());
		return this;
	}

	/*==================== Listener Functions =================================*/
	on(event, callback, useCapture = false, options = false) {
		this.each(node => node.addEventListener(event, callback, useCapture, options));
		return this;
	}

	ready(callback, options = false) {
		this.on('DOMContentLoaded', callback, options);
		if (document.readyState !== 'loading') {
			this.results.forEach(node => {
				callback.bind(node)(new Event('DOMContentLoaded'));
			});
		}
		return this;
	}

	networkChange(callback, options = false) {
		return this.online(callback, options).offline(callback, options);
	}

	playing(callback) {
		this.results.forEach(e => e.onplay = callback);
		return this;
	}

	paused(callback) {
		this.results.forEach(e => e.onpause = callback);
		return this;
	}

	visibilitychange(callback, options = false) {
		this.results.forEach(e => {
			PREFIXES.forEach(pre => {
				e.addEventListener(`${pre}visibilitychange`, callback, options);
			});
		});
		return this;
	}

	click(callback, options = false) {
		return this.on('click', callback, options);
	}

	dblclick(callback, options = false) {
		this.on('dblclick', callback, options);
	}

	contextmenu(callback, options = false) {
		return this.on('contextmenu', callback, options);
	}

	keypress(callback, options = false) {
		return this.on('keypress', callback, options);
	}

	keyup(callback, options = false) {
		return this.on('keyup', callback, options);
	}

	keydown(callback, options = false) {
		return this.on('keydown', callback, options);
	}

	mouseenter(callback, options = false) {
		return this.on('mouseenter', callback, options);
	}

	mouseleave(callback, options = false) {
		return this.on('mouseleave', callback, options);
	}

	mouseover(callback, options = false) {
		return this.on('mouseover', callback, options);
	}

	mouseout(callback, options = false) {
		return this.on('mouseout', callback, options);
	}

	mousemove(callback, options = false) {
		return this.on('mousemove', callback, options);
	}

	mousedown(callback, options = false) {
		return this.on('mousedown', callback, options);
	}

	mouseup(callback, options = false) {
		return this.on('mouseup', callback, options);
	}

	input(callback, options = false) {
		return this.on('input', callback, options);
	}

	change(callback, options = false) {
		return this.on('change', callback, options);
	}

	submit(callback, options = false) {
		return this.on('submit', callback, options);
	}

	reset(callback, options = false) {
		return this.on('reset', callback, options);
	}

	invalid(callback, options = false) {
		return this.on('invalid', callback, options);
	}

	select(callback, options = false) {
		return this.on('select', callback, options);
	}

	focus(callback, options = false) {
		return this.on('focus', callback, options);
	}

	blur(callback, options = false) {
		return this.on('blur', callback, options);
	}

	resize(callback, options = false) {
		return this.on('resize', callback, options);
	}

	updateready(callback, options = false) {
		return this.on('updateready', callback, options);
	}

	load(callback, options = {once: true}) {
		this.on('load', callback, options);
		if (document.readyState === 'complete') {
			document.dispatchEvent(new Event('load'));
		}
		return this;
	}

	unload(callback, options = false) {
		return this.on('unload', callback, options);
	}

	beforeunload(callback, options = false) {
		return this.on('beforeunload', callback, options);
	}

	abort(callback, options = false) {
		return this.on('abort', callback, options);
	}

	error(callback, options = false) {
		return this.on('error', callback, options);
	}

	scroll(callback, options = false) {
		return this.on('scroll', callback, options);
	}

	drag(callback, options = false) {
		return this.on('drag', callback, options);
	}

	offline(callback, options = false) {
		return this.on('offline', callback, options);
	}

	online(callback, options = false) {
		return this.on('online', callback, options);
	}

	hashchange(callback, options = false) {
		return this.on('hashchange', callback, options);
	}

	/*visibilitychange(callback) {
		return this.on('visibilitychange', callback);
	}*/

	popstate(callback, options = false) {
		return this.on('popstate', callback, options);
	}

	pagehide(callback, options = false) {
		return this.on('pagehide', callback, options);
	}

	watch(watching, options = [], attributeFilter = []) {
		/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
		const watcher = new MutationObserver(mutations => {
			mutations.forEach(mutation => watching[mutation.type].call(mutation));
		});
		const obs = Object.keys(watching).concat(options).reduce((watch, event) => {
			watch[event] = true;
			return watch;
		}, {attributeFilter});
		this.results.forEach(el => watcher.observe(el, obs));
		return this;
	}

	/*========================================================================*/
	$(selector) {
		return new zQ(this.query.split(',').map(
			str => selector.split(',').map(
				q => `${str.trim()} ${q.trim()}`
			)
		)).join(', ');
	}

	css(args) {
		var style = document.styleSheets[document.styleSheets.length - 1];
		style.insertRule(`${this.query} {${args}}`, style.cssRules.length);
		return this;
	}
}
