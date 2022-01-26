import './shims/errors.js';
import './shims/array.js';
import './shims/math.js';
import './shims/match-media.js';
import './shims/promise.js';
import './shims/element.js';
import './shims/crypto.js';
import './shims/cookieStore.js';
import './shims/animation.js';
import './shims/share.js';
import './shims/appBadge.js';

if (typeof globalThis === 'undefined') {
	/* global global: true */
	if (typeof self !== 'undefined') {
		Object.defineProperty(self, 'globalThis', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: self,
		});
	} else if (typeof window !== 'undefined') {
		Object.defineProperty(Window.prototype, 'globalThis', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: window,
		});
	} else if (typeof global !== 'undefined') {
		Object.defineProperty(global, 'globalThis', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: global,
		});
	} else {
		Object.defineProperty(this, 'globalThis', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: this,
		});
	}
}

if (! ('isSecureContext' in globalThis)) {
	const hostnames = ['localhost', '127.0.0.1'];
	const HTTPS = 'https:';
	const protocols = [HTTPS, 'file:', 'wss:'];
	const hasSecureScripts = (document = globalThis.document) => {
		return [...document.scripts].every(({ src }) => {
			if (src.length === 0) {
				return true;
			} else {
				const { protocol, hostname } = new URL(src, document.baseURI);
				return protocol === HTTPS || hostname === location.hostname;
			}
		});
	};

	Object.defineProperty(globalThis, 'isSecureContext', {
		enumerable: true,
		configurable: true,
		get: function isSecureContext() {
			if (protocols.includes(location.protocol) || hostnames.includes(location.hostname)) {
				return hasSecureScripts();
			} else {
				return false;
			}
		}
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
