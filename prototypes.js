/*Add Array prototypes to NodeList*/
[
	'forEach',
	'indexOf',
	'some',
	'every',
	'map',
	'filter',
	'reduce'
].filter(function (method) {
	return !(method in NodeList.prototype) && (method in Array.prototype);
}).forEach(function (method) {
	NodeList.prototype[method] = Array.prototype[method]
});
DOMTokenList.prototype.pick = function(cname1, cname2, condition)
{
	(condition) ? this.add(cname1) : this.add(cname2);
};
DOMTokenList.prototype.swap = function(cname1, cname2)
{
	if (this.contains(cname1)) {
		this.remove(cname1);
		this.add(cname2);
	} else {
		this.remove(cname2);
		this.add(cname1);
	}
};
Array.prototype.unique = function()
{
	return this.filter(
		function(val, i, arr)
		{
			return (i <= arr.indexOf(val));
		}
	);
};
Array.prototype.end = function()
{
	return this[this.length - 1];
};
HTMLCollection.prototype.indexOf = Array.prototype.indexOf;
RegExp.prototype.escape = function()
{
	return this.source.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

Object.prototype.isaN = function ()
{
	return parseFloat(this) == this;
};
Object.prototype.camelCase = function ()
{
	return this.toLowerCase() .replace(/\ /g, '-') .replace(/-(.)/g, function (match, group1)
	{
		return group1.toUpperCase();
	});
};
Element.prototype.delete = function()
{
	this.parentElement.removeChild(this);
};
Element.prototype.after = function()
{
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('afterend', arguments[i])
			: this.parentElement.insertBefore(arguments[i], this.nextSibling);
	}
	return this;
};
Element.prototype.before = function()
{
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('beforebegin', arguments[i])
			: this.parentElement.insertBefore(arguments[i], this);
	}
	return this;
};
Element.prototype.prepend = function()
{
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('afterbegin', arguments[i])
			: this.insertBefore(arguments[i], this.firstChild);
	}
	return this;
};
Element.prototype.append = function()
{
	for (var i = 0; i < arguments.length; i++) {
		(typeof arguments[i] === 'string')
			? this.insertAdjacentHTML('beforeend', arguments[i])
			: this.appendChild(arguments[i]);
	}
	return this;
};
Element.prototype.clone = function()
{
	return this.cloneNode(true);
};
Element.prototype.next = function ()
{
	return this.nextSibling;
};
Element.prototype.prev = function()
{
	return this.previousSibling;
};
Element.prototype.html = function(html)
{
	this.innerHTML = html;
	return this;
};
Element.prototype.ancestor = function (sel)
{
	if (this.parentElement.matches(sel)) {
		return this.parentElement;
	} else if (this === document.body) {
		return false;
	} else {
		return this.parentElement.ancestor(sel);
	}
};
Element.prototype.data = function(set, value)
{
	var val = null;
	if (supports('dataset')) {
		(typeof value !== 'undefined') ? this.dataset[set.camelCase()] = value : val = this.dataset[set.camelCase()];
	} else {
		(typeof value !== 'undefined') ? this.setAttribute('data-' + set, value): val = this.getAttribute('data-' + set);
	}
	return val;
};
Element.prototype.attr = function(attr, val)
{
	switch (typeof val) {
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
Element.prototype.uniqueSelector = function ()
{
	if (this.nodeType !== 1) {
		return null;
	}
	var path = [],
	current = this;
	while (current !== document.documentElement) {
		if (current === document.body) {
			path.push('body');
			break;
		} else if (current.hasAttribute('id')) {
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
		function(err)
		{
			console.error(err);
		}
	);
	return this;
};
Element.prototype.wordCount = function()
{
	return this.textContent.split(' ').length;
};
/*AppCache updater*/
/*$(window) .load(function (e) { *//*Check for appCache updates if there is a manifest set*/
Element.prototype.query = function(query)
{
	var els = [];
	if (this.matches(query)) {
		els.push(this);
	}
	this.querySelectorAll(query).forEach(function(el)
	{
		els.push(el);
	});
	return els;
};
Object.prototype.keys = function()
{
	return Object.keys(this) || [];
};
Object.prototype.isArray  = false;
Object.prototype.isString = false;
Object.prototype.isNumber = false;
Array.prototype.isArray   = true;
String.prototype.isString = true;
Number.prototype.isNumber = true;
