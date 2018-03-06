export const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
export function normalizeName(name) {
	if (typeof name !== 'string') {
		name = String(name);
	}
	if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
		throw new TypeError('Invalid character in header field name');
	}
	return name.toLowerCase();
}
export function decode(body) {
	var form = new FormData();
	body.trim().split('&').forEach(function(bytes) {
		if (bytes) {
			var split = bytes.split('=');
			var name = split.shift().replace(/\+/g, ' ');
			var value = split.join('=').replace(/\+/g, ' ');
			form.append(decodeURIComponent(name), decodeURIComponent(value));
		}
	});
}

export function normalizeValue(value) {
	if (typeof value !== 'string') {
		value = String(value);
	}
	return value;
}
export function consumed(body) {
	if (body.bodyUsed) {
		return Promise.reject(new TypeError('Already read'));
	}
	body.bodyUsed = true;
}

export function fileReaderReady(reader) {
	return new Promise(function(resolve, reject) {
		reader.onload = function() {
			resolve(reader.result);
		};
		reader.onerror = function() {
			reject(reader.error);
		};
	});
}

export function readBlobAsArrayBuffer(blob) {
	var reader = new FileReader();
	reader.readAsArrayBuffer(blob);
	return fileReaderReady(reader);
}

export function readBlobAsText(blob) {
	var reader = new FileReader();
	reader.readAsText(blob);
	return fileReaderReady(reader);
}

export var support = {
	blob: 'FileReader' in self && 'Blob' in self && (function() {
		try {
			new Blob();
			return true;
		} catch(e) {
			return false;
		}
	})(),
	formData: 'FormData' in self
};

export function normalizeMethod(method) {
	var upcased = method.toUpperCase();
	return (methods.indexOf(upcased) > -1) ? upcased : method;
}
