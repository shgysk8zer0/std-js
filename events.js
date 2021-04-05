function getEventFeatures() {
	const el = document.createElement('div');
	const eventFeatures = {
		nativeSignal: 'AbortController' in window && AbortController.prototype.hasOwnProperty('signal'),
		signal: false,
		passive: false,
		capture: false,
		once: false,
	};

	// Use of a getter will detect support when properties are read
	const options = {
		get passive() {
			eventFeatures.passive = true;
			return true;
		},
		get signal() {
			eventFeatures.signal = true;
			return new AbortController().signal;
		},
		get capture() {
			eventFeatures.capture = true;
			return true;
		},
		get once() {
			eventFeatures.once = true;
			return false;
		},
	};

	try {
		el.addEventListener('click', null, options);
		el.removeEventListener('click', null, options);
	} catch(err) {
		console.error(err);
	}

	return Object.seal(eventFeatures);
}

export const features = getEventFeatures();
