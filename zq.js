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
		return this.length !== 0;
	}

	get text() {
		return this.map(node => node.textContent);
	}

	set text(str) {
		this.each(node => node.textContent = str, true);
	}

	get html() {
		return this.map(node => node.innerHTML);
	}

	set html(html) {
		this.each(node => node.innerHTML = html, false);
	}

	toString() {
		return this.query;
	}

	item(n) {
		return this.results[n];
	}

	has(node) {
		return [...this].includes(node);
	}

	each(callback, sync = true) {
		if (sync) {
			[...this].forEach(callback);
			return this;
		} else {
			return Promise.resolve().then(() => this.each(callback, true));
		}
	}

	// forEach(...args) {
	// 	return this.each(...args);
	// }

	*values() {
		for (let item of this.results) {
			yield item;
		}
	}

	*keys() {
		for (let n = 0; n < this.length; n++) {
			yield n;
		}
	}

	*entries() {
		let n = 0;
		for (const node of this) {
			yield [n++, node];
		}
	}

	[Symbol.iterator]() {
		return this.values();
	}

	/**
	 * Note: This is for `HTMLDialogElement.prototype.show`, not the inverse
	 * of `hide`
	 */
	show() {
		this.each(node => {
			if ('show' in node) {
				node.show();
			}
		}, false);
		return this;
	}

	close() {
		this.each(node => {
			if ('close' in node) {
				node.close();
			}
		}, false);
		return this;
	}

	animate(keyframes, opts) {
		if ('animate' in Element.prototype) {
			return this.map(node => node.animate(keyframes, opts));
		} else {
			return [];
		}
	}

	some(callback) {
		return [...this].some(callback);
	}

	every(callback) {
		return [...this].every(callback);
	}

	find(callback) {
		return [...this].find(callback);
	}

	map(callback) {
		return [...this].map(callback);
	}

	addClass(cname) {
		this.each(el => el.classList.add(cname), false);
		return this;
	}

	removeClass(cname) {
		this.each(el => el.classList.remove(cname), false);
		return this;
	}

	hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}

	toggleClass(cname, force) {
		if (typeof force !== 'undefined') {
			return this.each(node => node.classList.toggle(cname, force), false);
		} else {
			return this.each(node => node.classList.toggle(cname), false);
		}
	}

	replaceClass(cname1, cname2) {
		this.each(node => node.classList.replace(cname1, cname2), false);
		return this;
	}

	pickClass(cname1, cname2, condition) {
		this.addClass(condition ? cname1 : cname2);
		return this;
	}

	remove() {
		this.each(el => el.remove(), false);
		return this;
	}

	empty(query = null) {
		if (typeof query === 'string') {
			this.each(node => [...node.children].forEach(child => {
				if (child.matches(query)) {
					child.remove();
				}
			}), false);
		} else {
			this.each(node => [...node.children].forEach(child => child.remove()), false);
		}
		return this;
	}

	hide(hidden = true, sync = true) {
		return this.each(el => el.hidden = hidden, sync);
	}

	unhide(shown = true, sync = true) {
		return this.hide(!shown, sync);
	}

	append(...nodes) {
		return this.each(el => el.append(...nodes), false);
	}

	prepend(...nodes) {
		return this.each(el => el.prepend(...nodes), false);
	}

	before(...nodes) {
		return this.each(el => el.before(...nodes), false);
	}

	after(...nodes) {
		return this.each(el => el.after(...nodes), false);
	}

	afterBegin(text) {
		return this.each(el => el.insertAdjacentHTML('afterbegin', text), false);
	}

	afterEnd(text) {
		return this.each(el => el.insertAdjacentHTML('afterend', text), false);
	}

	beforeBegin(text) {
		return this.each(el => el.insertAdjacentHTML('beforebegin', text), false);
	}

	beforeEnd(text) {
		return this.each(el => el.insertAdjacentHTML('beforeend', text), false);
	}

	hasAttribute(attr) {
		return this.some(el => el.hasAttribute(attr));
	}

	attr(attr, val) {
		if (typeof val == 'undefined' || val === true) {
			val = '';
		}
		if (val === false) {
			return this.each(el => el.removeAttribute(attr), false);
		} else {
			return this.each(el => el.setAttribute(attr, val), false);
		}
	}

	pause() {
		this.each(media => media.pause(), false);
		return this;
	}

	/*==================== Listener Functions =================================*/
	on(event, callback, ...args) {
		this.each(node => node.addEventListener(event, callback, ...args), false);
		return this;
	}

	ready(callback, ...args) {
		this.on('DOMContentLoaded', callback, ...args);
		if (document.readyState !== 'loading') {
			this.each(node => {
				callback.bind(node)(new Event('DOMContentLoaded'));
			}, false);
		}
		return this;
	}

	networkChange(callback, ...args) {
		return this.online(callback, ...args).offline(callback, ...args);
	}

	playing(callback) {
		this.each(e => e.onplay = callback, false);
		return this;
	}

	paused(callback) {
		this.each(e => e.onpause = callback, false);
		return this;
	}

	visibilitychange(callback, ...args) {
		this.each(e => {
			PREFIXES.forEach(pre => {
				e.addEventListener(`${pre}visibilitychange`, callback, ...args);
			});
		}, false);
		return this;
	}

	click(callback, ...args) {
		return this.on('click', callback, ...args);
	}

	dblclick(callback, ...args) {
		this.on('dblclick', callback, ...args);
	}

	contextmenu(callback, ...args) {
		return this.on('contextmenu', callback, ...args);
	}

	keypress(callback, ...args) {
		return this.on('keypress', callback, ...args);
	}

	keyup(callback, ...args) {
		return this.on('keyup', callback, ...args);
	}

	keydown(callback, ...args) {
		return this.on('keydown', ...args);
	}

	mouseenter(callback, ...args) {
		return this.on('mouseenter', callback, ...args);
	}

	mouseleave(callback, ...args) {
		return this.on('mouseleave', callback, ...args);
	}

	mouseover(callback, ...args) {
		return this.on('mouseover', callback, ...args);
	}

	mouseout(callback, ...args) {
		return this.on('mouseout', callback, ...args);
	}

	mousemove(callback, ...args) {
		return this.on('mousemove', callback, ...args);
	}

	mousedown(callback, ...args) {
		return this.on('mousedown', callback, ...args);
	}

	mouseup(callback, ...args) {
		return this.on('mouseup', callback, ...args);
	}

	input(callback, ...args) {
		return this.on('input', callback, ...args);
	}

	change(callback, ...args) {
		return this.on('change', callback, ...args);
	}

	submit(callback, ...args) {
		return this.on('submit', callback, ...args);
	}

	reset(callback, ...args) {
		return this.on('reset', callback, ...args);
	}

	invalid(callback, ...args) {
		return this.on('invalid', callback, ...args);
	}

	select(callback, ...args) {
		return this.on('select', callback, ...args);
	}

	focus(callback, ...args) {
		return this.on('focus', callback, ...args);
	}

	blur(callback, ...args) {
		return this.on('blur', callback, ...args);
	}

	resize(callback, ...args) {
		return this.on('resize', callback, ...args);
	}

	updateready(callback, ...args) {
		return this.on('updateready', ...args);
	}

	load(callback, ...args) {
		this.on('load', callback, ...args);
		if (document.readyState === 'complete') {
			document.dispatchEvent(new Event('load'));
		}
		return this;
	}

	unload(callback, ...args) {
		return this.on('unload', callback, ...args);
	}

	beforeunload(callback, ...args) {
		return this.on('beforeunload', callback, ...args);
	}

	abort(callback, ...args) {
		return this.on('abort', callback, ...args);
	}

	error(callback, ...args) {
		return this.on('error', callback, ...args);
	}

	scroll(callback, ...args) {
		return this.on('scroll', ...args);
	}

	drag(callback, ...args) {
		return this.on('drag', callback, ...args);
	}

	offline(callback, ...args) {
		return this.on('offline', callback, ...args);
	}

	online(callback, ...args) {
		return this.on('online', callback, ...args);
	}

	hashchange(callback, ...args) {
		return this.on('hashchange', callback, ...args);
	}

	/*visibilitychange(callback) {
		return this.on('visibilitychange', callback);
	}*/

	popstate(callback, ...args) {
		return this.on('popstate', callback, ...args);
	}

	pagehide(callback, ...args) {
		return this.on('pagehide', callback, ...args);
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
		this.each(el => watcher.observe(el, obs), false);
		return this;
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
	 */
	intersect(callback, options = {}) {
		const observer = new IntersectionObserver(callback, options);
		this.each(node => observer.observe(node), false);
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
