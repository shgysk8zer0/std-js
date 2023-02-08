import { createElement } from './elements.js';
import { getDeferred } from './promises.js';

export async function showDialog(err, { signal, level = 'info' } = {}) {
	const { resolve, promise, reject } = getDeferred();
	const id = crypto.randomUUID();

	if (! (err instanceof Error)) {
		reject(new TypeError('`showError` expects the first argument to be an Error.'));
	} else if (signal instanceof AbortSignal && signal.aborted) {
		resolve();
	} else {
		const dialog = createElement('dialog', {
			id,
			events: {
				close: ({ target }) => {
					target.remove();
					resolve();
				},
			},
			children: [
				createElement('p', { text: err.message, classList: ['status-box', level] }),
				createElement('div', {
					classList: ['flex', 'row', 'space-around'],
					children: [
						createElement('button' ,{
							type: 'button',
							events: { click: ({ target }) => target.closest('dialog').close() },
							classList: ['btn', 'btn-primary'],
							text: 'Close',
						}),
					],
				}),
			],
		});

		document.body.append(dialog);
		dialog.showModal();

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', () => {
				const dialog = document.getElementById(id);
				if (dialog instanceof Element && dialog.open) {
					dialog.close();
				}
			}, { once: true });
		}
	}

	await promise;
}
