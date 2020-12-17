import { css } from './functions.js';
import { getShareURL, ALL_TARGETS } from './share-targets.js';
import { loadImage } from './loader.js';

async function createTarget(target, { title, text, url, files }) {
	const a = document.createElement('a');
	const label = document.createElement('b');
	const icon = target.icons.find(({ type }) => type === 'image/svg+xml');
	const img = await loadImage(icon.src, { height: 64, width: 64, alt: target.name });
	label.textContent = target.name;
	a.title = target.name;
	a.href = getShareURL(target, { title, text, url, files });
	a.target = '_blank';
	a.relList.add('external', 'noopener', 'noreferrer');

	css(img, {
		'padding': '8px',
		'border-radius': '6px',
	});
	css(a, {
		'display': 'inline-block',
		'text-align': 'center',
	});
	css(label, {
		'color': 'inherit',
	});

	a.append(img, document.createElement('br'), label);
	return a;
}

async function getCopyBtn({ title, text, url } = {}) {
	const btn = document.createElement('button');
	btn.type = 'button';
	const label = document.createElement('b');
	const img = await loadImage('https://cdn.kernvalley.us/img/octicons/clippy.svg', { height: 64, width: 64, alt: 'Clipboard' });
	btn.title = 'Copy to clipboard';
	label.textContent = 'Clipboard';
	btn.dataset.action = 'copy';
	btn.dataset.text = [title, text, url].filter(t => typeof t === 'string').join(' ');

	css(img, {
		'padding': '8px',
		'border-radius': '6px',
	});
	css(btn, {
		'display': 'inline-block',
		'text-align': 'center',
		'cursor': 'pointer',
		'border': 'none',
		'background-color': 'transparent',
		'color': 'inherit',
	});
	css(label, {
		'color': 'inherit',
	});

	btn.append(img, document.createElement('br'), label);
	return btn;
}

export async function config(...targets) {
	await customElements.whenDefined('toast-message');
	const ToastMessage = customElements.get('toast-message');

	return async function share({ title, text, url, files }) {
		const toast = new ToastMessage();
		const container = document.createElement('div');
		const header = document.createElement('header');
		const heading = document.createElement('h3');
		const items = document.createElement('div');
		toast.backdrop = true;
		heading.textContent = 'Share via';
		container.slot = 'content';
		css(items, {
			'display': 'flex',
			'flex-direction': 'row',
			'justify-content': 'space-evenly',
			'align-items': 'end',
			'flex-wrap': 'wrap',
			'gap': '6px',
			'padding': '4px',
		});

		return new Promise(async (resolve, reject) => {
			function callback() {
				resolve();
				if (this.dataset.hasOwnProperty('action')) {
					switch(this.dataset.action) {
						case 'copy':
							navigator.clipboard.writeText(this.dataset.text);
							break;

						default:
							throw new Error(`Unhandled action: ${this.dataset.action}`);
					}
				}
				setTimeout(() => this.closest('toast-message').close(), 100);
			}

			const children = await Promise.all(targets.map(target => {
				return createTarget(target, { title, text, url, files }).then(item => {
					item.addEventListener('click', callback, { capture: true });
					return item;
				});
			}));

			if ('clipboard' in navigator && navigator.clipboard.writeText instanceof Function) {
				const cpy = await getCopyBtn({ title, text, url });
				console.info({ cpy });
				cpy.addEventListener('click', callback, { capture: true });
				children.push(cpy);
			}

			items.append(...children);

			header.append(heading);
			container.append(header, items);
			toast.append(container);
			document.body.append(toast);
			await toast.show();
			await toast.closed;
			reject(new DOMException('User cancelled share'));
			toast.remove();

		});
	};
}

export async function autoConfig() {
	return await config(...ALL_TARGETS);
}
