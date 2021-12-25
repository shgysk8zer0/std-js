if (! ('crypto' in window) && 'msCrypto' in window) {
	globalThis.crypto = globalThis.msCrypto;
}

if (!('Notification' in window)) {
	globalThis.Notification = globalThis.notifications || globalThis.webkitNotifications || globalThis.oNotifications || globalThis.msNotifications || false;
}

if (!('doNotTrack' in navigator)) {
	navigator.doNotTrack = globalThis.doNotTrack || navigator.msDoNotTrack || 'unspecified';
}

if (!('indexedDB' in window)) {
	globalThis.indexedDB = globalThis.indexedDB || globalThis.mozIndexedDB || globalThis.webkitIndexedDB || globalThis.msIndexedDB || false;
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
	globalThis.requestAnimationFrame = globalThis.mozRequestAnimationFrame || globalThis.webkitRequestAnimationFrame || globalThis.msRequestAnimationFrame || false;
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
