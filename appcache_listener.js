if (('applicationCache' in window) && document.documentElement.hasAttribute('manifest')) {
	applicationCache.addEventListener('updateready', function() {
		'use strict';
		if (this.status === this.UPDATEREADY) {
			this.update();
			this.swapCache();
			if (confirm('A new version of this site is available. Load it?')) {
				location.reload();
			}
		}
	});
}
