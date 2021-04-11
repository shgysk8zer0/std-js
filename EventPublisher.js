const observers = new WeakMap();

export class EventPublisher extends EventTarget {
	publishEvents(...events) {
		const controller = new AbortController();
		observers.set(this, { subscribers: new Map(), controller });

		events.forEach(event => {
			this.addEventListener(event, event => {
				Array.from(observers.get(this).subscribers.entries()).forEach(([subscriber, events = new Set()]) => {
					if (events.has(event.type)) {
						subscriber.receivePublishedEvent({event, publisher: this });
					}
				});
			}, { passive: true, signal: controller.signal });
		});
	}

	addSubscription(target, ...events) {
		if (target.receivePublishedEvent instanceof Function) {
			const subscribers = observers.get(this).subscribers;

			if (subscribers.has(target)) {
				subscribers.set(target, new Set([...subscribers.get(target), ...events]));
			} else {
				subscribers.set(target, new Set(events));
			}
		} else {
			throw new TypeError('Subscribers must implement a `receivePublishedEvent({ event, publisher })` method');
		}
	}

	removeSubscription(target, ...events) {
		if (events.length === 0) {
			return observers.get(this).subscribers.delete(target);
		} else {
			const { subscribers, controller } = observers.get(this);

			if (subscribers.has(target)) {
				const subscriptions = subscribers.get(target);
				events.forEach(event => subscriptions.delete(event));

				if (subscriptions.size === 0) {
					this.removeSubscription(target)
				} else {
					subscribers.set(target, subscriptions);
				}
			}
		}
	}

	abortSubscriptions() {
		const controller = observers.get(this).controller;

		if (! controller.signal.aborted) {
			controller.abort();
			this.dispatchEvent(new Event('abortsubscriptions'));
			observers.set(this, { subscribers: new Map(), controller });
		}
	}
}
