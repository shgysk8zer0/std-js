import { getDeferred, lock } from './promises.js';

export async function save(file, { signal } = {}) {
	if (signal instanceof EventTarget && signal.aborted) {
		throw signal.reason;
	} else if (file instanceof File) {
		const link = document.createElement('a');
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		link.hidden = true;

		link.addEventListener('click', ({ target }) => {
			requestIdleCallback(() => {
				URL.revokeObjectURL(target.href);
				target.remove();
			});
		}, { passive: true, capture: true, signal });

		link.click();
	} else {
		throw new TypeError('Not a file');
	}
}

export async function open({
	accept = null,
	multiple = false,
	directory = false,
	description = 'Select file(s)',
	signal,
} = {}) {
	if (signal instanceof AbortSignal && signal.aborted) {
		throw signal.reason;
	} else {
		return await lock('file-picker', async () => {
			const { resolve, reject, promise } = getDeferred();
			const dialog = document.createElement('dialog');
			const form = document.createElement('form');
			const input = document.createElement('input');
			const btns = document.createElement('div');
			const submit = document.createElement('button');
			const reset = document.createElement('button');
			const label = document.createElement('label');
			const container = document.createElement('div');

			input.name = 'files';
			input.type = 'file';
			input.toggleAttribute('webkitdirectory', directory);

			label.textContent = description;
			label.classList.add('input-label', 'block', 'required', 'cursor-pointer');

			if (Array.isArray(accept)) {
				input.accept = accept;
			} else if (typeof accept === 'string') {
				input.accept = [accept];
			}

			dialog.classList.add('card', 'shadow');

			form.name = 'file-picker';
			input.accept = accept;
			input.multiple = multiple;
			input.required = true;
			input.classList.add('input');

			container.classList.add('form-group');
			submit.type = 'submit';
			submit.classList.add('btn', 'btn-accept', 'grow-1');
			submit.textContent = 'Ok';
			reset.type = 'reset';
			reset.classList.add('btn', 'btn-reject', 'grow-1');
			reset.textContent = 'Cancel';
			btns.classList.add('flex', 'row', 'no-wrap');
			btns.style.setProperty('margin-top', '18px');
			btns.style.setProperty('gap', '2em');
			form.addEventListener('submit', event => {
				event.preventDefault();
				const dialog = event.target.parentElement;
				resolve(Array.from(input.files));

				if (dialog.animate instanceof Function) {
					const anim = dialog.animate([{
						opacity: 1,
					}, {
						opacity: 0,
					}], {
						duration: 400,
						easing: 'ease-in-out',
						fill: 'both',
					});

					anim.finished.then(() => dialog.close());
				} else {
					dialog.close();
				}
			});

			form.addEventListener('reset', ({ target }) => {
				reject(new DOMException('The user aborted the request'));
				target.parentElement.close();
			});

			if (signal instanceof AbortSignal) {
				const callback = function callback() {
					reject(this.reason);
					signal.removeEventListener('abort', callback);
					dialog.close();
				};

				dialog.addEventListener('close', ({ target }) => {
					signal.removeEventListener('abort', callback);
					target.remove();
				});

				signal.addEventListener('abort', callback);
			} else {
				dialog.addEventListener('close', ({ target }) => target.remove());
			}

			btns.append(submit, reset);
			input.click();
			container.append(label, input);
			form.append(container, btns);
			dialog.append(form);
			document.body.append(dialog);

			if (dialog.animate instanceof Function) {
				const anim = dialog.animate([{
					opacity: 0.1,
					transform: 'scale(0.3)',
				}, {
					opacity: 1,
					transform: 'none',
				}], {
					duration: 400,
					easing: 'ease-in-out',
					fill: 'both',
					delay: 100,
				});

				dialog.showModal();
				anim.finished.then(() => input.click());
			} else {
				dialog.showModal();
				setTimeout(() => input.click(), 200);
			}

			return await promise;
		}, { signal, mode: 'exclusive' });
	}
}
