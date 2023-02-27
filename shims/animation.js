(function() {
	'use strict';

	if (globalThis.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('finished')) {
		Object.defineProperty(Animation.prototype, 'finished', {
			get: function() {
				return new Promise((resolve, reject) => {
					if (this.playState === 'finished') {
						resolve(this);
					} else {
						this.addEventListener('finish', () => resolve(this), { once: true });
						this.addEventListener('error', event => reject(event), { once: true });
					}
				});
			}
		});
	}

	if (globalThis.hasOwnProperty('Animation') && ! Animation.prototype.hasOwnProperty('ready')) {
		Object.defineProperty(Animation.prototype, 'ready', {
			get: function() {
				return new Promise((resolve, reject) => {
					if (! this.pending) {
						resolve(this);
					} else {
						this.addEventListener('ready', () => resolve(this), { once: true });
						this.addEventListener('error', event => reject(event), { once: true });
					}
				});
			}
		});
	}
})();
