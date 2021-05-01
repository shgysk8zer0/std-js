import { read, isInViewport } from './functions.js';
import { onAnimationFrame } from './promises.js';
import { debounce } from './events.js';
import { get as getLocation } from './geo.js';
import {
	attr, toggleAttr, css, data, addClass, removeClass, toggleClass,
	replaceClass, text, html, on, off, animate, ready, loaded, intersect,
} from './dom.js';
import { mediaQuery } from './media-queries.js';
import { GET, POST, DELETE, getHTML, getJSON, postHTML, postJSON, getText, postText } from './http.js';

const PREFIXES = [
	'',
	'moz',
	'webkit',
	'ms'
];

/*============================ esQuery Functions =======================*/
export default class esQuery extends Set {
	constructor(what, base = document) {
		if (what instanceof EventTarget) {
			super([what]);
		} else if (Array.isArray(what)) {
			super(what);
		} else if (typeof what === 'string') {
			const matches = super(base.querySelectorAll(what));

			if (base.matches instanceof Function && base.matches(what)) {
				matches.add(base);
			}
		} else if (typeof what === 'object' && what[Symbol.iterator] instanceof Function) {
			super(what);
		} else {
			throw new TypeError('Invalid "what" given to esQuery() constructor');
		}
	}

	get parents() {
		return new esQuery(this.toArray().map(item => item.parentElement).flat());
	}

	get children() {
		return new esQuery(this.toArray().map(el => [...el.children]).flat());
	}

	get found() {
		return this.size !== 0;
	}

	get first() {
		return new esQuery(this.toArray().shift());
	}

	get last() {
		return new esQuery(this.toArray().pop());
	}

	item(num) {
		if (this.size > num) {
			return new esQuery(this.toArray()[num]);
		} else {
			return undefined;
		}
	}

	toArray() {
		return [...this];
	}

	*toGenerator() {
		for (const node of this) {
			yield node;
		}
	}

	async text(str) {
		await text(this, str);
		return this;
	}

	async html(HTML) {
		await html(this, HTML);
		return this;
	}

	async replaceText(replacements = {}) {
		this.each(node => {
			Object.entries(replacements).forEach(([from, to]) => {
				node.textContent = node.textContent.replace(from, to);
			});
		});

		return this;
	}

	async visible(any = false) {
		if (any) {
			return this.some(isInViewport);
		} else {
			return this.every(isInViewport);
		}
	}

	async each(callback, thisArg = this) {
		let n = 0;
		this.forEach(el => callback.call(thisArg, el, n++));
		return this;
	}

	/**
	 * Note: This is for `HTMLDialogElement.prototype.show`, not the inverse
	 * of `hide`
	 */
	async show() {
		this.forEach(node => {
			if ('show' in node) {
				node.show();
			}
		});
		return this;
	}

	async showModal() {
		this.forEach(node => {
			if ('showModal' in node) {
				node.showModal();
			}
		});
		return this;
	}

	async close() {
		this.forEach(node => {
			if ('close' in node) {
				node.close();
			}
		});
		return this;
	}

	async closest(selector) {
		return new esQuery(this.toArray().map(el => el.closest(selector)));
	}

	async matches(selector, some = false) {
		if (some) {
			return this.some(el => el.matches(selector));
		} else {
			return this.every(el => el.matches(selector));
		}
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async import(selector = 'body > *') {
		console.warn('`esQuery.import()` is deprecated and will be removed');
		const imports = this.toArray().filter(node => node.tagName === 'LINK'
			&& node.relList.contains('import'));
		const docs = await Promise.all(imports.map(link => {
			return new Promise((resolve, reject) => {
				if (link.import instanceof Document) {
					resolve(link.import);
				} else {
					link.addEventListener('load', event => {
						resolve(event.target.import);
					}, {
						once: true,
						passive: true,
					});
					link.addEventListener('error', event => reject(event), {
						once: true,
						passive: true,
					});
				}
			});
		}));

		return docs.reduce((frag, doc) => {
			new esQuery(selector, doc).forEach(child => frag.appendChild(child));
			return frag;
		}, document.createDocumentFragment());
	}

	async animate(keyframes, opts = { duration: 400 }) {
		if (Element.prototype.animate instanceof Function) {
			await Promise.all(animate(this, keyframes, opts).map(anim => anim.finished));
			return this;
		} else {
			return this;
		}
	}

	async getAnimations() {
		let anims = [];
		this.forEach(el => {
			const elAnims = el.getAnimations();
			anims = anims.concat(elAnims);
		});
		return anims;
	}

	async playAnimations(...ids) {
		let anims = await this.getAnimations();
		anims.filter(anim => ids.includes(anim.id)).forEach(anim => anim.play());
		return this;
	}

	async pauseAnimations(...ids) {
		let anims = await this.getAnimations();
		anims.filter(anim => ids.includes(anim.id)).forEach(anim => anim.pause());
		return this;
	}

	async cancelAnimations(...ids) {
		const anims = await this.getAnimations();
		anims.filter(anim => ids.includes(anim.id)).forEach(anim => anim.cancel());
		return this;
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async animateFilter({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 'none',
		to = 'none',
		id = 'grayscale',
	} = {}) {
		console.warn('`esQuery.animateFilter()` is deprecated and will be removed');
		return this.animate([
			{ filter: `${from}` },
			{ filter: `${to}` },
		], {
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterDropShadow({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = '0 0 0 black',
		to = '0.5em 0.5em 0.5em rgba(0,0,0,0.3)',
		id = 'drop-shadow',
	} = {}) {
		console.warn('`esQuery.anifilterDropShadow()` is deprecated and will be removed');
		return this.animate([
			{ filter: `drop-shadow(${from})` },
			{ filter: `drop-shadow(${to})` },
		], {
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterGrayscale({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'grayscale',
	} = {}) {
		console.warn('`esQuery.filterGrayScale()` is deprecated and will be removed');
		return this.animateFilter({
			from: `grayscale(${from})`,
			to: `grayscale(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterBlur({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = '0px',
		to = '5px',
		id = 'blur',
	} = {}) {
		console.warn('`esQuery.filterBlur()` is deprecated and will be removed');
		return this.animateFilter({
			from: `blur(${from})`,
			to: `blur(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterInvert({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = '100%',
		id = 'invert',
	} = {}) {
		console.warn('`esQuery.filterInvert()` is deprecated and will be removed');
		return this.animateFilter({
			from: `invert(${from})`,
			to: `invert(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterHueRotate({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = '0deg',
		to = '90deg',
		id = 'hue-rotate',
	} = {}) {
		console.warn('`esQuery.filterHueRotate()` is deprecated and will be removed');
		return this.animateFilter({
			from: `hue-rotate(${from})`,
			to: `hue-rotate(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterBrightness({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'brightness',
	} = {}) {
		console.warn('`esQuery.filterBrightness()` is deprecated and will be removed');
		return this.animateFilter({
			from: `brightness(${from})`,
			to: `brightness(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterContrast({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'contrast',
	} = {}) {
		console.warn('`esQuery.filterContrast()` is deprecated and will be removed');
		return this.animateFilter({
			from: `contrast(${from})`,
			to: `contrast(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterSaturate({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'saturate',
	} = {}) {
		console.warn('`esQuery.filterSaturate()` is deprecated and will be removed');
		return this.animateFilter({
			from: `saturate(${from})`,
			to: `saturate(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterOpacity({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'saturate',
	} = {}) {
		console.warn('`esQuery.filerOpacity()` is deprecated and will be removed');
		return this.animateFilter({
			from: `opacity(${from})`,
			to: `opacity(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async filterSepia({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'sepia',
	} = {}) {
		console.warn('`esQuery.filterSepia()` is deprecated and will be removed');
		return this.animateFilter({
			from: `sepia(${from})`,
			to: `sepia(${to})`,
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
		});
	}

	async fade({
		duration = 400,
		delay = 0,
		fill = 'forwards',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 1,
		to = 0,
		id = 'fade-in',
		signal
	} = {}) {
		return this.animate([
			{ opacity: from },
			{ opacity: to }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async fadeIn({
		duration = 400,
		delay = 0,
		fill = 'forwards',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		from = 0,
		to = 1,
		id = 'fade-in',
		signal,
	} = {}) {
		return this.fade({ delay, duration, fill, easing, direction, iterations,
			from, to, id, signal });
	}

	async fadeOut(opts = {}) {
		return this.fade(opts);
	}

	async scale({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		id = 'scale',
		initialScale = 0,
		scale = 1.5,
		signal,
	} = {}) {
		return this.animate([
			{ transform: `scale(${initialScale})` },
			{ transform: `scale(${scale})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async grow({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		id = 'grow',
		initialScale = 0,
		scale = 1,
		signal,
	} = {}) {
		return this.scale({ delay, duration, fill, easing, direction, iterations,
			id, scale, initialScale, signal });
	}

	async shrink({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		id = 'shrink',
		initialScale = 1,
		scale = 0,
		signal,
	} = {}) {
		return this.scale({ delay, duration, fill, easing, direction, iterations,
			id, scale, initialScale, signal });
	}

	async rotate({
		duration = 400,
		delay = 0,
		fill = 'both',
		direction = 'normal',
		easing = 'linear',
		iterations = 1,
		id = 'rotate',
		rotation = '1turn',
		initialRotation = '0turn',
		signal,
	} = {}) {
		return this.animate([
			{ transform: `rotate(${initialRotation})` },
			{ transform: `rotate(${rotation})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async bounce({
		duration = 400,
		delay = 0,
		fill = 'none',
		direction = 'alternate',
		easing = 'ease-in-out',
		iterations = 1,
		id = 'bounce',
		height = '-50px',
		signal,
	} = {}) {
		return this.animate([
			{ transform: 'none' },
			{ transform: `translateY(${height})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async shake({
		duration = 400,
		delay = 0,
		fill = 'none',
		direction = 'alternate',
		easing = 'cubic-bezier(.68,-0.55,.27,1.55)',
		iterations = 6,
		id = 'shake',
		offsetX = '60px',
		offsetY = '20px',
		scale = 0.9,
		signal,
	} = {}) {
		return this.animate([
			{ transform: 'none' },
			{ transform: `translateY(${offsetY}) translateX(-${offsetX}) scale(${scale})` },
			{ transform: 'none' },
			{ transform: `translateY(-${offsetY}) translateX(${offsetX}) scale(${1 / scale})` },
			{ transform: 'none' },
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async slideLeft({
		duration = 400,
		delay = 0,
		fill = 'forwards',
		direction = 'normal',
		easing = 'ease-in',
		iterations = 1,
		id = 'slide-left',
		initial = 0,
		distance = '50px',
		signal,
	} = {}) {
		return this.animate([
			{ transform: `translateX(${initial})` },
			{ transform: `translateX(-${distance})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async slideRight({
		duration = 400,
		delay = 0,
		fill = 'forwards',
		direction = 'normal',
		easing = 'ease-in',
		iterations = 1,
		id = 'slide-right',
		initial = 0,
		distance = '50px',
		signal,
	} = {}) {
		return this.animate([
			{ transform: `translateX(${initial})` },
			{ transform: `translateX(${distance})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async slideUp({
		duration = 400,
		delay = 0,
		fill = 'forwards',
		direction = 'normal',
		easing = 'ease-in',
		iterations = 1,
		id = 'slide-up',
		initial = 0,
		distance = '50px',
		signal,
	} = {}) {
		return this.animate([
			{ transform: `translateY(${initial})` },
			{ transform: `translateY(-${distance})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	async slideDown({
		duration = 400,
		delay = 0,
		fill = 'forwards',
		direction = 'normal',
		easing = 'ease-in',
		iterations = 1,
		id = 'slide-down',
		initial = 0,
		distance = '50px',
		signal,
	} = {}) {
		return this.animate([
			{ transform: `translateY(${initial})` },
			{ transform: `translateY(${distance})` }
		], { delay, duration, fill, easing, direction, iterations, id, signal });
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async loadHTML(href) {
		console.warn('`esQuery.loadHTML()` is deprecated and will be removed');
		const url = new URL(href, location.origin);
		const resp = await fetch(url);

		if (resp.ok) {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			this.html(doc.body.innerHTML);
			return this;
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}

	async some(callback) {
		return this.toArray().some(callback);
	}

	async every(callback) {
		return this.toArray().every(callback);
	}

	async find(callback) {
		return this.toArray().find(callback);
	}

	async findAll(callback) {
		return this.filter(callback);
	}

	async map(callback) {
		return Promise.all(this.toArray().map(callback));
	}

	async filter(callback) {
		return new esQuery(this.toArray().filter(callback));
	}

	async addClass(...classes) {
		await addClass(this, ...classes);
		return this;
	}

	async removeClass(...classes) {
		await removeClass(this, ...classes);
		return this;
	}

	async hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}

	async toggleClass(...args) {
		await toggleClass(this, ...args);
		return this;
	}

	async replaceClass(classes = {}) {
		await replaceClass(this, classes);
		return this;
	}

	async pickClass(cname1, cname2, condition) {
		await onAnimationFrame(() => {
			if (condition) {
				this.each(el => {
					el.classList.add(cname1);
					el.classList.remove(cname2);
				});
			} else {
				this.each(el => {
					el.classList.add(cname2);
					el.classList.remove(cname1);
				});
			}
		});

		return this;
	}

	async remove() {
		await onAnimationFrame(() =>  this.forEach(el => el.remove()));
		return this;
	}

	async empty(query = null) {
		await onAnimationFrame(() => {
			if (typeof query === 'string') {
				this.forEach(node => [...node.children].forEach(child => {
					if (child.matches(query)) {
						child.remove();
					}
				}));
			} else {
				this.forEach(node => node.replaceChildren());
			}
		});

		return this;
	}

	async disable(disabled = true) {
		await onAnimationFrame(() =>  this.forEach(el => el.disabled = disabled));
		return this;
	}

	async enable(enabled = true) {
		await this.disable(!enabled);
		return this;
	}

	async hide(hidden = true) {
		await onAnimationFrame(() => this.forEach(el => el.hidden = hidden));
		return this;
	}

	async unhide(shown = true) {
		return this.hide(!shown);
	}

	async append(...nodes) {
		await onAnimationFrame(() => this.forEach(el => el.append(...nodes)));
		return this;
	}

	async prepend(...nodes) {
		await onAnimationFrame(() => this.forEach(el => el.prepend(...nodes)));
		return this;
	}

	async before(...nodes) {
		await onAnimationFrame(this.forEach(el => el.before(...nodes)));
		return this;
	}

	async after(...nodes) {
		await onAnimationFrame(this.forEach(el => el.after(...nodes)));
		return this;
	}

	async afterBegin(text) {
		await onAnimationFrame(this.forEach(el => el.insertAdjacentHTML('afterbegin', text)));
		return this;
	}

	async afterEnd(text) {
		await onAnimationFrame(this.forEach(el => el.insertAdjacentHTML('afterend', text)));
		return this;
	}

	async beforeBegin(text) {
		await onAnimationFrame(this.forEach(el => el.insertAdjacentHTML('beforebegin', text)));
		return this;
	}

	async beforeEnd(text) {
		await onAnimationFrame(this.forEach(el => el.insertAdjacentHTML('beforeend', text)));
		return this;
	}

	async hasAttribute(attr) {
		return this.some(el => el.hasAttribute(attr));
	}

	async toggleAttribute(...args) {
		await onAnimationFrame(this.each(el => el.toggleAttribute(...args)));
		return this;
	}

	async value(value) {
		return this.attr({ value });
	}

	async pause() {
		this.forEach(media => media.pause());
		return this;
	}

	async read() {
		read(...this);
	}

	/*==================== Listener Functions =================================*/
	async on(...args) {
		on(this, ...args);
		return this;
	}

	async off(...args) {
		off(this, ...args);
		return this;
	}

	async waitUntil(...events) {
		return new Promise(resolve => {
			const callback = event => {
				resolve(event.target);
				events.forEach(event => this.off(event, callback, { once: true }));
			};
			events.forEach(event => this.on(event, callback, { once: true }));
		});
	}

	async once(event, callback, { capture, passive, signal } = {}) {
		return this.on(event, callback, { once: true, capture, passive, signal });
	}

	async debounce(event, callback, wait = 17, immediate = false, ...attrs) {
		return this.on(event, debounce(callback, wait, immediate), ...attrs);
	}

	async ready(callback, ...args) {
		this.on('DOMContentLoaded', callback, ...args);
		if (document.readyState !== 'loading') {
			this.forEach(node => {
				callback.bind(node)(new Event('DOMContentLoaded'));
			}, false);
		}
		return this;
	}

	async networkChange(callback, ...args) {
		this.online(callback, ...args);
		this.offline(callback, ...args);
		return this;
	}

	async playing(callback) {
		this.forEach(e => e.onplay = callback);
		return this;
	}

	async paused(callback) {
		this.forEach(e => e.onpause = callback, false);
		return this;
	}

	async visibilitychange(callback, ...args) {
		this.forEach(e => {
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

	async popstate(callback, ...args) {
		return this.on('popstate', callback, ...args);
	}

	async pagehide(callback, ...args) {
		return this.on('pagehide', callback, ...args);
	}

	async mutate(watching, options = [], attributeFilter = []) {
		/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
		const watcher = new MutationObserver(mutations => {
			mutations.forEach(mutation => watching[mutation.type].call(mutation));
		});
		const obs = Object.keys(watching).concat(options).reduce((watch, event) => {
			watch[event] = true;
			return watch;
		}, { attributeFilter });
		this.forEach(el => watcher.observe(el, obs));
		return this;
	}

	async watch(...args) {
		console.warn('`esQuery.watch()` is deprecated, please use `esQuery.mutate()` instead');
		return await this.mutate(...args);
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
	 */
	async intersect(callback, options = {}) {
		try {
			intersect(this, callback, options);
		} catch (err) {
			console.error(err);
		}
		return this;
	}

	async attr(...args) {
		await attr(this, ...args);
		return this;
	}

	async toggleAttr(attrs, { force, signal } = {}) {
		toggleAttr(this, attrs, { force, signal });
	}

	async data(...args) {
		await data(this, ...args);
		return this;
	}

	async css(...args) {
		await css(this, ...args);
		return this;
	}

	static async get(...args) {
		return await GET(...args);
	}

	static async post(...args) {
		return await POST(...args);
	}

	static async delete(...args) {
		return await DELETE(...args);
	}

	static async getHTML(...args) {
		return await getHTML(...args);
	}

	static async getJSON(...args) {
		return await getJSON(...args);
	}

	static async getText(...args) {
		return await getText(...args);
	}

	static async postHTML(...args) {
		return await postHTML(...args);
	}

	static async postJSON(...args) {
		return await postJSON(...args);
	}

	static async postText(...args) {
		return await postText(...args);
	}

	static mediaQuery(query) {
		return mediaQuery(query);
	}

	static async getLocation(...args) {
		return await getLocation(...args);
	}

	static get loaded() {
		return loaded();
	}

	static get ready() {
		return ready();
	}
}

function $(selector, parent = document) {
	return new esQuery(selector, parent);
}

$.mediaQuery = esQuery.mediaQuery;
$.getLocation = esQuery.getLocation;
$.loaded = esQuery.loaded;
$.ready = esQuery.ready;
$.get = esQuery.get;
$.post = esQuery.post;
$.delete = esQuery.delete;
$.getHTML = esQuery.getHTML;
$.getJSON = esQuery.getJSON;
$.getText = esQuery.getText;
$.postHTML = esQuery.postHTML;
$.postJSON = esQuery.postJSON;
$.postText = esQuery.postText;

export { $ };
