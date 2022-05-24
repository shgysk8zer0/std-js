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

export async function recordGeoJSON({
	filename           = `${new Date().toISOString()}.geojson`,
	enableHighAccuracy = true,
	marker,
	maximumAge,
	signal,
	timeout,
	type               = 'application/geo+json',
} = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! (signal instanceof AbortSignal)) {
		reject(new TypeError('signal must be an instance of `AbortSignal`.'));
	} else if (signal.aborted) {
		reject(signal.reason);
	} else if (! supported) {
		reject(new DOMException('GeoLocation API not supported.'));
	} else {
		const coords = [];
		if (marker instanceof HTMLElement && marker.tagName === 'LEAFLET-MARKER' && marker.closest('leaflet-map') instanceof HTMLElement) {
			watch(
				({ coords: { latitude, longitude }}) => {
					coords.push([longitude, latitude]);
					marker.geo = { latitude, longitude };
					marker.closest('leaflet-map').flyTo({ latitude, longitude });
				},
				err => console.error(err),
				{ signal, enableHighAccuracy, maximumAge, timeout },
			);
		} else {
			watch(
				({ coords: { latitude, longitude }}) => coords.push([longitude, latitude]),
				err => console.error(err),
				{ signal, enableHighAccuracy, maximumAge, timeout },
			);
		}

		signal.addEventListener('abort', () => {
			if (coords.length === 0) {
				reject(new DOMException('No coordinates recorded.'));
			} else {
				if (marker instanceof HTMLElement && marker.tagName === 'LEAFLET-MARKER') {
					marker.remove();
				}

				const geo = JSON.stringify({
					'type': 'FeatureCollection',
					'features': [
						{
							'type': 'Feature',
							'geometry': {
								'type': 'LineString',
								'coordinates': coords,
							},
							'properties': {
								'generated': new Date().toISOString(),
							},
						}
					]
				}, null, 4);

				const file = new File([geo], filename, { type });
				console.log(file);
				resolve(file);
			}
		});
	}

	return promise;
}
