import { on, query, ready, each, addClass, removeClass } from './dom.js';

export function remove() {
	each(this.dataset.remove, el => el.remove());
}

export function hide() {
	each(this.dataset.hide, el => el.hidden = true);
}

export function unhide() {
	each(this.dataset.unhide, el => el.hidden = false);
}

export function disable() {
	each(this.dataset.disable, el => el.disabled = true);
}

export function enable() {
	each(this.dataset.enable, el => el.disabled = false);
}

export function fullScreen() {
	const target = document.querySelector(this.dataset.fullScreen);

	if (target instanceof Element) {
		if (document.fullscreenElement instanceof Element && document.fullscreenElement.isSameNode(target)) {
			document.exitFullscreen();
		} else {
			target.requestFullscreen();
		}
	} else if (document.fullscreenElement instanceof Element) {
		document.exitFullscreen();
	}
}

export async function cookie() {
	const { cookie: name, value = null, domain = null, maxAge, expires, sameSite = 'Strict', path = '/' } = this.dataset;

	if (typeof value === 'string') {
		await cookieStore.set({ name, value, domain, path,
			maxAge: typeof maxAge === 'string' ? parseInt(maxAge) : null, sameSite,
			expires: typeof expires === 'string' ? new Date(expires) : null,
			secure: this.dataset.hasOwnProperty('secure'),
		});
	} else {
		await cookieStore.delete({ name, domain, path, secure: this.dataset.hasOwnProperty('secure') });
	}
}

export function scrollTo() {
	const { scrollTo, behavior = 'smooth', block = 'start', inline = 'nearest' } = this.dataset;
	const target = document.querySelector(scrollTo);

	if (target instanceof Element) {
		target.scrollIntoView({ behavior, block, inline });
	}
}

export function show() {
	const target = document.querySelector(this.dataset.show);

	if (target.show instanceof Function) {
		target.show();
	} else {
		target.open = true;
	}
}

export function open() {
	each(this.dataset.open, el => el.open = true);
}

export function showModal() {
	const target = document.querySelector(this.dataset.showModal);

	if (target.showModal instanceof Function) {
		target.showModal();
	}
}

export function close() {
	const { close, returnValue } = this.dataset;
	each(close, el => el.tagName === 'DIALOG' ? el.close(returnValue) : el.open = false);
}

export function toggleAttribute() {
	const { selector = ':root', toggleAttribute } = this.dataset;

	if ('checked' in this) {
		const checked = this.checked;
		each(selector, el => el.toggleAttribute(toggleAttribute, checked));
	} else {
		each(selector, el => el.toggleAttribute(toggleAttribute));
	}
}

export function copy() {
	if (navigator.clipboard && navigator.clipboard.writeText instanceof Function) {
		navigator.clipboard.writeText(this.dataset.copy);
	}
}

export function navigate() {
	switch(this.dataset.navigate) {
		case 'back':
			history.back();
			break;

		case 'forward':
			history.forward();
			break;

		case 'reload':
			location.reload();
			break;

		default:
			throw new DOMException(`Invalid value for data-navigate: ${this.dataset.navigate}`);
	}
}

export function toggleClass() {
	const { selector = ':root', toggleClass = '' } = this.dataset;

	if ('checked' in this) {
		if (this.checked) {
			addClass(selector, ...toggleClass.split(' '));
		} else {
			removeClass(selector, ...toggleClass.split(' '));
		}
	} else {
		each(selector, el => toggleClass.split(' ').forEach(cn => el.classList.toggle(cn)));
	}
}

export function init({ base = document, capture, once, passive, signal } = {}) {
	// NOTE: Need to set keyboard handlers for non-button elements
	const events = ['click'];
	const opts = { capture, passive, once, signal };

	on(query('[data-remove]', base),           events, remove,          opts);
	on(query('[data-hide]', base),             events, hide,            opts);
	on(query('[data-unhide]', base),           events, unhide,          opts);
	on(query('[data-disable]', base),          events, disable,         opts);
	on(query('[data-enable]', base),           events, enable,          opts);
	on(query('[data-scroll-to]', base),        events, scrollTo,        opts);
	on(query('[data-show]', base),             events, show,            opts);
	on(query('[data-open]', base),             events, open,            opts);
	on(query('[data-show-modal]', base),       events, showModal,       opts);
	on(query('[data-close]', base),            events, close,           opts);
	on(query('[data-toggle-attribute]', base), events, toggleAttribute, opts);
	on(query('[data-toggle-class]', base),     events, toggleClass,     opts);
	on(query('[data-cookie]', base),           events, cookie,          opts);
	on(query('[data-navigate]', base),         events, navigate,        opts);
	on(query('[data-full-screen]', base),      events, fullScreen,      opts);
	on(query('[data-copy]', base),             events, copy,            opts);
}
