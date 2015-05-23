"use strict";
var body = document.body,
	html = document.documentElement,
	prefixes = ['', '-moz-', '-webkit-', '-o-', '-ms-'];
DOMTokenList.prototype.pick = function(cname1, cname2, condition) {
	(condition) ? this.add(cname1) : this.add(cname2);
};
DOMTokenList.prototype.swap = function(cname1, cname2) {
	if(this.contains(cname1)) {
		this.remove(cname1);
		this.add(cname2);
	} else {
		this.remove(cname2);
		this.add(cname1);
	}
};
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
RegExp.prototype.escape = function() {
	return this.source.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

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
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('afterend', arguments[i])
			: this.parentElement.insertBefore(arguments[i], this.nextSibling);
	}
	return this;
};
Element.prototype.before = function() {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('beforebegin', arguments[i])
			: this.parentElement.insertBefore(arguments[i], this);
	}
	return this;
};
Element.prototype.prepend = function() {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('afterbegin', arguments[i])
			: this.insertBefore(arguments[i], this.firstChild);
	}
	return this;
};
Element.prototype.append = function() {
	for(var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('beforeend', arguments[i])
			: this.appendChild(arguments[i]);
	}
	return this;
};
Element.prototype.clone = function() {
	return this.cloneNode(true);
};
Element.prototype.next = function () {
	return this.nextSibling;
};
Element.prototype.prev = function () {
	return this.previousSibling;
};
Element.prototype.html = function(html) {
	this.innerHTML = html;
	return this;
};
Element.prototype.ancestor = function (sel) {
	if(this.parentElement.matches(sel)) {
		return this.parentElement;
	} else if(this === document.body) {
		return false;
	} else {
		return this.parentElement.ancestor(sel);
	}
};
Element.prototype.data = function(set, value) {
	var val = null;
	if(supports('dataset')) {
		(typeof value !== 'undefined') ? this.dataset[set.camelCase()] = value : val = this.dataset[set.camelCase()];
	} else {
		(typeof value !== 'undefined') ? this.setAttribute('data-' + set, value): val = this.getAttribute('data-' + set);
	}
	return val;
};
Element.prototype.attr = function(attr, val) {
	switch(typeof val) {
		case 'string':
			this.setAttribute(attr, val);
			return this;
			break;

		case 'boolean':
			(val) ? this.setAttribute(attr, '') : this.removeAttribute(attr);
			return this;
			break;

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
		if (current === document.body) {
			path.push('body');
			break;
		} else if(current.hasAttribute('id')) {
			path.push('#' + current.id);
			break;
		} else {
			path.push(current.tagName.toLowerCase() + ':nth-child(' + (current.parentElement.children.indexOf(current) + 1).toString() + ')');
			current = current.parentElement;
		}
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
				(Notification.permission.toLowerCase() === 'granted')
					? notification = notify(options)
					: alert(options.title || document.title + '\n' + options.body);
			});
		}
		notification = new Notification(options.title || document.title, options);
	} else if ('notifications' in window) {
		if (window.notifications.checkPermission != 1) {
			window.notifications.requestPermission();
		}
		notification = window.notifications.createNotification(options.icon, options.title || document.title, options.body) .show();
	} else {
		alert(options.title || document.title + '\n' + options.body);
	}
	if (!!notification) {
		if ('onclick' in options) {
			notification.onclick = options.onclick;
		}
		if ('onshow' in options) {
			notification.onshow = options.onshow;
		}
		if ('onclose' in options) {
			notification.onclose = options.onclose;
		}
		if ('onerror' in options) {
			notification.onerror = options.onerror;
		} else {
			notification.onerror = console.error;
		}
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
	if (('applicationCache' in window) && ('manifest' in document.documentElement)) {
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
	return new Promise(function(success, fail) {
		if (!('geolocation' in navigator)) {
			fail('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(success, fail, options);
	});
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
		} else if(typeof navigator.onLine !== 'boolean' || navigator.onLine) {
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
					case 'application/json':
						resp = JSON.parse(req.response.trim());
						break;

					case 'text/xml':
						resp = new DOMParser().parseFromString(req.response.trim(), "text/xml");
						break;

					case 'text/html':
						resp = document.createDocumentFragment();
						resp.innerHTML = req.response.trim();
						break;

					default:
						resp = req.response.trim();
				}
				progress.parentElement.removeChild(progress);
				if(req.status == 200) {
					if(data.cache) {
						cache.set(data.cache, req.response.trim());
					}
					if(typeof data.history === 'string') {
						history.pushState({}, document.title, data.history);
					}
					success(resp);
				} else {
					fail(Error(req.statusText));
				}
			});
			req.addEventListener('error', function () {
				fail(Error('Network Error'));
				progress.parentElement.removeChild(progress);
			});
			if(typeof data.request !== 'undefined') {
				req.send(data.request);
			} else {
				req.send();
			}
		} else {
			notify({
				title: 'Network:',
				body: 'offline',
				icon: 'images/icons/network-server.png'
			});
			fail('No Internet Connection');
		}
	});
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
	return localStorage.keys().filter(function(key) {
		return /^cache/.test(key);
	});
};
cache.prototype.each = function(callback) {
	return this.keys().forEach(callback.bind(this));
};
cache.prototype.clear = function() {
	this.each(function(key) {
		localStorage.removeItem(key);
	});
	return this;
};
Object.prototype.isArray  = false;
Object.prototype.isString = false;
Object.prototype.isNumber = false;
Array.prototype.isArray   = true;
String.prototype.isString = true;
Number.prototype.isNumber = true;
window.addEventListener('popstate', function() {
	ajax({
		url: location.pathname,
		type: 'GET'
	}).then(
		handleJSON,
		console.error
	);
});
