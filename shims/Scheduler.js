export const PRIORITIES = {
	blocking: 'user-blocking',
	visible: 'user-visible',
	background: 'background',
};

async function delayCallback(cb, { delay = 0, signal } = {}) {
	return new Promise((resolve, reject) => {
		if (signal instanceof AbortSignal && signal.aborted) {
			reject(signal.reason);
		} else {
			const controller = new AbortController();
			const handle = setTimeout(() => {
				resolve(cb());
				controller.abort();
			}, delay);

			if (signal instanceof AbortSignal) {
				signal.addEventListener('abort', ({ target }) => {
					reject(target.reason);
					clearTimeout(handle);
				}, { once: true, signal: controller.signal });
			}
		}
	});
}

export class Scheduler {
	async postTask(callback, {
		priority = PRIORITIES.visible,
		delay,
		signal,
	} = {}) {
		return new Promise((resolve, reject) => {
			if (signal instanceof AbortSignal && signal.aborted) {
				reject(signal.reason);
			} else {
				switch(priority) {
					case PRIORITIES.blocking:
						if (typeof delay === 'number' && ! Number.isNaN(delay) && delay > 0) {
							delayCallback(callback, { delay, signal })
								.then(resolve, reject);
						} else {
							resolve((async () => await callback())());
						}

						break;

					case PRIORITIES.visible:
						if (typeof delay === 'number' && ! Number.isNaN(delay) && delay > 0) {
							delayCallback(() => requestAnimationFrame(callback), { delay, signal })
								.then(resolve, reject);
						} else {
							const controller = new AbortController();
							const handle = requestAnimationFrame(() => {
								resolve(callback());
								controller.abort();
							});

							if (signal instanceof AbortSignal) {
								signal.addEventListener('abort', ({ target }) => {
									cancelAnimationFrame(handle);
									reject(target.reason);
								}, { once: true, signal: controller.signal });
							}
						}

						break;

					case PRIORITIES.background:
						if (typeof delay === 'number' && ! Number.isNaN(delay) && delay > 0) {
							delayCallback(() => requestIdleCallback(callback), { delay, signal })
								.then(resolve, reject);
						} else {
							const controller = new AbortController();
							const handle = requestIdleCallback(() => {
								resolve(callback());
								controller.abort();
							});

							if (signal instanceof AbortSignal) {
								signal.addEventListener('abort', ({ target }) => {
									cancelIdleCallback(handle);
									reject(target.reason);
								}, { once: true, signal: controller.signal });
							}
						}

						break;

					default:
						throw new TypeError(`Scheduler.postTask: '${priority}' (value of 'priority' member of SchedulerPostTaskOptions) is not a valid value for enumeration TaskPriority.`);
				}
			}
		});
	}
}

if (! ('scheduler' in globalThis)) {
	globalThis.scheduler = new Scheduler();
}
