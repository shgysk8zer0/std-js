import SocialShare from './socialshare.js';

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

export function socialShare() {
	if (this.dataset.socialShare in SocialShare) {
		SocialShare.openPopup(`${SocialShare[this.dataset.socialShare]}`);
	}
}
