if (('applicationCache' in window) && document.documentElement.hasAttribute('manifest')) {
	applicationCache.addEventListener('updateready', function(event) {
		if (applicationCache.status === applicationCache.UPDATEREADY) {
			applicationCache.update() && applicationCache.swapCache();
			if (confirm('A new version of this site is available. Load it?')) {
				location.reload();
			}
		}
	});
}
