export default function dePrefix() {
	if (!('Notification' in window)) {
		window.Notification = window.notifications || window.webkitNotifications || window.oNotifications || window.msNotifications || false;
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
	if (!('fullScreenElement' in document)) {
		document.fullScreenElement = document.mozFullScreenElement || document.webkitFullscreenElement || false;
	}
	if (!('requestAnimationFrame' in window)) {
		window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || false;
	}
	if (!('cancelFullScreen' in document)) {
		document.cancelFullScreen = document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msCancelFullScreen || false;
	}
	if (!('requestFullScreen' in HTMLElement.prototype)) {
		HTMLElement.prototype.requestFullScreen = HTMLElement.prototype.mozRequestFullScreen || HTMLElement.prototype.webkitRequestFullScreen || false;
	}
}
if (!('Notification' in window)) {
	window.Notification = window.notifications || window.webkitNotifications || window.oNotifications || window.msNotifications || false;
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
if (!('fullScreenElement' in document)) {
	document.fullScreenElement = document.mozFullScreenElement || document.webkitFullscreenElement || false;
}
if (!('requestAnimationFrame' in window)) {
	window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || false;
}
if (!('cancelFullScreen' in document)) {
	document.cancelFullScreen = document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msCancelFullScreen || false;
}
if (!('requestFullScreen' in HTMLElement.prototype)) {
	HTMLElement.prototype.requestFullScreen = HTMLElement.prototype.mozRequestFullScreen || HTMLElement.prototype.webkitRequestFullScreen || false;
}
