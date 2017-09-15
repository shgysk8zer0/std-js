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
	
	async forEach(...args) {
		return this.each(...args);
	}

	async has(node) {
		return [...this].includes(node);
	}

	async each(callback) {
		[...this].forEach(callback);
		return this;
	}

	/**
	 * Note: This is for `HTMLDialogElement.prototype.show`, not the inverse
	 * of `hide`
	 */
	async show() {
		return this.each(node => {
			if ('show' in node) {
				node.show();
			}
		});
	}

	async showModal() {
		return this.each(node => {
			if ('showModal' in node) {
				node.showModal();
			}
		});
	}

	async close() {
		return this.each(node => {
			if ('close' in node) {
				node.close();
			}
		});
	}

	async animate(keyframes, opts) {
		if ('animate' in Element.prototype) {
			return this.map(node => node.animate(keyframes, opts));
		} else {
			return [];
		}
	}

	async some(callback) {
		return [...this].some(callback);
	}

	async every(callback) {
		return [...this].every(callback);
	}

	async find(callback) {
		return [...this].find(callback);
	}

	async map(callback) {
		return [...this].map(callback);
	}

	async addClass(cname) {
		this.each(el => el.classList.add(cname));
		return this;
	}

	async removeClass(cname) {
		this.each(el => el.classList.remove(cname));
		return this;
	}

	async hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}

	async toggleClass(cname, force) {
		if (typeof force !== 'undefined') {
			return this.each(node => node.classList.toggle(cname, force));
		} else {
			return this.each(node => node.classList.toggle(cname));
		}
	}

	async replaceClass(cname1, cname2) {
		this.each(node => node.classList.replace(cname1, cname2));
		return this;
	}

	async pickClass(cname1, cname2, condition) {
		this.addClass(condition ? cname1 : cname2);
		return this;
	}

	async remove() {
		this.each(el => el.remove());
		return this;
	}

	async empty(query = null) {
		if (typeof query === 'string') {
			this.each(node => [...node.children].forEach(child => {
				if (child.matches(query)) {
					child.remove();
				}
			}));
		} else {
			this.each(node => [...node.children].forEach(child => child.remove()));
		}
		return this;
	}

	async hide(hidden = true) {
		return this.each(el => el.hidden = hidden);
	}

	async unhide(shown = true, sync = true) {
		return this.hide(!shown, sync);
	}

	async append(...nodes) {
		return this.each(el => el.append(...nodes));
	}

	async prepend(...nodes) {
		return this.each(el => el.prepend(...nodes));
	}

	async before(...nodes) {
		return this.each(el => el.before(...nodes));
	}

	async after(...nodes) {
		return this.each(el => el.after(...nodes));
	}

	async afterBegin(text) {
		return this.each(el => el.insertAdjacentHTML('afterbegin', text));
	}

	async afterEnd(text) {
		return this.each(el => el.insertAdjacentHTML('afterend', text));
	}

	async beforeBegin(text) {
		return this.each(el => el.insertAdjacentHTML('beforebegin', text));
	}

	async beforeEnd(text) {
		return this.each(el => el.insertAdjacentHTML('beforeend', text));
	}

	async hasAttribute(attr) {
		return this.some(el => el.hasAttribute(attr));
	}

	async attr(attr, val) {
		if (typeof val == 'undefined' || val === true) {
			val = '';
		}
		if (val === false) {
			return this.each(el => el.removeAttribute(attr));
		} else {
			return this.each(el => el.setAttribute(attr, val));
		}
	}

	async pause() {
		return this.each(media => media.pause());
	}

	/*==================== Listener Functions =================================*/
	async on(event, callback, ...args) {
		this.each(node => node.addEventListener(event, callback, ...args));
		return this;
	}

	async ready(callback, ...args) {
		this.on('DOMContentLoaded', callback, ...args);
		if (document.readyState !== 'loading') {
			this.each(node => {
				callback.bind(node)(new Event('DOMContentLoaded'));
			}, false);
		}
		return this;
	}

	async networkChange(callback, ...args) {
		return this.online(callback, ...args).offline(callback, ...args);
	}

	async playing(callback) {
		return this.each(e => e.onplay = callback);
	}

	async paused(callback) {
		this.each(e => e.onpause = callback, false);
		return this;
	}

	async visibilitychange(callback, ...args) {
		this.each(e => {
			PREFIXES.forEach(pre => {
				e.addEventListener(`${pre}visibilitychange`, callback, ...args);
			});
		}, false);
		return this;
	}

	async click(callback, ...args) {
		return this.on('click', callback, ...args);
	}

	async dblclick(callback, ...args) {
		this.on('dblclick', callback, ...args);
	}

	async contextmenu(callback, ...args) {
		return this.on('contextmenu', callback, ...args);
	}

	async keypress(callback, ...args) {
		return this.on('keypress', callback, ...args);
	}

	async keyup(callback, ...args) {
		return this.on('keyup', callback, ...args);
	}

	async keydown(callback, ...args) {
		return this.on('keydown', ...args);
	}

	async mouseenter(callback, ...args) {
		return this.on('mouseenter', callback, ...args);
	}

	async mouseleave(callback, ...args) {
		return this.on('mouseleave', callback, ...args);
	}

	async mouseover(callback, ...args) {
		return this.on('mouseover', callback, ...args);
	}

	async mouseout(callback, ...args) {
		return this.on('mouseout', callback, ...args);
	}

	async mousemove(callback, ...args) {
		return this.on('mousemove', callback, ...args);
	}

	async mousedown(callback, ...args) {
		return this.on('mousedown', callback, ...args);
	}

	async mouseup(callback, ...args) {
		return this.on('mouseup', callback, ...args);
	}

	async input(callback, ...args) {
		return this.on('input', callback, ...args);
	}

	async change(callback, ...args) {
		return this.on('change', callback, ...args);
	}

	async submit(callback, ...args) {
		return this.on('submit', callback, ...args);
	}

	async reset(callback, ...args) {
		return this.on('reset', callback, ...args);
	}

	async invalid(callback, ...args) {
		return this.on('invalid', callback, ...args);
	}

	async select(callback, ...args) {
		return this.on('select', callback, ...args);
	}

	async focus(callback, ...args) {
		return this.on('focus', callback, ...args);
	}

	async blur(callback, ...args) {
		return this.on('blur', callback, ...args);
	}

	async resize(callback, ...args) {
		return this.on('resize', callback, ...args);
	}

	async updateready(callback, ...args) {
		return this.on('updateready', ...args);
	}

	async load(callback, ...args) {
		this.on('load', callback, ...args);
		if (document.readyState === 'complete') {
			document.dispatchEvent(new Event('load'));
		}
		return this;
	}

	async unload(callback, ...args) {
		return this.on('unload', callback, ...args);
	}

	async beforeunload(callback, ...args) {
		return this.on('beforeunload', callback, ...args);
	}

	async abort(callback, ...args) {
		return this.on('abort', callback, ...args);
	}

	async error(callback, ...args) {
		return this.on('error', callback, ...args);
	}

	async scroll(callback, ...args) {
		return this.on('scroll', ...args);
	}

	async drag(callback, ...args) {
		return this.on('drag', callback, ...args);
	}

	async offline(callback, ...args) {
		return this.on('offline', callback, ...args);
	}

	async online(callback, ...args) {
		return this.on('online', callback, ...args);
	}

	async hashchange(callback, ...args) {
		return this.on('hashchange', callback, ...args);
	}

	/*visibilitychange(callback) {
		return this.on('visibilitychange', callback);
	}*/

	async popstate(callback, ...args) {
		return this.on('popstate', callback, ...args);
	}

	async pagehide(callback, ...args) {
		return this.on('pagehide', callback, ...args);
	}

	async watch(watching, options = [], attributeFilter = []) {
		/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
		const watcher = new MutationObserver(mutations => {
			mutations.forEach(mutation => watching[mutation.type].call(mutation));
		});
		const obs = Object.keys(watching).concat(options).reduce((watch, event) => {
			watch[event] = true;
			return watch;
		}, {attributeFilter});
		return this.each(el => watcher.observe(el, obs));
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
	 */
	async intersect(callback, options = {}) {
		const observer = new IntersectionObserver(callback, options);
		return this.each(node => observer.observe(node));
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
