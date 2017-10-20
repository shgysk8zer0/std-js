/**
 * HTML API using data-* attributes
 */
export function show() {
	const target = document.querySelector(this.dataset.show);
	target.show();
}

export function showModal() {
	const target = document.querySelector(this.dataset.showModal);
	target.showModal();
}

export function close() {
	const target = document.querySelector(this.dataset.close);
	if (this.dataset.hasOwnProperty('returnValue')) {
		target.close(this.dataset.returnValue);
	} else {
		target.close();
	}
}

export function scrollTo() {
	const target = document.querySelector(this.dataset.scrollTo);
	target.scrollIntoView({
		behaviour: 'smooth',
		block: 'start'
	});
}

export function remove() {
	const targets = document.querySelectorAll(this.dataset.remove);
	targets.forEach(target => target.remove());
}

export function fullscreen() {
	document.querySelector(this.dataset.fullscreen).requestFullscreen();
}

export function changeAttrs() {
	const attrs = JSON.parse(this.dataset.attrs);
	Object.keys(attrs).forEach(sel => {
		let targets = document.querySelectorAll(sel);
		targets.forEach(target => {
			Object.keys(attrs[sel]).forEach(attr => {
				if (attrs[sel][attr] === false) {
					target.removeAttribute(attr);
				} else {
					target.setAttribute(attr, attrs[sel][attr]);
				}
			});
		});
	});
}

export function toggleHidden() {
	document.querySelectorAll(this.dataset.toggleHidden).forEach(el => {
		el.hidden = ! el.hidden;
	});
}

export function share(event) {
	event.preventDefault();
	event.stopPropagation();
	const containerEl = this.dataset.share === '' ? this : document.querySelector(this.dataset.share);
	let url = location.href, text = '', title = document.title;

	if (containerEl instanceof HTMLImageElement) {
		url = containerEl.src;
		title = containerEl.alt;
	} else if (containerEl instanceof HTMLAnchorElement) {
		url = containerEl.href;
		title = containerEl.title;
		text = containerEl.textContent;
	} else if (containerEl instanceof Element) {
		const urlEl = containerEl.closest('[itemtype]')
			.querySelector('[itemprop="url"], [itemprop="contentUrl"], [rel="canonical"]');
		const titleEl = containerEl.closest('[itemtype]')
			.querySelector('[itemprop="name"], [itemprop="headline"], title');
		const textEl = containerEl.closest('[itemtype]')
			.querySelector('[itemprop="description"], [name="description"]');

		if (urlEl instanceof Element) {
			if (urlEl.hasAttribute('content')) {
				url = urlEl.getAttribute('content');
			} else if (urlEl.hasAttribute('href')) {
				url = urlEl.href;
			} else {
				url = urlEl.textContent;
			}
		} else {
			url = location.href;
		}

		if (titleEl instanceof Element) {
			if (titleEl.hasAttribute('content')) {
				title = titleEl.getAttribute('content');
			} else {
				title = titleEl.textContent;
			}
		} else {
			title = document.title;
		}

		if (textEl instanceof Element) {
			if (textEl.hasAttribute('content')) {
				text = textEl.getAttribute('content');
			} else {
				text = textEl.textContent;
			}
		}
	}

	navigator.share({
		url: new URL(url, location.origin).toString(),
		title,
		text,
	}).catch(console.error);
}
