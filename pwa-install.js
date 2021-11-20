export const supported = 'serviceWorker' in navigator && navigator.serviceWorker.register instanceof Function;
export const controller = new AbortController();
export const signal = controller.signal;
export const aborted = new Promise(resolve => {
	if (signal.aborted) {
		resolve();
	} else {
		signal.addEventListener('abort', () => resolve(), { once: true });
	}
});

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
			aborted.then(() => {
				el.disabled = true;
				if (! resolved) {
					resolved = true;
					reject(new DOMException('Installation aborted'));
				}
			});

			el.addEventListener('click', async () => {
				const afterInstall =  new CustomEvent('afterinstallprompt');
				afterInstall.platforms = platforms;
				afterInstall.userResponse = await Promise.all([
					event.userResponse,
					event.prompt(),
				]).then(([resp]) => resp);

				el.dispatchEvent(afterInstall);
				el.disabled = true;

				if (afterInstall.userResponse === 'accepted') {
					resolved = true;
					resolve({ userResponse: afterInstall.userResponse, platforms });
					controller.abort();
				} else {
					resolved = true;
					reject(new DOMException('User aborted installation'));
					controller.abort();
				}
			}, { signal });
		});
	}
}
