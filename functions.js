"use strict";
var body = document.body,
	html = document.documentElement,
	prefixes = ['', '-moz-', '-webkit-', '-o-', '-ms-'];
if (!window.Element) {
	/*Fix IE not allowing Element.prototype*/
	Element = function () {
	};
}
if(!('showModal' in Element.prototype)) {
	Element.prototype.show = function() {
		this.setAttribute('open', '');
	};
	Element.prototype.showModal = function() {
		var backdrop = document.createElement('div');
		backdrop.classList.add('backdrop');
		$('dialog[open]').each(function(dialog) {
			dialog.close();
		});
		this.after(backdrop);
		this.classList.add('modal');
		this.show();
	};
	Element.prototype.close = function() {
		this.removeAttribute('open');
		this.classList.remove('modal');
		if(this.nextElementSibling.classList.contains('backdrop')) {
			this.nextElementSibling.parentElement.removeChild(this.nextElementSibling);
		}
	};
	Element.prototype.HTMLimport = function() {
		if (supports('HTMLimports')) {
			var imported = document.querySelector(
				'link[rel=import][name="' + this.dataset.import + '"]'
			);

			if (this.hasAttribute('data-selector')) {
				this.appendChild(imported.import.querySelector(this.dataset.selector));
			} else {
				this.appendChild(imported.import.body.firstChild);
			}
		}
	};
}
if ( !String.prototype.contains ) {
	String.prototype.contains = function() {
		return String.prototype.indexOf.apply( this, arguments ) !== -1;
	};
}
if (!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function (searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		}
	});
}
if (!String.prototype.endsWith) {
	Object.defineProperty(String.prototype, 'endsWith', {
		value: function (searchString, position) {
			var subjectString = this.toString();
			if (position === undefined || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.indexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		}
	});
}
(function(root) {
	if (!root.CSS) {
		root.CSS = {};
	}
		var CSS = root.CSS;
		var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';
	if(!CSS.supports) {
		CSS.supports = function (prop, value) {
			var el = document.createElement('div');
			el.style = prop + ":" + value;
			return (getComputedStyle(el)[prop] === value);
		};
	}
	if (!CSS.escape) {
		CSS.escape = function(value) {
			var string = String(value), length = string.length, index = -1, codeUnit, result = '', firstCodeUnit = string.charCodeAt(0);
			while (++index < length) {
				codeUnit = string.charCodeAt(index);
				if (codeUnit == 0x0000) {
					throw new InvalidCharacterError('Invalid character: the input contains U+0000.');
				}
				if (
					(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
					(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
					(
						index == 1 &&
						codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
						firstCodeUnit == 0x002D
					)
				) {
					result += '\\' + codeUnit.toString(16) + ' ';
					continue;
				}
				if (
					codeUnit >= 0x0080 ||
					codeUnit == 0x002D ||
					codeUnit == 0x005F ||
					codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
					codeUnit >= 0x0041 && codeUnit <= 0x005A ||
					codeUnit >= 0x0061 && codeUnit <= 0x007A
				) {
					result += string.charAt(index);
					continue;
				}
				result += '\\' + string.charAt(index);
			}
			return result;
		};
	}
	CSS.supports = function (prop, value) {
		var el = document.createElement('div');
		el.style = prop + ":" + value;
		return (getComputedStyle(el)[prop] === value);
	};
}(typeof global != 'undefined' ? global : this));
DOMTokenList.prototype.pick = function(cname1, cname2, condition) {
	(condition) ? this.add(cname1) : this.add(cname2);
};
DOMTokenList.prototype.swap = function(cname1, cname2) {
	if(this.contains(cname1)) {
		this.remove(cname1);
		this.add(cname2);
	}
	else {
		this.remove(cname2);
		this.add(cname1);
	}
};
if (!Element.prototype.matches) {
	/*Check if Element matches a given CSS selector*/
	Element.prototype.matches = function (sel) {
		try {
			if (html.mozMatchesSelector) {
				return this.mozMatchesSelector(sel);
			}
			else if (html.webkitMatchesSelector) {
				return this.webkitMatchesSelector(sel);
			}
			else if (html.oMatchesSelector) {
				return this.oMatchesSelector(sel);
			}
			else if (html.msMatchesSelector) {
				return this.msMatchesSelector(sel);
			}
			else {
				return ($(sel) .indexOf(this) !== -1);
			}
		}
		catch(e) {
			return ($(sel) .indexOf(this) !== -1);
		}
	};
}
Array.prototype.unique = function() {
	return this.filter(
		function(val, i, arr) {
			return (i <= arr.indexOf(val));
		}
	);
};
Array.prototype.end = function() {
	return this[this.length - 1];
};
HTMLCollection.prototype.indexOf = Array.prototype.indexOf;
function selection() {
	var selected = getSelection();
	//this.target = selected.focusNode;
	this.start = selected.anchorOffset;
	this.end = selected.focusOffset;
	this.length = this.end - this.start;
	this.parent = selected.anchorNode;
	this.before = this.parent.textContent.substring(0, this.start);
	this.after = this.parent.textContent.substring(this.end);
	this.text = selected.focusNode.textContent.substring(this.start, this.end);
}
selection.prototype.constructor = selection;
selection.prototype.replace = function(rep) {
	this.parent.innerHTML = this.before + rep + this.after;
};
RegExp.prototype.escape = function(){
	return this.source.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};
/*===========================De-Prefix several JavaScript methods==========================================================================*/

if (!('Notification' in window)) {
	/*Notification = mozNotification || false;*/
	if('mozNotification' in window) {
		Notification = mozNotification;
	}
}
if (!('notifications' in window)) {
	window.notifications = window.webkitNotifications || window.oNotifications || window.msNotifications || false;
}
if (!('indexedDB' in window)) {
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || false;
}
if (!('hidden' in document)) {
	document.hidden = function () {
		return document.webkitHidden || document.msHidden || document.mozHidden || false;
	};
}
if (!('visibilityState' in document)) {
	document.visibilityState = document.webkitVisibilityState || document.msVisibilityState || document.mozVisibilityState || false;
}
if (!('fullScreenElement' in document)) {
	document.fullScreenElement = document.mozFullScreenElement || document.webkitFullscreenElement || false;
}
//document.fullscreen = document.fullscreen || document.mozFullScreen || document.webkitFullscreen || false;

if (!('requestAnimationFrame' in window)) {
	window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || false;
}
if (!('cancelFullScreen' in document)) {
	document.cancelFullScreen = document.mozCancelFullScreen || document.webkitCancelFullScreen || document.msCancelFullScreen || false;
}
if (!('requestFullScreen' in document)) {
	Element.prototype.requestFullScreen = function () {
		return this.mozRequestFullScreen() || this.webkitRequestFullScreen() || false;
	};
}
/*===============================================================================================================================================*/
Object.prototype.isaN = function () {
	return parseFloat(this) == this;
};
Object.prototype.camelCase = function () {
	return this.toLowerCase() .replace(/\ /g, '-') .replace(/-(.)/g, function (match, group1) {
		return group1.toUpperCase();
	});
};
Element.prototype.delete = function() {
	this.parentElement.removeChild(this);
};
Element.prototype.after = function () {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string') ? this.insertAdjacentHTML('afterend', arguments[i]) : this.parentElement.insertBefore(arguments[i], this.nextSibling);
	}
	return this;
};
Element.prototype.before = function() {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string') ? this.insertAdjacentHTML('beforebegin', arguments[i]) : this.parentElement.insertBefore(arguments[i], this);
	}
	return this;
};
Element.prototype.prepend = function() {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string') ? this.insertAdjacentHTML('afterbegin', arguments[i]) : this.insertBefore(arguments[i], this.firstChild);
	}
	return this;
};
Element.prototype.append = function() {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string') ? this.insertAdjacentHTML('beforeend', arguments[i]) : this.appendChild(arguments[i]);
	}
	return this;
};
Element.prototype.clone = function() {
	return this.cloneNode(true);
};
Element.prototype.next = function (){
	return this.nextSibling;
};
Element.prototype.prev = function (){
	return this.previousSibling;
};
Element.prototype.html = function(html) {
	this.innerHTML = html;
	return this;
};
Element.prototype.ancestor = function (sel) {
	if(this.parentElement.matches(sel)) {
		return this.parentElement;
	}
	else if(this === document.body) {
		return false;
	}
	else {
		return this.parentElement.ancestor(sel);
	}
};
Element.prototype.data = function(set, value) {
	var val = null;
	if(supports('dataset')){
		(typeof value !== 'undefined') ? this.dataset[set.camelCase()] = value : val = this.dataset[set.camelCase()];
	}
	else {
		(typeof value !== 'undefined') ? this.setAttribute('data-' + set, value): val = this.getAttribute('data-' + set);
	}
	return val;
};
Element.prototype.attr = function(attr, val) {
	switch(typeof val) {
		case 'string': {
			this.setAttribute(attr, val);
			return this;
		} break;
		case 'boolean': {
			(val) ? this.setAttribute(attr, '') : this.removeAttribute(attr);
			return this;
			} break;
		default:
			return this.getAttribute(attr);
	}
};
Element.prototype.uniqueSelector = function () {
	if (this.nodeType !== 1) {
		return null;
	}
	var path = [],
	current = this;
	while (current !== document.documentElement) {
		if(current === document.body) {
			path.push('body');
			break;
		}
		else if(current.hasAttribute('id')) {
			path.push('#' + current.id);
			break;
		}
		path.push(current.tagName.toLowerCase() + ':nth-child(' + (current.parentElement.children.indexOf(current) + 1).toString() + ')');
		current = current.parentElement;
	}
	return path.reverse() .join(' > ');
};
Element.prototype.ajax = function(args) {
	ajax(args).then(
		this.html.bind(this),
		console.error
	);
	return this;
};
Element.prototype.wordCount = function() {
	return this.textContent.split(' ').length;
};
function notify(options) {
	/*Creates a notification, with alert fallback*/
	var notification;
	if (typeof options === 'string') {
		options = {
			body: options
		};
	}
	if(!options.icon) {
		options.icon = 'images/icons/info.png';
	}
	if ('Notification' in window) {
		if (Notification.permission.toLowerCase() === 'default') {
			Notification.requestPermission(function () {
				(Notification.permission.toLowerCase() === 'granted') ? notification = notify(options)  : alert(options.title || document.title + '\n' + options.body);
			});
		}
		notification = new Notification(options.title || document.title, options);
	}
	else if ('notifications' in window) {
		if (window.notifications.checkPermission != 1) {
			window.notifications.requestPermission();
		}
		notification = window.notifications.createNotification(options.icon, options.title || document.title, options.body) .show();
	}
	else {
		alert(options.title || document.title + '\n' + options.body);
	}
	if (!!notification) {
		(!!options.onclick) ? notification.onclick = options.onclick : null;
		(!!options.onshow) ? notification.onshow = options.onshow : null;
		(!!options.onclose) ? notification.onclose = options.onclose : null;
		(!!options.onerror) ? notification.onerror = options.onerror : notification.onerror = function (error) {
			console.error(error);
		};
		return notification;
	}
}
/*AppCache updater*/
/*$(window) .load(function (e) { *//*Check for appCache updates if there is a manifest set*/
window.addEventListener('load', function () {
	/**
	*TODO Should I check for manifest on anything but <html>?
	*		Could use (!!$('[manifest]').length) instead.
	*/
	if ((!!window.applicationCache) && typeof html.getAttribute('manifest') === 'string') {
		var appCache = window.applicationCache;
		$(appCache) .updateready(function (e) {
			if (appCache.status == appCache.UPDATEREADY) {
				appCache.update() && appCache.swapCache();
				if (confirm('A new version of this site is available. Load it?')) {
					window.location.reload();
				}
			}
		});
	}
});
function getLocation(options) {
	/*https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition*/
	if (typeof options === 'undefined') {
		options = {};
	}
	return new Promise(function(success, fail){
		if (!('geolocation' in navigator)) {
			fail('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(success, fail, options);
	});
}
function supports(type) {
	/*Feature detection. Returns boolean value of suport for type*/
	/**
	* A series of tests to determine support for a given feature
	* Defaults to testing support for an element of tag (type)
	* Which works by testing if the browser considers it unknown element type
	*/
	type = type.toLowerCase();
	if(sessionStorage.hasOwnProperty('Supports_' + type)) {
		return sessionStorage.getItem('Supports_' + type) == 'true';
	}
	var supports = false,
	prefixes = [
		/*Array of vendor prefixes*/
		'',
		'moz',
		'webkit',
		'ms',
		'o'
	],
	/*Shorten for CSS properties*/
	style = document.documentElement.style;
	supportsTest:
	switch (type) {
		case 'queryselectorall': {
			supports = ('querySelectorAll' in document);
		} break;
		case 'svg': {
			supports = (document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Shape', '1.1'));
		} break;
		case 'dataset': {
			supports = ('DOMStringMap' in window);
		} break;
		case 'htmlimports' : {
			supports = ('import' in document.createElement('link'));
		} break;
		case 'geolocation': {
			supports = ('geolocation' in navigator);
		} break;
		case 'connectivity': {
			supports = ('onLine' in navigator);
		} break;
		case 'visibility': {
			supports = ('visibilityState' in document) || ('webkitVisibilityState' in document);
		} break;
		case 'validity': {
			supports = (!!document.createElement('input') .validity);
		} break;
		case 'fonts': {
			supports = ('CSSFontFaceRule' in window);
		} break;
		case 'csssupports': {
			supports = ('supports' in CSS);
		} break;
		case 'listeners': {
			supports = ('addEventListener' in window);
		} break;
		case 'animations': {
			supports = ((('supports' in CSS) && CSS.supports('animation', 'name') ||
				CSS.supports('-webkit-animation', 'name')) ||
				style.animation !== undefined ||
				style.webkitAnimation !== undefined ||
				style.MozAnimation !== undefined ||
				style.OAnimation !== undefined ||
				style.MsAnimationn !== undefined
			);
		} break;
		case 'transitions': {
			supports = ((('supports' in CSS) && CSS.supports('transition', 'none') ||
				CSS.supports('-webkit-transition', 'none')) ||
				style.transition !== undefined ||
				style.webkitTransition !== undefined ||
				style.MozTransition !== undefined ||
				style.OTransition !== undefined ||
				style.MsTransition !== undefined
			);
		} break;
		case 'cssgradients': {
			supports = (('supports' in CSS) && CSS.supports('background-image', 'linear-gradient(red,red)')) || (function(){
				var el = document.createElement('a');
				el.style.backgroundImage = 'linear-gradient(red, red)';
				return (!!el.style.backgroundImage);
			})();
		} break;
		case 'notifications':{
			supports = ('notifications' in window || 'Notification' in window);
		} break;
		case 'applicationcache': {
			supports = ('applicationCache' in window);
		} break;
		case 'indexeddb': {
			supports = ('indexedDB' in window);
		} break;
		case 'fullscreen':
			supports = (!!document.cancelFullScreen);
			break;
		case 'workers': {
			supports = ('Worker' in window);
		} break;
		case 'promises': {
			supports = ('Promise' in window);
		} break;
		case 'cssmatches': {
			var matches = [':matches', ':any', ':-moz-any', ':-webkit-any'], i;
			for(i = 0; i < matches.length; i++) {
				try {
					supports = Boolean(document.querySelector(matches[i] + '(body)') === document.body);
					sessionStorage.setItem('MatchesPre', matches[i]);
				}
				catch(e) {
					null;
				}
			}
		} break;
		case 'ajax': {
			supports = ('XMLHttpRequest' in window);
		} break;
		case 'cssvars': {
			supports = (!!CSS.supports('--x','x'));
		} break;
		case 'formdata': {
			supports = ('FormData' in window);
		} break;
		case 'classlist' : {
			supports = ('DOMTokenList' in window);
		} break;
		case 'localstorage': {
			supports = ('localStorage' in window);
		} break;
		case 'sessionstorage': {
			supports = ('sessionStorage' in window);
		} break;
		default: {
			supports = (document.createElement(type.toLowerCase()) .toString() !== document.createElement('DNE') .toString());
		}
	}
	sessionStorage.setItem('Supports_' + type, supports);
	return supports;
}
Element.prototype.query = function(query) {
	var els = [];
	if(this.matches(query)) {
		els.push(this);
	}
	this.querySelectorAll(query).forEach(function(el) {
		els.push(el);
	});
	return els;
};
Object.prototype.keys = function() {
	return Object.keys(this) || [];
};
function ajax(data) {
	if ((typeof data.type !== 'undefined' && data.type.toLowerCase() === 'get') && (typeof data.request === 'string')) {
		data.url += '?' + data.request;
	}
	if(typeof data.form !== 'undefined') {
		if(typeof data.form === 'string') {
			data.form = document.forms[data.form];
		}
		data.request = new FormData(data.form);
		data.request.append('form', data.form.name);
		data.request.append('nonce', sessionStorage.getItem('nonce'));
		data.form.querySelectorAll('[data-input-name]').forEach(function(input) {
			data.request.append(input.data('input-name'), input.innerHTML);
		});
	}
	return new Promise(function (success, fail) {
		var resp;
		/*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise*/
		if(('cache' in data) && cache.has(data.cache)) {
			if(typeof data.history === 'string') {
				history.pushState({}, document.title, data.history);
			}
			success(cache.get(data.cache));
		}
		else if(typeof navigator.onLine !== 'boolean' || navigator.onLine) {
			var req = new XMLHttpRequest(),
				progress = document.createElement('progress');
			if (("withCredentials" in req) && ('withCredentials' in data)) {
				req.withCredentials = data.withCredentials;

			}
			if(typeof data.contentType !== 'string') {
				data.contentType = 'application/x-www-form-urlencoded';
			}
			document.body.appendChild(progress);
			req.open(
				data.type || 'POST',
				data.url || document.baseURI,
				data.async || true
			);
			if(typeof data.request === 'string') {
				req.setRequestHeader('Content-type', data.contentType);
			}
			req.setRequestHeader('Request-Type', 'AJAX');
			req.addEventListener('progress', function(event) {
				if(event.lengthComputable) {
					progress.value = event.loaded / event.total;
				}
			});
			req.addEventListener('load', function (event) {
				switch(req.getResponseHeader('Content-Type')) {
					case 'application/json': {
						resp = JSON.parse(req.response.trim());
					} break;
					case 'text/xml': {
						resp = new DOMParser().parseFromString(req.response.trim(), "text/xml");
					} break;
					case 'text/html': {
						resp = document.createDocumentFragment();
						resp.innerHTML = req.response.trim();
					} break;
					default: {
						resp = req.response.trim();
					}
				}
				progress.parentElement.removeChild(progress);
				if(req.status == 200) {
					if(data.cache) {
						cache.set(data.cache, req.response.trim());
					}
					success(resp);
					if(typeof data.history === 'string') {
						history.pushState({}, document.title, data.history);
					}
				}
				else {
					fail(Error(req.statusText));
				}
			});
			req.addEventListener('error', function () {
				fail(Error('Network Error'));
				progress.parentElement.removeChild(progress);
			});
			if(typeof data.request !== 'undefined') {
				req.send(data.request);
			}
			else {
				req.send();
			}
		}
		else {
			notify({
				title: 'Network:',
				body: 'offline',
				icon: 'images/icons/network-server.png'
			});
			fail('No Internet Connection');
		}
	});
}
function handleJSON(json){
	if(typeof json === 'string') {
		json = JSON.parse(json.trim());
	}
	else if(typeof json !== 'object') {
		return false;
	}
	if ('remove' in json) {
		document.querySelectorAll(json.remove).forEach(function(el){
			el.parentElement.removeChild(el);
		});
	}
	if('text' in json) {
		Object.keys(json.text).forEach(function(key){
			document.querySelector(key).textContent = json.text[key];
		});
	}
	if('html' in json) {
		Object.keys(json.html).forEach(function(key){
			document.querySelector(key).innerHTML = json.html[key];
		});
	}
	if('after' in json) {
		Object.keys(json.after).forEach(function(key){
			document.querySelector(key).insertAdjacentHTML('afterend', json.after[key]);
		});
	}
	if('before' in json) {
		Object.keys(json.before).forEach(function(key){
			document.querySelector(key).insertAdjacentHTML('beforebegin', json.before[key]);
		});
	}
	if('append' in json) {
		Object.keys(json.append).forEach(function(key){
			document.querySelector(key).insertAdjacentHTML('beforeend', json.append[key]);
		});
	}
	if('prepend' in json) {
		Object.keys(json.prepend).forEach(function(key){
			document.querySelector(key).insertAdjacentHTML('afterbegin', json.prepend[key]);
		});
	}
	if('addClass' in json) {
		Object.keys(json.addClass).forEach(function(selector){
			document.querySelectorAll(selector).forEach(function(el){
				json.addClass[selector].split(',').forEach(function(cname) {
					el.classList.add(cname);
				});
			});
		});
	}
	if('removeClass' in json) {
		Object.keys(json.removeClass).forEach(function(selector){
			document.querySelectorAll(selector).forEach(function(el){
				json.removeClass[selector].split(',').forEach(function(cname) {
					el.classList.remove(cname);
				});
			});
		});
	}
	if('attributes' in json) {
		Object.keys(json.attributes).forEach(function(selector) {
			document.querySelectorAll(selector).forEach(function(el) {
				Object.keys(json.attributes[selector]).forEach(function(attribute) {
					if(typeof json.attributes[selector][attribute] === 'boolean'){
						(json.attributes[selector][attribute]) ? el.setAttribute(attribute, '') : el.removeAttribute(attribute);
					}
					else {
						(attribute in el) ? el[attribute] = json.attributes[selector][attribute] : el.setAttribute(attribute, json.attributes[selector][attribute]);
					}
				});
			});
		});
	}
	if('increment' in json) {
		Object.keys(json.increment).forEach(function(selector) {
			var el = document.querySelector(selector);
			Object.keys(json.increment[selector]).forEach(function(attribute) {
				if(attribute in el) {
					el[attribute] += json.increment[selector][attribute]
				}
				else {
					el.setAttribute(attribute, parseFloat(el.getAttribute(attribute) + json.increment[selector][attribute]));
				}
			});
		})
	}
	if('stepUp' in json) {
		Object.keys(json.stepUp.forEach(function(selector) {
			document.querySelectorAll(selector).forEach(function(el) {
				el.stepUp(json.stepUp[selector]);
			});
		}));
	}
	if('stepDown' in json) {
		Object.keys(json.stepDown.forEach(function(selector) {
			document.querySelectorAll(selector).forEach(function(el) {
				el.stepDown(json.stepDown[selector]);
			});
		}));
	}
	if('style' in json) {
		Object.keys(json.style).forEach(function(sel) {
			document.querySelectorAll(sel).forEach(function(el) {
				Object.keys(json.style[sel]).forEach(function(prop) {
					el.style[prop.camelCase()] = json.style[sel][prop];
				});
			});
		});
	}
	if('dataset' in json) {
		Object.keys(json.dataset).forEach(function(sel) {
			document.querySelectorAll(sel).forEach(function(el) {
				Object.keys(json.dataset[sel]).forEach(function(prop) {
					el.data(prop, json.dataset[sel][prop]);
				});
			});
		});
	}
	if('sessionStorage' in json) {
		Object.keys(json.sessionStorage).forEach(function(key) {
			(json.sessionStorage[key] === '') ? sessionStorage.removeItem(key) : sessionStorage.setItem(key, json.sessionStorage[key]);
		});
	}
	if('localStorage' in json) {
		Object.keys(json.localStorage).forEach(function(key) {
			(json.localStorage[key] === '') ? sessionStorage.removeItem(key) : localStorage.setItem(key, json.localStorage[key]);
		});
	}
	if ('notify' in json) {
		notify(json.notify);
	}
	if('script' in json) {
		eval(json.script);
	}
	if('log' in json){
		console.log(json.log);
	}
	if('table' in json) {
		('table' in console) ? console.table(json.table) : console.log(json.table);
	}
	if('dir' in json) {
		('dir' in console) ? console.dir(json.dir) : console.log(json.dir);
	}
	if('info' in json){
		console.info(json.info);
	}
	if('warn' in json){
		console.log(json.warn);
	}
	if('error' in json){
		console.error(json.error);
	}
	if('scrollTo' in json) {
		document.querySelectorAll(json.scrollTo.sel).item(json.scrollTo.nth).scrollIntoView();
	}
	if('focus' in json) {
		document.querySelector(json.focus).focus();
	}
	if('select' in json) {
		document.querySelector(json.select).select();
	}
	if('reload' in json) {
		window.location.reload();
	}
	if('clear' in json) {
		document.forms[json.clear].reset();
	}
	if('open' in json) {
		var specs = [];
		json.open.specs.keys().forEach(function(spec) {
			specs.push(spec + '=' + json.open.specs[spec]);
		});
		window.open(json.open.url, '_blank', specs.join(','), json.open.replace);
	}
	if('show' in json) {
		document.querySelectorAll(json.show).forEach(function(el) {
			el.show();
		});
	}
	if('showModal' in json) {
		document.querySelector(json.showModal).showModal();
	}
	if('close' in json) {
		document.querySelectorAll(json.close).forEach(function(el) {
			el.close();
		});
	}
	if('triggerEvent' in json) {
		Object.keys(json.triggerEvent).forEach(function(selector) {
			document.querySelectorAll(selector).forEach(function(target){
				var event = json.triggerEvent[selector].toLowerCase();
				if(event === 'click') {
					target.dispatchEvent(new MouseEvent(event));
				}
				else {
					target.dispatchEvent(new Event(event));
				}
			});
		});
	}
	if('serverEvent' in json) {
		var serverEvent = new EventSource(json.serverEvent);
		serverEvent.addEventListener('ping', function(event) {
			handleJSON(JSON.parse(event.data));
		});
		serverEvent.addEventListener('close', function(event) {
			serverEvent.close();
			handleJSON(JSON.parse(event.data));
		});
		serverEvent.addEventListener('error', function(error) {
			console.error(new Error(error));
			console.error(error);
		});
	}
}
function cache() {
	return this;
}
cache.prototype.constructor = cache;
cache.prototype.has = function(key) {
	return localStorage.keys().indexOf(('cache ' + key).camelCase()) !== -1;
};
cache.prototype.get = function(key) {
	return localStorage.getItem(('cache ' + key).camelCase()) || false;
};
cache.prototype.set = function(key, value) {
	localStorage.setItem(('cache ' + key).camelCase(), value);
	return this;
};
cache.prototype.unset = function(key) {
	localStorage.removeItem(('cache ' + key).camelCase());
	return this;
};
cache.prototype.keys = function() {
	return localStorage.keys().filter(function(key){
		return /^cache/.test(key);
	});
};
cache.prototype.each = function(callback) {
	return this.keys().forEach(callback.bind(this));
};
cache.prototype.clear = function() {
	this.each(function(key){
		localStorage.removeItem(key);
	});
	return this;
};
Object.prototype.isArray = false;
Object.prototype.isString = false;
Object.prototype.isNumber = false;
Array.prototype.isArray = true;
String.prototype.isString = true;
Number.prototype.isNumber = true;
/*======================================================zQ Functions=========================================================*/
Object.prototype.isZQ = false;
zQ.prototype.isZQ = true;
/*Add Array prototypes to NodeList*/
['forEach', 'indexOf', 'some', 'every', 'map', 'filter'].forEach(function(feat){
	NodeList.prototype[feat] = Array.prototype[feat];
});
function $(q) {
	if(typeof q === 'undefined') {
		q = document.documentElement;
	}
	if(q.isZQ){
		return q;
	}
	return new zQ(q);
}
zQ.prototype.constructor = zQ;
function zQ(q) {
	if(typeof q === 'undefined') {
		q = document.documentElement;
	}
	this.query = q;
	try {
		switch(typeof this.query) {
			case 'string': {
				 this.results = document.querySelectorAll(this.query);
			} break;
			default: {
				this.results = [this.query];
			}
		}
	}
	catch (error) {
		console.error(error, this);
		console.error('No results for ' + this.query);
	}
	this.length = this.results.length;
	this.found = (!!this.results.length);
	this.filters = [];
	return this;
}
zQ.prototype.get = function(n) {
	return this.results.item(n);
};
zQ.prototype.each = function(callback) {
	if(this.found) {
		this.results.forEach(callback);
	}
	return this;
};
zQ.prototype.toArray = function() {
	if(!this.results.isArray) {
		var temp = [];
		this.each(function(node) {
			temp.push(node);
		});
		this.results = temp;
	}
	return this;
};
zQ.prototype.indexOf = function(i) {
	return this.results.indexOf(i);
};
zQ.prototype.some = function(callback) {
	return this.results.some(callback);
};
zQ.prototype.every = function(callback) {
	return this.results.every(callback);
};
zQ.prototype.filter = function(callback) {
	this.filters.push(callback.toString());
	this.results = this.results.filter(callback);
	this.length = this.results.length;
	return this;
};
zQ.prototype.map = function(callback) {
	return this.results.map(callback);
};
zQ.prototype.addClass = function(cname) {
	this.each(function(el) {
		el.classList.add(cname);
	});
	return this;
};
zQ.prototype.removeClass = function(cname) {
	this.each(function(el){
		el.classList.remove(cname);
	});
	return this;
};
zQ.prototype.hasClass = function(cname) {
	return this.some(function(el){
		return el.classList.contains(cname);
	});
};
zQ.prototype.toggleClass = function(cname, condition) {
	if(typeof condition ==='undefined') {
		this.each(function(el){
			el.classList.toggle(cname);
		});
	}
	else {
		this.each(function(el){
			el.classList.toggle(cname, condition);
		});
	}
	return this;
};
zQ.prototype.swapClass = function(cname1, cname2) {
	this.each(function(el) {
		el.classList.swap(cname1, cname2);
	});
	return this;
};
zQ.prototype.pickClass = function(cname1, cname2, condition) {
	(condition) ? this.addClass(cname1) : this.addClass(cname2);
	return this;
};
zQ.prototype.delete = function() {
	this.each(function(el){
		el.parentElement.removeChild(el);
	});
};
zQ.prototype.hasAttribute = function(attr) {
	return this.some(function(el) {
		return el.hasAttribute(attr);
	});
};
zQ.prototype.attr = function(attr, val) {
	if(typeof val == 'undefined' || val === true) {
		val = '';
	}
	if(val === false) {
		this.each(function(el) {
			el.removeAttribute(attr);
		});
	}
	else {
		this.each(function(el) {
			el.setAttribute(attr, val);
		});
	}
	return this;

};
zQ.prototype.pause = function() {
	this.each(function(media){
		media.pause();
	});
	return this;
};
/*======================================================Listener Functions=========================================================*/

zQ.prototype.on = function (event, callback) {
	this.each(function (e) {
		(html.addEventListener) ? e.addEventListener(event, callback, true)  : e['on' + event] = callback;
	});
	return this;
};
/*Listeners per event type*/
[
	'click',
	'dblclick',
	'contextmenu',
	'keypress',
	'keyup',
	'keydown',
	'mouseenter',
	'mouseleave',
	'mouseover',
	'mouseout',
	'mousemove',
	'mousedown',
	'mouseup',
	'input',
	'change',
	'submit',
	'reset',
	'invalid',
	'select',
	'focus',
	'blur',
	'resize',
	'updateready',
	'DOMContentLoaded',
	'load',
	'unload',
	'beforeunload',
	'abort',
	'error',
	'scroll',
	'drag',
	'offline',
	'online',
	'visibilitychange',
	'popstate',
	'pagehide'
].forEach(function(ev){
	zQ.prototype[ev] = function(callback){
		return this.on(ev, callback);
	};
});
zQ.prototype.ready = function(callback) {
	return this.on('DOMContentLoaded', callback);
};
zQ.prototype.networkChange = function (callback) {
	return this.online(callback) .offline(callback);
};
zQ.prototype.playing = function (callback) {
	this.each(function (e) {
		/*Does not work with listeners. Use onEvent by default*/
		e.onplay = callback;
	});
	return this;
};
zQ.prototype.paused = function (callback) {
	this.each(function (e) {
		e.onpause = callback;
	});
	return this;
};
zQ.prototype.visibilitychange = function (callback) {
	this.each(function (e) {
		[
			'',
			'moz',
			'webkit',
			'ms'
		].forEach(function (pre) {
			$(e) .listen(pre + 'visibilitychange', callback);
		});
	});
	return this;
};
zQ.prototype.watch = function(watching, options, attributeFilter) {
	/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
	if(typeof options === 'undefined') {
		options = [];
	}
	var watcher = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
			watching[mutation.type].call(mutation);
		});
	}),
	watches = {};
	Object.keys(watching).concat(options).forEach(function(event){
		watches[event] = true;
	});
	if(typeof attributeFilter !== 'undefined' && attributeFilter.isArray) {
		watches.attributeFilter = attributeFilter;
	}
	this.each(function(el){
		watcher.observe(el, watches);
	});
	return this;
};
/*====================================================================================================================*/
zQ.prototype.$ = function (q) {
	return $(this.query.split(',').map(function(str){
		return q.split(',').map(function(q) {
			return str.trim() + ' ' + q.trim();
		});
	}).join(', '));
};
$(window).popstate(function (event) {
	ajax({
		url: location.pathname,
		type: 'GET'
	}).then(
		handleJSON,
		console.error
	);
});
Object.prototype.$ = function(q) {
	if(this === document || this === window){
		return $(q);
	}
	return $(this).$(q);
};
zQ.prototype.css = function (args) { /*Set style using CSS syntax*/
	/*var n,
		i,
		e,
		value = [
		];
	args = args.replace('; ', ';') .replace(': ', ':') .replace('float', 'cssFloat') .split(';');
	for (var i = 0; i < args.length; i++) {
		value[i] = args[i].slice(args[i].indexOf(':') + 1).trim();
		args[i] = args[i].slice(0, args[i].indexOf(':')).trim().camelCase();
	}
	for (var i = 0; i < args.length; i++) {
		this.each(function (e) {
			e.style[args[i]] = value[i];
		});
	}*/
	var style = document.styleSheets[document.styleSheets.length - 1];
	style.insertRule(this.query + '{' + args +'}', style.cssRules.length);
	return this;
};
