import { read, debounce, prefersReducedMotion, isInViewport } from './functions.js';
const PREFIXES = [
	'',
	'moz',
	'webkit',
	'ms'
];

/*============================ esQuery Functions =======================*/
export default class esQuery extends Set {
	constructor(selector, parent = document) {
		if (typeof selector === 'string') {
			super(parent.querySelectorAll(selector));
			if (parent instanceof HTMLElement && parent.matches(selector)) {
				this.add(parent);
			}
		} else if (selector[Symbol.iterator] instanceof Function) {
			super(selector);
		} else if (typeof selector === 'object') {
			super([selector]);
		} else {
			super();
			throw new TypeError(`Expected a string or NodeList but got a ${typeof selector}: ${selector}.`);
		}
	}

	get parents() {
		return new esQuery(this.toArray().map(item => item.parentElement));
	}

	get children() {
		return new esQuery(this.toArray().map(el => [...el.children]).flat());
	}

	get found() {
		return this.size !== 0;
	}

	get first() {
		return this.toArray().shift();
	}

	get last() {
		return this.toArray().pop();
	}

	item(num) {
		if (this.size > num) {
			return this.toArray()[num];
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
		this.forEach(node => node.textContent = str);
		return this;
	}

	async html(html) {
		this.forEach(node => node.innerHTML = html);
		return this;
	}

	async replaceText(replacements = {}) {
		this.forEach(el => Object.keys(replacements).forEach(find => {
			el.textContent = el.textContent.replace(find, replacements[find]);
		}));
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
		return new esQuery([...this].map(el => el.closest(selector)));
	}

	async matches(selector, any = false) {
		if (any) {
			return this.some(el => el.matches(selector));
		} else {
			return this.every(el => el.matches(selector));
		}
	}

	/**
	 * @deprecated [will be removed in v3.0.0]
	 */
	async import(selector = 'body > *') {
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

	async animate(keyframes, opts = 400) {
		if (('animate' in Element.prototype) && !prefersReducedMotion()) {
			await this.map(node => node.animate(keyframes, opts).finished);
			return this;
		} else {
			return Promise.resolve(this);
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
	} = {}) {
		return this.animate([
			{ opacity: from },
			{ opacity: to }
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
	} = {}) {
		return this.fade({
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			from,
			to,
			id,
		});
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
	} = {}) {
		return this.animate([
			{ transform: `scale(${initialScale})` },
			{ transform: `scale(${scale})` }
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
	} = {}) {
		return this.scale({
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
			scale,
			initialScale,
		});
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
	} = {}) {
		return this.scale({
			delay,
			duration,
			fill,
			easing,
			direction,
			iterations,
			id,
			scale,
			initialScale,
		});
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
	} = {}) {
		return this.animate([
			{ transform: `rotate(${initialRotation})` },
			{ transform: `rotate(${rotation})` }
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

	async bounce({
		duration = 400,
		delay = 0,
		fill = 'none',
		direction = 'alternate',
		easing = 'ease-in-out',
		iterations = 1,
		id = 'bounce',
		height = '-50px',
	} = {}) {
		return this.animate([
			{ transform: 'none' },
			{ transform: `translateY(${height})` }
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
	} = {}) {
		return this.animate([
			{ transform: 'none' },
			{ transform: `translateY(${offsetY}) translateX(-${offsetX}) scale(${scale})` },
			{ transform: 'none' },
			{ transform: `translateY(-${offsetY}) translateX(${offsetX}) scale(${1 / scale})` },
			{ transform: 'none' },
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
	} = {}) {
		return this.animate([
			{ transform: `translateX(${initial})` },
			{ transform: `translateX(-${distance})` }
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
	} = {}) {
		return this.animate([
			{ transform: `translateX(${initial})` },
			{ transform: `translateX(${distance})` }
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
	} = {}) {
		return this.animate([
			{ transform: `translateY(${initial})` },
			{ transform: `translateY(-${distance})` }
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
	} = {}) {
		return this.animate([
			{ transform: `translateY(${initial})` },
			{ transform: `translateY(${distance})` }
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
	async loadHTML(href) {
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
		return [...this].some(callback);
	}

	async every(callback) {
		return [...this].every(callback);
	}

	async find(callback) {
		return [...this].find(callback);
	}

	async findAll(callback) {
		return this.filter(callback);
	}

	async map(callback) {
		return Promise.all([...this].map(callback));
	}

	async filter(callback) {
		return new esQuery([...this].filter(callback));
	}

	async addClass(...classes) {
		this.forEach(el => el.classList.add(...classes));
		return this;
	}

	async removeClass(...classes) {
		this.forEach(el => el.classList.remove(...classes));
		return this;
	}

	async hasClass(cname) {
		return this.some(el => el.classList.contains(cname));
	}

	async toggleClass(cname, force = null) {
		if (force instanceof Function) {
			this.forEach(node => node.classList.toggle(cname, force(node)));
		} else if (typeof force === 'boolean') {
			this.forEach(node => node.classList.toggle(cname, force));
		} else {
			this.forEach(node => node.classList.toggle(cname));
		}
		return this;
	}

	async replaceClass(cname1, cname2) {
		this.forEach(node => node.classList.replace(cname1, cname2));
		return this;
	}

	async pickClass(cname1, cname2, condition) {
		this.toggleClass(cname1, condition);
		this.toggleClass(cname2, !condition);
		return this;
	}

	async remove() {
		this.forEach(el => el.remove());
		return this;
	}

	async empty(query = null) {
		if (typeof query === 'string') {
			this.forEach(node => [...node.children].forEach(child => {
				if (child.matches(query)) {
					child.remove();
				}
			}));
		} else {
			this.forEach(node => [...node.children].forEach(child => child.remove()));
		}
		return this;
	}

	async disable(disabled = true) {
		this.forEach(el => el.disabled = disabled);
	}

	async enable(enabled = true) {
		this.disable(!enabled);
	}

	async hide(hidden = true) {
		this.forEach(el => el.hidden = hidden);
		return this;
	}

	async unhide(shown = true) {
		return this.hide(!shown);
	}

	async append(...nodes) {
		this.forEach(el => el.append(...nodes));
		return this;
	}

	async prepend(...nodes) {
		this.forEach(el => el.prepend(...nodes));
		return this;
	}

	async before(...nodes) {
		this.forEach(el => el.before(...nodes));
		return this;
	}

	async after(...nodes) {
		this.forEach(el => el.after(...nodes));
		return this;
	}

	async afterBegin(text) {
		this.forEach(el => el.insertAdjacentHTML('afterbegin', text));
		return this;
	}

	async afterEnd(text) {
		this.forEach(el => el.insertAdjacentHTML('afterend', text));
		return this;
	}

	async beforeBegin(text) {
		this.forEach(el => el.insertAdjacentHTML('beforebegin', text));
		return this;
	}

	async beforeEnd(text) {
		this.forEach(el => el.insertAdjacentHTML('beforeend', text));
		return this;
	}

	async hasAttribute(attr) {
		return this.some(el => el.hasAttribute(attr));
	}

	async toggleAttribute(...args) {
		return this.each(el => el.toggleAttribute(...args));
	}

	async value(val) {
		return this.each(el => el.value = val);
	}

	async pause() {
		this.forEach(media => media.pause());
		return this;
	}

	async read() {
		read(...this);
	}

	/*==================== Listener Functions =================================*/
	async on(event, ...args) {
		if (typeof event === 'string') {
			this.forEach(node => node.addEventListener(event, ...args));
		} else if (Array.isArray(event)) {
			event.forEach(e => this.on(e, ...args));
		} else {
			Object.entries(event).forEach(([e, c]) => this.on(e, c, ...args));
		}
		return this;
	}

	async off(event, ...args) {
		if (typeof event === 'string') {
			this.forEach(node => node.removeEventListener(event, ...args));
		} else if (Array.isArray(event)) {
			event.forEach(e => this.off(e, ...args));
		} else {
			Object.entries(event).forEach(([e, c]) => this.off(e, c, ...args));
		}
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

	async once(event, callback) {
		return this.on(event, callback, { once: true });
	}

	async debounce(event, callback, wait = 17, immediate = false) {
		return this.on(event, debounce(callback, wait, immediate));
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
		return this.online(callback, ...args).offline(callback, ...args);
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

	async watch(watching, options = [], attributeFilter = []) {
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

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
	 */
	async intersect(callback, options = {}) {
		try {
			const observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => callback(entry, observer));
			}, options);

			this.forEach(node => observer.observe(node));
		} catch (err) {
			console.error(err);
		}
		return this;
	}

	async attr(attrs = {}) {
		this.forEach(node => {
			for (const [key, value] of Object.entries(attrs)) {
				switch (typeof (value)) {
					case 'string':
					case 'number':
						node.setAttribute(key, value);
						break;
					case 'boolean':
						value ? node.setAttribute(key, '') : node.removeAttribute(key);
						break;
					default:
						node.removeAttribute(key);
				}
			}
		});
		return this;
	}

	async css(props = {}) {
		this.forEach(node => {
			Object.entries(props).forEach(([prop, value]) => {
				node.style.setProperty(prop, value);
			});
		});
		return this;
	}

	async data(props = {}) {
		this.forEach(node => {
			for (const [key, value] of Object.entries(props)) {
				if (value === false) {
					delete node.dataset[key];
				} else if (value === true || value === null) {
					node.dataset[key] = '';
				} else {
					node.dataset[key] = typeof (value) === 'string' ? value : JSON.stringify(value);
				}
			}
		});
		return this;
	}
}
