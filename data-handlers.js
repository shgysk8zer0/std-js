export function scrollTo() {
	const { scrollTo, behavior = 'smooth', block = 'start' } = this.dataset;
	const target = document.querySelector(scrollTo);
	target.scrollIntoView({ behavior, block });
}

export function show() {
	const target = document.querySelector(this.dataset.show);
	if (target.show instanceof Function) {
		target.show();
	} else {
		target.open = true;
	}
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
