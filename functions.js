function isOnline()
{
	return (! 'onLine' in navigator) || navigator.onLine;
}
function isInternalLink(link)
{
	if ('URL' in window) {
		return new URL(link.href, document.baseURI).host === location.host;
	} else {
		return new RegExp(document.location.origin).test(link.href);
	}
}
function ajax(data)
{
	if ((typeof data.type !== 'undefined' && data.type.toLowerCase() === 'get') && (typeof data.request === 'string')) {
		data.url += '?' + data.request;
	}
	if (typeof data.form !== 'undefined') {
		if (typeof data.form === 'string') {
			data.form = document.forms[data.form];
		}
		data.request = new FormData(data.form);
		data.request.append('form', data.form.name);
		data.request.append('nonce', sessionStorage.getItem('nonce'));
		data.form.querySelectorAll('[data-input-name]').forEach(function(input)
		{
			data.request.append(input.data('input-name'), input.innerHTML);
		});
	}
	if (typeof data.headers !== 'object') {
		data.headers = {Accept: 'application/json'};
	} else if (! 'Accept' in data.headers) {
		data.headers.Accept = 'application/json';
	}
	return new Promise(function (success, fail)
	{
		var resp;
		/*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise*/
		if (('cache' in data) && cache.has(data.cache)) {
			if (typeof data.history === 'string') {
				history.pushState({}, document.title, data.history);
			}
			success(cache.get(data.cache));
		} else if (typeof navigator.onLine !== 'boolean' || navigator.onLine) {
			var req = new XMLHttpRequest(),
				progress = document.createElement('progress');
			if (('withCredentials' in req) && ('withCredentials' in data)) {
				req.withCredentials = data.withCredentials;

			}
			if (typeof data.contentType !== 'string') {
				data.contentType = 'application/x-www-form-urlencoded';
			}
			document.body.appendChild(progress);
			req.open(
				data.type || 'POST',
				data.url || document.baseURI,
				data.async || true
			);
			if (typeof data.request === 'string') {
				req.setRequestHeader('Content-type', data.contentType);
			}
			req.setRequestHeader('Accept', data.headers.Accept);
			req.setRequestHeader('Request-Type', 'AJAX');
			req.addEventListener('progress', function(event)
			{
				if (event.lengthComputable) {
					progress.value = event.loaded / event.total;
				}
			});
			req.addEventListener('load', function (event)
			{
				switch (req.getResponseHeader('Content-Type')) {
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
				if (req.status == 200) {
					if (data.cache) {
						cache.set(data.cache, req.response.trim());
					}
					if (typeof data.history === 'string') {
						history.pushState({}, document.title, data.history);
					}
					success(resp);
				} else {
					fail(Error(req.statusText));
				}
			});
			req.addEventListener('error', function ()
			{
				fail(Error('Network Error'));
				progress.parentElement.removeChild(progress);
			});
			if (typeof data.request !== 'undefined') {
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
function cache()
{
	return this;
}
function getLocation(options)
{
	/*https://developer.mozilla.org/en-US/docs/Web/API/Geolocation.getCurrentPosition*/
	if (typeof options === 'undefined') {
		options = {};
	}
	return new Promise(function(success, fail)
	{
		if (!('geolocation' in navigator)) {
			fail('Your browser does not support GeoLocation');
		}
		navigator.geolocation.getCurrentPosition(success, fail, options);
	});
}
function notify(options)
{
	/*Creates a notification, with alert fallback*/
	var notification;
	if (typeof options === 'string') {
		options = {
			body: options
		};
	}
	if (typeof options.icon !== 'string') {
		options.icon = 'images/octicons/svg/megaphone.svg';
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
function selection()
{
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
selection.prototype.replace = function(rep)
{
	this.parent.innerHTML = this.before + rep + this.after;
};
cache.prototype.constructor = cache;
cache.prototype.has = function(key)
{
	return localStorage.keys().indexOf(('cache ' + key).camelCase()) !== -1;
};
cache.prototype.get = function(key)
{
	return localStorage.getItem(('cache ' + key).camelCase()) || false;
};
cache.prototype.set = function(key, value)
{
	localStorage.setItem(('cache ' + key).camelCase(), value);
	return this;
};
cache.prototype.unset = function(key)
{
	localStorage.removeItem(('cache ' + key).camelCase());
	return this;
};
cache.prototype.keys = function()
{
	return localStorage.keys().filter(function(key)
	{
		return /^cache/.test(key);
	});
};
cache.prototype.each = function(callback)
{
	return this.keys().forEach(callback.bind(this));
};
cache.prototype.clear = function()
{
	this.each(function(key)
	{
		localStorage.removeItem(key);
	});
	return this;
};
