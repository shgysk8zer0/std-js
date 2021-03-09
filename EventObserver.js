const privateData = new WeakMap();

export class EventObserver {
	constructor(target, event, opts = {}) {
		if (! (target instanceof EventTarget)) {
			throw new TypeError('target must be an instance of EventTarget');
		} else if (typeof event !== 'string') {
			throw new TypeError('event must be a string');
		} else {
			const handler = event => {
				const { queue, dispatcher } = privateData.get(this);
				queue.push(event);
				dispatcher.dispatchEvent(new Event('update'));
			};

			privateData.set(this, {
				queue: [],
				event,
				opts,
				target,
				handler,
				dispatcher: new EventTarget(),
			});

			target.addEventListener(event, handler, opts);
		}
	}

	get queue() {
		if (privateData.has(this)) {
			return privateData.get(this).queue;
		} else {
			return [];
		}
	}

	get current() {
		const queue = this.queue;

		if (queue.length !== 0) {
			return queue.shift();
		} else {
			return undefined;
		}
	}

	async *generator() {
		const { dispatcher } = privateData.get(this);
		while (true) {
			if (this.queue.length === 0) {
				await new Promise(r => dispatcher.addEventListener('update', () => r(), { once: true }));
			} else {
				yield this.current;
			}
		}
	}

	async close() {
		if (privateData.has(this)) {
			const { queue, handler, target, event, opts } = privateData.get(this);
			target.removeEventListener(event, handler, opts);
			privateData.delete(this);
			return queue;
		}
	}
}
