if (! ('crypto' in window) && 'msCrypto' in window) {
	window.crypto = window.msCrypto;
}

if (!('Notification' in window)) {
	window.Notification = window.notifications || window.webkitNotifications || window.oNotifications || window.msNotifications || false;
}

if (!('doNotTrack' in navigator)) {
	navigator.doNotTrack = window.doNotTrack || navigator.msDoNotTrack || 'unspecified';
}

if (!('indexedDB' in window)) {
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || false;
}

if (!('hidden' in document)) {
	document.hidden = document.webkitHidden || document.msHidden || document.mozHidden || false;
}

if (!('visibilityState' in document)) {
	document.visibilityState = document.webkitVisibilityState || document.msVisibilityState || document.mozVisibilityState || 'visible';
}

if (!('fullscreenElement' in document)) {
	document.fullscreenElement = document.mozFullScreenElement || document.webkitFullscreenElement || false;
}

if (!('requestAnimationFrame' in window)) {
	window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || false;
}

if (!('exitFullscreen' in Document.prototype)) {
	Document.prototype.exitFullscreen = document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msCancelFullScreen || false;
}

if (!('requestFullscreen' in HTMLElement.prototype)) {
	HTMLElement.prototype.requestFullscreen = HTMLElement.prototype.requestFullScreen || HTMLElement.prototype.mozRequestFullScreen || HTMLElement.prototype.webkitRequestFullScreen || false;
}

if (!('fullscreen' in Document.prototype)) {
	Object.defineProperty(Document.prototype, 'fullscreen', {
		get:() => document.fullscreenElement instanceof Element,
	});
}
