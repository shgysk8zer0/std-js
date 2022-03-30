if ('screen' in globalThis && ! (globalThis.getScreenDetails instanceof Function)) {
	class ScreenDetailed extends Screen {
		get isPrimary() {
			return true;
		}

		get isInternal() {
			return true;
		}

		get label() {
			return 'Unknown';
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

	globalThis.getScreenDetails = async () => new ScreenDetails();

	Object.defineProperty(Screen.prototype, 'isExtended', {
		enumerable: true,
		configurable: true,
		get: () => false,
	});
}
