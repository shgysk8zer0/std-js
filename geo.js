import { getDeferred, callbackGenerator } from './promises.js';
import { signalAborted } from './abort.js';

export const supported = 'geolocation' in navigator;

export function watch(success, error = console.error, { maximumAge, timeout, signal, enableHighAccuracy } = {}) {
	if (! supported) {
		error(new DOMException('GeoLocation API not supported'));
		return;
	} else if (signal instanceof AbortSignal && signal.aborted) {
		error(signal.reason);
		return;
	} else {
		const id = navigator.geolocation.watchPosition(success, error, { maximumAge, timeout, enableHighAccuracy });

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', () => {
				navigator.geolocation.clearWatch(id);
				error(signal.reason);
			}, { once: true });
		}

		return id;
	}
}

export async function get({ maximumAge, timeout, signal, enableHighAccuracy } = {}) {
	if (! supported) {
		throw new DOMException('GeoLocation API not supported');
	} else if (signalAborted(signal)) {
		throw new DOMException(signal.reason);
	} else {
		const { resolve, reject, promise } = getDeferred({ signal });
		navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge, timeout, enableHighAccuracy });

		return promise;
	}
}
