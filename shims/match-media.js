(function() {
	'use strict';

	if (! ('MediaQueryListEvent' in globalThis)) {
		/**
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryListEvent
		 */
		globalThis.MediaQueryListEvent = class MediaQueryListEvent extends Event {
			constructor(type, { media, matches } = {}) {
				super(type);
				Object.defineProperties(this, {
					'media': {
						enumerable: true,
						configurable: false,
						writable: false,
						value: media,
					},
					'matches': {
						enumerable: true,
						configurable: false,
						writable: false,
						value: matches,
					},
				});
			}
		};
	}

	if ('MediaQueryList' in globalThis && ! (globalThis.MediaQueryList.prototype.addEventListener instanceof Function)) {
		const targets = new WeakMap();

		const listener = function listener() {
			const { media, matches } = this;
			this.dispatchEvent(new MediaQueryListEvent('change', { media, matches }));
		};

		const init = function init(mql) {
			if (! targets.has(mql)) {
				targets.set(mql, new EventTarget());
				mql.addListener(listener.bind(mql));
			}

			return targets.get(mql);
		};

		globalThis.MediaQueryList.prototype.addEventListener = function addEventListener(type, callback, opts) {
			init(this).addEventListener(type, callback, opts);
		};

		globalThis.MediaQueryList.prototype.removeEventListener = function removeEventListner(type, callback, opts) {
			init(this).removeEventListener(type, callback, opts);
		};

		globalThis.MediaQueryList.prototype.dispatchEvent = function dispatchEvent(event) {
			init(this).dispatchEvent(event);
		};
	}
})();
