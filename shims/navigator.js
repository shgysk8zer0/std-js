import './locks.js';
import './share.js';
import './appBadge.js';

if (! Navigator.prototype.hasOwnProperty('pdfViewerEnabled')) {
	Object.defineProperty(navigator, 'pdfViewerEnabled', {
		enumerable: true,
		configurable: false,
		writable: false,
		value: false,
	});
}

if (! (Navigator.prototype.getInstalledRelatedApps instanceof Function)) {
	Navigator.prototype.getInstalledRelatedApps = async () => [];
}

if (! (Navigator.prototype.getGamepads instanceof Function)) {
	Navigator.prototype.getGamepads = () => [];
}

if (! ('hardwareConcurrency' in Navigator.prototype)) {
	Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
		get: () => 1,
	});
}

if (! ('connection' in Navigator.prototype)) {
	Object.defineProperty(Navigator.prototype, 'connection', {
		get: () => Object.create(EventTarget.prototype, {
			type: { value: 'unknown' },
			effectiveType: { value: '4g' },
			rtt: { value: NaN },
			downlink: { value: NaN },
			downlinkMax: { value: Infinity },
			saveData: { value: false },
			onchange: { value: null, writable: true },
			ontypechange: { value: null, writable: true },
		})
	});
} else if (! ('type' in navigator.connection)) {
	navigator.connection.type = 'unknown';
}

if (! ('doNotTrack' in Navigator.prototype)) {
	Object.defineProperty(Navigator.prototype, 'doNotTrack', {
		get: () => 'unspecified',
	});
}

if (! ('globalPrivacyControl' in Navigator.prototype)) {
	Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', {
		get: () => false,
	});
}
