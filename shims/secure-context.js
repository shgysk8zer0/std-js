(function() {
	'use strict';

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
})();
