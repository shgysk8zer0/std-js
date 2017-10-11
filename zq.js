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
			} else if (selector instanceof Array) {
				this.results = selector;
			} else if (typeof selector === 'object') {
				this.results = [selector];
			} else {
				throw new TypeError(`Expected a string or NodeList but got a ${typeof selector}: ${selector}.`);
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

	async text(str) {
		return this.each(node => node.textContent = str);
	}

	async html(html) {
		return this.each(node => node.innerHTML = html);
	}

	async replaceText(replacements = {}) {
		return this.each(el => Object.keys(replacements).forEach(find => {
			el.textContent = el.textContent.replace(find, replacements[find]);
		}));
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

	async visible() {
		return this.css({visibility: 'visible'});
	}

	async invisible() {
		return this.css({visibility: 'hidden'});
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

	async data(data = {}) {
		return this.each(node => {
			Object.keys(data).forEach(key => {
				if (! data[key]) {
					delete node.dataset[key];
				} else {
					node.dataset[key] = data[key];
				}
			});
		});
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

	async animate(keyframes, opts = 400) {
		if ('animate' in Element.prototype) {
			return Promise.all(await this.map(node => {
				return new Promise((resolve, reject) => {
					const anim = node.animate(keyframes, opts);
					anim.onfinish = () => resolve(node);
					anim.oncancel = reject;
				});
			})).then(els => new zQ(els));
		} else {
			return Promise.resolve([]);
		}
	}

	async getAnimations() {
		let anims = [];
		await this.each(el => {
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

	async animateFilter({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 'none',
		to         = 'none',
		id         = 'grayscale',
	} = {}) {
		return this.animate([
			{filter: `${from}`},
			{filter: `${to}`},
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

	async filterDropShadow({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = '0 0 0 black',
		to         = '0.5em 0.5em 0.5em rgba(0,0,0,0.3)',
		id         = 'drop-shadow',
	} = {}) {
		return this.animate([
			{filter: `drop-shadow(${from})`},
			{filter: `drop-shadow(${to})`},
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

	async filterGrayscale({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'grayscale',
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

	async filterBlur({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = '0px',
		to         = '5px',
		id         = 'blur',
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

	async filterInvert({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = '100%',
		id         = 'invert',
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

	async filterHueRotate({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = '0deg',
		to         = '90deg',
		id         = 'hue-rotate',
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

	async filterBrightness({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'brightness',
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

	async filterContrast({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'contrast',
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

	async filterSaturate({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'saturate',
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

	async filterOpacity({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'saturate',
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

	async filterSepia({
		duration   = 400,
		delay      = 0,
		fill       = 'both',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'sepia',
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
		duration   = 400,
		delay      = 0,
		fill       = 'forwards',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 1,
		to         = 0,
		id         = 'fade-in',
	} = {}) {
		return this.animate([
			{opacity: from},
			{opacity: to}
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
		duration   = 400,
		delay      = 0,
		fill       = 'forwards',
		direction  = 'normal',
		easing     = 'linear',
		iterations = 1,
		from       = 0,
		to         = 1,
		id         = 'fade-in',
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
		duration     = 400,
		delay        = 0,
		fill         = 'both',
		direction    = 'normal',
		easing       = 'linear',
		iterations   = 1,
		id           = 'scale',
		initialScale = 0,
		scale        = 1.5,
	} = {}) {
		return this.animate([
			{transform: `scale(${initialScale})`},
			{transform: `scale(${scale})`}
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
		duration     = 400,
		delay        = 0,
		fill         = 'both',
		direction    = 'normal',
		easing       = 'linear',
		iterations   = 1,
		id           = 'grow',
		initialScale = 0,
		scale        = 1,
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
		duration     = 400,
		delay        = 0,
		fill         = 'both',
		direction    = 'normal',
		easing       = 'linear',
		iterations   = 1,
		id           = 'shrink',
		initialScale = 1,
		scale        = 0,
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
		duration        = 400,
		delay           = 0,
		fill            = 'both',
		direction       = 'normal',
		easing          = 'linear',
		iterations      = 1,
		id              = 'rotate',
		rotation        = '1turn',
		initialRotation = '0turn',
	} = {}) {
		return this.animate([
			{transform: `rotate(${initialRotation})`},
			{transform: `rotate(${rotation})`}
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
		duration   = 400,
		delay      = 0,
		fill       = 'none',
		direction  = 'alternate',
		easing     = 'ease-in-out',
		iterations = 1,
		id         = 'bounce',
		height     = '-50px',
	} = {}) {
		return this.animate([
			{transform: 'none'},
			{transform: `translateY(${height})`}
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
		duration   = 400,
		delay      = 0,
		fill       = 'none',
		direction  = 'alternate',
		easing     = 'cubic-bezier(.68,-0.55,.27,1.55)',
		iterations = 6,
		id         = 'shake',
		offsetX    = '60px',
		offsetY    = '20px',
		scale      = 0.9,
	} = {}) {
		return this.animate([
			{transform: 'none'},
			{transform: `translateY(${offsetY}) translateX(-${offsetX}) scale(${scale})`},
			{transform: 'none'},
			{transform: `translateY(-${offsetY}) translateX(${offsetX}) scale(${1/scale})`},
			{transform: 'none'},
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
		duration     = 400,
		delay        = 0,
		fill         = 'forwards',
		direction    = 'normal',
		easing       = 'ease-in',
		iterations   = 1,
		id           = 'slide-left',
		initial      = 0,
		distance     = '50px',
	} = {}) {
		return this.animate([
			{transform: `translateX(${initial})`},
			{transform: `translateX(-${distance})`}
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
		duration     = 400,
		delay        = 0,
		fill         = 'forwards',
		direction    = 'normal',
		easing       = 'ease-in',
		iterations   = 1,
		id           = 'slide-right',
		initial      = 0,
		distance     = '50px',
	} = {}) {
		return this.animate([
			{transform: `translateX(${initial})`},
			{transform: `translateX(${distance})`}
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
		duration     = 400,
		delay        = 0,
		fill         = 'forwards',
		direction    = 'normal',
		easing       = 'ease-in',
		iterations   = 1,
		id           = 'slide-up',
		initial      = 0,
		distance     = '50px',
	} = {}) {
		return this.animate([
			{transform: `translateY(${initial})`},
			{transform: `translateY(-${distance})`}
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
		duration     = 400,
		delay        = 0,
		fill         = 'forwards',
		direction    = 'normal',
		easing       = 'ease-in',
		iterations   = 1,
		id           = 'slide-down',
		initial      = 0,
		distance     = '50px',
	} = {}) {
		return this.animate([
			{transform: `translateY(${initial})`},
			{transform: `translateY(${distance})`}
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
		return [...this].map(callback);
	}

	async filter(callback) {
		return new zQ([...this].filter(callback));
	}

	async addClass(cname) {
		return this.each(el => el.classList.add(cname));
	}

	async removeClass(cname) {
		return this.each(el => el.classList.remove(cname));
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
		this.toggleClass(cname1, condition);
		this.toggleClass(cname2, ! condition);
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

	async unhide(shown = true) {
		return this.hide(! shown);
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

	async attr(attrs = {}) {
		return this.each(el => Object.keys(attrs).forEach(attr => {
			const val = attrs[attr];
			switch (typeof(val)) {
			case 'string':
			case 'number':
				el.setAttribute(attr, val);
				break;
			case 'boolean':
				val ? el.setAttribute(attr, '') : el.removeAttribute(attr);
				break;
			default:
				el.removeAttribute(attr);
			}
		}));
	}

	async pause() {
		return this.each(media => media.pause());
	}

	/*==================== Listener Functions =================================*/
	async on(event, callback, ...args) {
		this.each(node => node.addEventListener(event, callback, ...args));
		return this;
	}

	async once(event, callback) {
		return this.on(event, callback, {once: true});
	}

	async off(event, callback) {
		return this.each(node => node.removeEventListener(callback));
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

	async css(props = {}) {
		return this.each(node => {
			Object.keys(props).forEach(prop => {
				node.style.setProperty(prop, props[prop]);
			});
		});
	}
}
