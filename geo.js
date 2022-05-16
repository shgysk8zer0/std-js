import { getDeferred } from './promises.js';

export const supported = 'geolocation' in navigator;

export function watch(success, error = console.error, { maximumAge, timeout, signal, enableHighAccuracy } = {}) {
	if (! supported) {
		error(new DOMException('GeoLocation API not supported'));
		return;
	} else if (signal instanceof AbortSignal && signal.aborted) {
		error(signal.reason || new DOMException('Operation aborted.'));
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
	const { resolve, reject, promise } = getDeferred({ signal });

	if (! supported) {
		reject(new DOMException('GeoLocation API not supported'));
	} else if (! (signal instanceof AbortSignal && signal.aborted)) {
		navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge, timeout, enableHighAccuracy });
	}
	return promise;
}
