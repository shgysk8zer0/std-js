import { $ } from './functions.js';

export function remove() {
	$(this.dataset.remove).remove();
}

export function hide() {
	$(this.dataset.hide).hide();
}

export function unhide() {
	$(this.dataset.unhide).unhide();
}

export function disable() {
	$(this.dataset.disable).disable();
}

export function enable() {
	$(this.dataset.enable).enable();
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
	const { scrollTo, behavior = 'smooth', block = 'start' } = this.dataset;
	const target = document.querySelector(scrollTo);

	if (target instanceof Element) {
		target.scrollIntoView({ behavior, block });
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
	const els = document.querySelectorAll(this.dataset.open);
	els.forEach(el => el.open = true);
}

export function showModal() {
	const target = document.querySelector(this.dataset.showModal);
	if (target.showModal instanceof Function) {
		target.showModal();
	}
}

export function close() {
	const target = document.querySelector(this.dataset.close);
	if (target instanceof HTMLElement) {
		target.tagName === 'DIALOG' ? target.close() : target.open = false;
	}
}

export function toggleAttribute() {
	const { selector = ':root', toggleAttribute } = this.dataset;
	const els = document.querySelectorAll(selector);

	if ('checked' in this) {
		els.forEach(el => el.toggleAttribute(toggleAttribute, this.checked));
	} else {
		els.forEach(el => el.toggleAttribute(toggleAttribute));
	}

}

export function toggleClass() {
	const { selector = ':root', toggleClass = '' } = this.dataset;
	const els = document.querySelectorAll(selector);

	if ('checked' in this) {
		if (this.checked) {
			els.forEach(el => el.classList.add(...toggleClass.split(' ')));
		} else {
			els.forEach(el => el.classList.remove(...toggleClass.split(' ')));
		}
	} else {
		els.forEach(el => toggleClass.split(' ').forEach(cn => el.classList.toggle(cn)));
	}
}

export async function init(base = document, { passive = true, capture = true, once = false } = {}) {
	await $.ready;
	$('[data-remove]', base).click(remove, { passive, capture, once });
	$('[data-hide]', base).click(hide, { passive, capture, once });
	$('[data-unhide]', base).click(unhide, { passive, capture, once });
	$('[data-disable]', base).click(disable, { passive, capture, once });
	$('[data-enable]', base).click(enable, { passive, capture, once });
	$('[data-scrollTo]', base).click(scrollTo, { passive, capture, once });
	$('[data-show]', base).click(show, { passive, capture, once });
	$('[data-open]', base).click(open, { passive, capture, once });
	$('[data-show-modal]', base).click(showModal, { passive, capture, once });
	$('[data-close]', base).click(close, { passive, capture, once });
	$('[data-toggle-attribute]', base).click(toggleAttribute, { passive, capture, once });
	$('[data-toggle-class]', base).click(toggleClass, { passive, capture, once });
	$('[data-cookie]', base).click(cookie);
}
