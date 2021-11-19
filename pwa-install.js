export const controller = new AbortController();

export const signal = controller.signal;

export const supported = 'serviceWorker' in navigator && navigator.serviceWorker.register instanceof Function;

export const promise = new Promise((resolve, reject) => {
	if (! supported) {
		controller.abort();
		reject(new DOMException('Service Worker not supported'));
	} else {
		globalThis.addEventListener('beforeinstallprompt', event => {
			resolve(event);
		}, { signal, once: true });

		controller.signal.addEventListener('abort', () => {
			reject(new DOMException('Installation aborted'));
		}, { once: true });
	}
});

export async function registerButton(el) {
	if (! (el instanceof HTMLButtonElement)) {
		throw new DOMException('Not a <button>');
	} else if (signal.aborted) {
		el.disabled = true;
		throw new DOMException('PWA installation aborted');
	} else {
		el.disabled = true;
		const event = await promise;
		const platforms = event.platforms;
		el.disabled = false;

		return await new Promise((resolve, reject) => {
			let resolved = false;
			const installController = new AbortController();
			signal.addEventListener('abort', () => {
				el.disabled = true;
				installController.abort();
			}, { once: true });

			installController.signal.addEventListener('abort', () => {
				el.disabled = true;
				if (! controller.signal.aborted) {
					controller.abort();
				}
				if (! resolved) {
					reject(new DOMException('Installation aborted'));
					resolved = true;
				}
			}, { signal, once: true });

			el.addEventListener('click', async () => {
				const [outcome] = await Promise.all([
					event.userResponse,
					event.prompt(),
				]);


				el.dispatchEvent(new CustomEvent('afterinstallprompt', { detail: outcome }));
				el.disabled = true;

				if (outcome === 'accepted') {
					resolve({ outcome, platforms });
				} else {
					reject(new DOMException('User aborted installation'));
					resolved = true;
				}

				resolved = true;
				requestIdleCallback(() => controller.abort());
			}, { signal });

			signal.addEventListener('abort', () => {
				if (! resolved) {
					reject(new DOMException('Installation aborted'));
				}
				installController.abort();
			}, { once: true });
		})
	}
}
