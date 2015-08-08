NodeList.prototype.forEach = function(callback) {
	return Array.prototype.forEach.call(this, callback);
};
NodeList.prototype.indexOf = function(callback) {
	return Array.prototype.indexOf.call(this, callback);
};
NodeList.prototype.some = function(callback) {
	return Array.prototype.some.call(this, callback);
};
NodeList.prototype.every = function(callback) {
	return Array.prototype.every.call(this, callback);
};
NodeList.prototype.map = function(callback) {
	return Array.prototype.map.call(this, callback);
};
NodeList.prototype.filter = function(callback) {
	return Array.prototype.filter.call(this, callback);
};
NodeList.prototype.reduce = function(callback, initial) {
	if (typeof initial === 'undefined') {
		initial = null;
	}
	return Array.prototype.reduce.call(this, callback, initial);
};
DOMStringMap.prototype.has = function(name) {
	return this.hasOwnProperty(name);
};
DOMTokenList.prototype.pick = function(cname1, cname2, condition) {
	(condition) ? this.add(cname1) : this.add(cname2);
};
DOMTokenList.prototype.swap = function(cname1, cname2) {
	if (this.contains(cname1)) {
		this.remove(cname1);
		this.add(cname2);
	} else {
		this.remove(cname2);
		this.add(cname1);
	}
};
Array.prototype.unique = function() {
	return this.filter((val, i, arr) => i <= arr.indexOf(val));
};
Array.prototype.end = function() {
	return this[this.length - 1];
};
HTMLCollection.prototype.indexOf = Array.prototype.indexOf;
RegExp.prototype.escape = function() {
	return this.source.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
};

Object.prototype.isaN = function () {
	return parseFloat(this) == this;
};
String.prototype.camelCase = function () {
	return this.toLowerCase().replace(/\ /g, '-').replace(
		/-(.)/g,
		(match, group1) => group1.toUpperCase()
	);
};
/*Replaced by Element.remove*/
Element.prototype.delete = function() {
	this.remove();
};
Element.prototype.after = function() {
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('afterend', arguments[i])
			: this.parentElement.insertBefore(arguments[i], this.nextSibling);
	}
	return this;
};
Element.prototype.before = function() {
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('beforebegin', arguments[i])
			: this.parentElement.insertBefore(arguments[i], this);
	}
	return this;
};
Element.prototype.prepend = function() {
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('afterbegin', arguments[i])
			: this.insertBefore(arguments[i], this.firstChild);
	}
	return this;
};
Element.prototype.append = function() {
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('beforeend', arguments[i])
			: this.appendChild(arguments[i]);
	}
	return this;
};
Element.prototype.clone = function() {
	return this.cloneNode(true);
};
Element.prototype.next = function() {
	return this.nextSibling;
};
Element.prototype.prev = function() {
	return this.previousSibling;
};
Element.prototype.html = function(html) {
	this.innerHTML = html;
	return this;
};
/*Replaced by Element.closest*/
Element.prototype.ancestor = function(sel) {
	return this.closest(sel);
};
Element.prototype.data = function(set, value) {
	var val = null;
	if (supports('dataset')) {
		(typeof value !== 'undefined')
			? this.dataset[set.camelCase()] = value
			: val = this.dataset[set.camelCase()];
	} else {
		(typeof value !== 'undefined')
			? this.setAttribute(`data-${set}`, value)
			: val = this.getAttribute(`data-${set}`);
	}
	return val;
};
Element.prototype.attr = function(attr, val) {
	switch (typeof val) {
		case 'string':
			this.setAttribute(attr, val);
			return this;

		case 'boolean':
			(val) ? this.setAttribute(attr, '') : this.removeAttribute(attr);
			return this;

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
			path.unshift('body');
			break;
		} else if (current.hasAttribute('id')) {
			path.unshift(`#${current.id}`);
			break;
		} else {
			path.unshift(`${current.tagName.toLowerCase()}:nth-child(${current.parentElement.children.indexOf(current) + 1})`);
			current = current.parentElement;
		}
	}
	return path.join(' > ');
};
Element.prototype.ajax = function(args) {
	ajax(args).then(
		this.html.bind(this),
		function(err) {
			console.error(err);
		}
	);
	return this;
};
Element.prototype.wordCount = function() {
	return this.textContent.split(' ').length;
};
Element.prototype.DnD = function(sets) {
	'use strict';
	this.ondragover = function(event) {
		this.classList.add('receiving');
		return false;
	};
	this.ondragend = function(event) {
		this.classList.remove('receiving');
		return false;
	};
	this.ondrop = function(e) {
		e.preventDefault();
		this.classList.remove('receiving');
		if (e.dataTransfer.files.length) {
			for (var i = 0; i < e.dataTransfer.files.length; i++) {
				var file = e.dataTransfer.files[i],
					reader = new FileReader(),
					progress = document.createElement('progress');
				progress.min = 0;
				progress.max = 1;
				progress.value = 0;
				progress.classList.add('uploading');
				sets.appendChild(progress);
				if (file.type.startsWith('image/')) {
					reader.readAsDataURL(file);
				} else if (file.type.startsWith('text/')) {
					reader.readAsText(file);
				}
				reader.addEventListener('progress', function(event) {
					if (event.lengthComputable) {
						progress.value = event.loaded / event.total;
					}
				});
				reader.addEventListener('load', function(event) {
					progress.parentElement.removeChild(progress);
					switch (file.type) {
						case 'image/png':
						case 'image/jpeg':
						case 'image/svg':
						case 'image/gif':
							document.execCommand('insertimage', null, event.target.result);
							break;

						default:
							try {
								var content = new DOMParser().parseFromString(event.target.result, file.type);
								document.execCommand('insertHTML', null, content.body.innerHTML);
							} catch (exc) {
								console.error(exc);
							}
							break;
					}
				});
				reader.addEventListener('error', function(event) {
					progress.remove();
					console.error(event);
				});
			}
		}
		return false;
	};
};
HTMLElement.prototype.dataURI = function() {
	var doc = this.toDocument();
	var style = doc.createElement('link');
	style.setAttribute('rel', 'stylesheet');
	style.setAttribute('type', 'text/css');
	style.setAttribute('href', 'https://fonts.googleapis.com/css?family=Acme|Ubuntu|Press+Start+2P|Alice|Comfortaa|Open+Sans|Droid+Serif');
	doc.head.appendChild(style);

	return doc.dataURI();
};
HTMLElement.prototype.toDocument = function (charset) {
	if (typeof charset !== 'string') {
		charset = 'utf-8';
	}
	var doc = new DOMParser().parseFromString('', 'text/html');
	doc.head.appendChild(doc.createElement('meta')).setAttribute('charset', charset);
	this.childNodes.forEach(function(node) {
		doc.body.appendChild(node.cloneNode(true));
	});
	return doc;
};
DocumentType.prototype.toString = function() {
	var doctype = `<!DOCTYPE ${this.name}`;
	if (this.publicId) {
		doctype += ` PUBLIC "${this.publicId}"`;
	}
	if (this.systemId) {
		doctype += ` "${this.systemId}"`;
	}
	doctype += '>';
	return doctype;
};
HTMLDocument.prototype.dataURI = function() {
	return `data:text/html,${encodeURIComponent(`${this.doctype || document.doctype}${this.documentElement.outerHTML}`)}`;
};
Element.prototype.query = function(query) {
	var els = Array.prototype.slice.call(this.querySelectorAll(query), 0);
	if (this.matches(query)) {
		els.unshift(this);
	}
	return els;
};
Object.prototype.keys = function() {
	return Object.keys(this) || [];
};
Object.prototype.isArray = false;
Object.prototype.isString = false;
Object.prototype.isNumber = false;
Array.prototype.isArray = true;
String.prototype.isString = true;
Number.prototype.isNumber = true;
