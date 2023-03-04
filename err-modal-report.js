import { createElement } from './elements.js';
import { getDeferred } from './promises.js';
import { getType } from './utility.js';

export async function errorHandler(err, { signal } = {}) {
	await navigator.locks.request(
		'err-modal-reporter',
		{ mode: 'exclusive', signal },
		async () => {
			const { resolve, reject, promise } = getDeferred();

			if (signal instanceof AbortSignal && signal.aborted) {
				reject(signal.reason);
			} else if (! (err instanceof ErrorEvent)) {
				throw new TypeError(`Expected an ErrorEvent but got a ${getType(err)}`);
			} else {
				const controller = new AbortController();

				const dialog = createElement('dialog', {
					events: {
						close: ({ target }) => {
							target.remove();
							resolve();
							controller.abort();
						}
					},
					children: [
						createElement('pre', {
							children: [
								createElement('code', {
									text: `[${err.error.name}] "${err.message}" in ${err.filename}:${err.lineno}:${err.colno}`
								})
							]
						}),
						createElement('div', {
							classList: ['flex', 'row', 'space-evenly'],
							children: [
								createElement('button', {
									classList: ['bnt', 'btn-primary'],
									text: 'Close',
									events: {
										click: ({ target }) => target.closest('dialog').close(),
									}
								})
							]
						})
					]
				});

				if (signal instanceof AbortSignal) {
					signal.addEventListener('abort', ({ target }) => {
						reject(target.reason);
						controller.abort(target.reason);
						dialog.close();
					}, { once: true, signal: controller.signal });
				}

				document.body.append(dialog);
				dialog.showModal();
				await promise;
			}
		}
	);
}
