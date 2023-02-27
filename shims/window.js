(function() {
	'use strict';

	if ('screen' in globalThis && ! (globalThis.getScreenDetails instanceof Function)) {
		class ScreenDetailed extends EventTarget {
			get availHeight() {
				return screen.availHeight;
			}

			get availLeft() {
				return screen.availLeft;
			}

			get availTop() {
				return screen.availTop;
			}

			get availWidth() {
				return screen.availWidth;
			}

			get colorDepth() {
				return screen.colorDepth;
			}

			get devicePixelRatio() {
				return globalThis.devicePixelRatio || 1;
			}

			get height() {
				return screen.height;
			}

			get isExtended() {
				return screen.isExtended;
			}

			get isInternal() {
				return true;
			}

			get isPrimary() {
				return true;
			}

			get label() {
				return 'Unknown';
			}

			get orientation() {
				return screen.orientation;
			}

			get pixelDepth() {
				return screen.pixelDepth;
			}

			get top() {
				return screen.top;
			}

			get width() {
				return screen.width;
			}
		}

		class ScreenDetails extends EventTarget {
			get currentScreen() {
				return new ScreenDetailed();
			}

			get screens() {
				return [this.currentScreen];
			}
		}

		Object.defineProperty(Screen.prototype, 'isExtended', {
			enumerable: true,
			configurable: true,
			get: () => false,
		});

		globalThis.getScreenDetails = async () => new ScreenDetails();
	}
})();
