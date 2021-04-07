import { getDeferred, callbackGenerator } from './promises.js';
import { signalAborted } from './abort.js';

export const supported = 'geolocation' in navigator;

export async function *watch({ maximumAge, timeout, signal, enableHighAccuracy }) {
	if (! supported || ! (navigator.geolocation.watchPosition instanceof Function)) {
		throw new DOMException('GeoLocation API not supported');
	} else if (signal instanceof AbortSignal && signal.aborted === true) {
		throw new DOMException('Operation aborted');
	} else {
		const { callback, generator } = callbackGenerator();
		const { promise, reject } = getDeferred({ signal });
		const id = navigator.geolocation.watchPosition(callback, reject, { maximumAge, timeout, enableHighAccuracy});
		let error;
		promise.catch(err => error = err);

		if (signal instanceof AbortSignal) {
			signalAborted(signal).finally(() => navigator.geolocation.clearWatch(id));
		}

		for await (const result of generator({ signal })) {
			if (typeof error === 'undefined') {
				yield result;
			} else if (signal instanceof AbortSignal && signal.aborted) {
				break;
			} else {
				throw error;
			}
		}
	}
}

export async function get({ maximumAge, timeout, signal, enableHighAccuracy } = {}) {
	if (! supported || ! (navigator.geolocation.getCurrentPosition instanceof Function)) {
		throw new DOMException('GeoLocation API not supported');
	} else if (signal instanceof AbortSignal && signal.aborted === true) {
		throw new DOMException('Operation aborted');
	} else {
		const { resolve, reject, promise } = getDeferred();
		if (signal instanceof AbortSignal) {
			signalAborted(signal).finally(() => reject(new DOMException('Operation aborted')));
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge, timeout, enableHighAccuracy });
		return promise;

	}
}
