if ('applicationCache' in window && document.documentElement.hasAttribute('manifest')) {
	window.addEventListener('load', function()
	{
		applicationCache.addEventListener('updateready', function (e)
		{
			if (applicationCache.status === applicationCache.UPDATEREADY) {
				applicationCache.update() && applicationCache.swapCache();
				if (confirm('A new version of this site is available. Load it?')) {
					window.location.reload();
				}
			}
		});
	});
}
