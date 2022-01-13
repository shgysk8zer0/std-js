import './shims/errors.js';
import './shims/array.js';
import './shims/promise.js';
import './shims/element.js';
import './shims/crypto.js';
import './shims/cookieStore.js';
import './shims/animation.js';
import './shims/dialog.js';
import './shims/math.js';
import './shims/share.js';
import './shims/appBadge.js';

if (typeof globalThis === 'undefined') {
	/* global global: true */
	if (typeof self !== 'undefined') {
		self.globalThis = self;
	} else if (typeof window !== 'undefined') {
		window.globalThis = window;
	} else if (typeof global !== 'undefined') {
		global.globalThis = global;
	}
}

if (! ('isSecureContext' in globalThis)) {
	Object.defineProperty(Object.getPrototypeOf(globalThis), 'isSecureContext', {
		enumerable: true,
		configurable: false,
		get: () => location.protocol === 'https:',
	});
}

if (! (globalThis.requestIdleCallback instanceof Function)) {
	globalThis.requestIdleCallback = function(callback, { timeout = 50 } = {}) {
		const now = Date.now();

		return requestAnimationFrame(function() {
			const idle = {
				timeRemaining: function() {
					return Math.max(0, timeout - (Date.now() - now));
				}
			};

			idle.didTimeout = idle.timeRemaining() === 0;

			callback(idle);
		});
	};
}

if (! ( globalThis.cancelIdleCallback instanceof Function)) {
	globalThis.cancelIdleCallback = function(id) {
		cancelAnimationFrame(id);
	};
}

if (! (globalThis.queueMicrotask instanceof Function)) {
	globalThis.queueMicrotask = cb => Promise.resolve().then(cb)
		.catch(e => setTimeout(() => { throw e; }));
}

if (! (Object.fromEntries instanceof Function)) {
	Object.fromEntries = function(arr) {
		if (Array.isArray(arr)) {
			return arr.reduce((obj, [key, val]) => {
				obj[key] = val;
				return obj;
			}, {});
		} else {
			return Object.fromEntries(Array.from(arr));
		}
	};
}

if (! (navigator.getInstalledRelatedApps instanceof Function)) {
	navigator.getInstalledRelatedApps = async () => [];
}

if (! ('connection' in navigator)) {
	navigator.connection = Object.freeze({
		type: 'unknown',
		effectiveType: '4g',
		rtt: NaN,
		downlink: NaN,
		downlinkMax: Infinity,
		saveData: false,
		onchange: null,
		ontypechange: null,
		addEventListener: () => null,
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
