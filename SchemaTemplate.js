import SchemaNode from './SchemaNode.js';
import SchemaData from './SchemaData.js';

const MONTHS = [
	{abbr: 'Jan', full: 'January'},
	{abbr: 'Feb', full: 'February'},
	{abbr: 'Mar', full: 'March'},
	{abbr: 'Apr', full: 'April'},
	{abbr: 'May', full: 'May'},
	{abbr: 'Jun', full: 'June'},
	{abbr: 'Jul', full: 'July'},
	{abbr: 'Aug', full: 'August'},
	{abbr: 'Sep', full: 'September'},
	{abbr: 'Oct', full: 'October'},
	{abbr: 'Nov', full: 'November'},
	{abbr: 'Dec', full: 'December'}
];

const DAYS = [
	{abbr: 'Sun', full: 'Sunday'},
	{abbr: 'Mon', full: 'Monday'},
	{abbr: 'Tue', full: 'Tuesday'},
	{abbr: 'Wed', full: 'Wednesday'},
	{abbr: 'Thu', full: 'Thursday'},
	{abbr: 'Fri', full: 'Friday'},
	{abbr: 'Sat', full: 'Saturday'}
];

/**
 * Similar to PHP Date::format <https://secure.php.net/manual/en/function.date.php>
 * @TODO Add support for more formatting options, including /especially timezones
 */
function formatDate(date, chars = '') {
	return chars.split('').reduce((str, char) => {
		switch(char) {
			case 'Y':
				str += date.getFullYear();
				break;
			case 'y':
				str += date.getYear();
				break;
			case 'M':
				str += MONTHS[date.getMonth()].abbr;
				break;
			case 'F':
				str += MONTHS[date.getMonth()].full;
				break;
			case 'm':
				var m = date.getMonth() + 1;
				str += m < 10 ? `0${m}` : m;
				break;
			case 'n':
				str += date.getMonth() + 1;
				break;
			case 'd':
				var d = date.getDate();
				str += d < 10 ? `0${d}` : d;
				break;
			case 'N':
				str += date.getDay() + 1;
				break;
			case 'j':
				str += date.getDate();
				break;
			case 'D':
				str += DAYS[date.getDay() - 1].abbr;
				break;
			case 'l':
				str += DAYS[date.getDay() - 1].full;
				break;
			case 'H':
				var h = date.getHours();
				str += h < 10 ? `0${h}` : h;
				break;
			case 'h':
				var H = (date.getHours() % 12) + 1;
				str += H < 10 ? `0${H}` : H;
				break;
			case 'G':
				str += date.getHours();
				break;
			case 'g':
				str += (date.getHours() % 12) + 1;
				break;
			case 'i':
				var i = date.getMinutes();
				str += i < 10 ? `0${i}` : i;
				break;
			case 's':
				var s = date.getSeconds();
				str += s < 10 ? `0${s}` : s;
				break;
			case 'a':
				str += date.getHours() > 11 ? 'pm' : 'am';
				break;
			case 'A':
				str += date.getHours() > 11 ? 'PM' : 'AM';
				break;
			default:
				str += char;
		}
		return str;
	}, '');
}

const SCHEMA_ATTRS = [
	'itemtype',
	'itemprop',
	'itemscope'
];

export default class SchemaTemplate extends DocumentFragment {
	constructor(templateId) {
		super();
		let template = document.getElementById(templateId);
		if (! (template instanceof HTMLElement)) {
			throw new Error(`Template "${templateId}" not found.`);
		}
		this.appendChild(template.content.cloneNode(true));
	}

	toString() {
		return this.firstElementChild.outerHTML;
	}

	get itemtype() {
		return this.getAttribute('itemtype');
	}

	get itemprop() {
		return this.getAttribute('itemprop');
	}

	set itemprop(itemprop) {
		this.setAttribute('itemprop', itemprop);
	}

	get itemscope() {
		return this.getAttribute('itemscope');
	}

	set itemscope(value) {
		this.setAttribute('itemscope', value);
	}

	set data(data) {
		let thing = new SchemaData(data);
		if (thing.itemtype !== this.itemtype) {
			throw new Error(`Template has itemtype of ${this.itemtype} but required ${thing.itemtype}`);
		}
		for (let [prop, node] of this.entries()) {
			if (! thing.has(prop)) {
				node.remove();
			} else if (thing.get(prop) instanceof Date) {
				let date = thing.get(prop);
				if (node.hasAttribute('datetime')) {
					node.setAttribute('datetime', date.toISOString());
					node.text = node.dataset.hasOwnProperty('dateFormat')
						? formatDate(date, node.dataset.dateFormat)
						: date.toDateString();
				}
			} else if (thing.get(prop).constructor === Object) {
				if (node.dataset.hasOwnProperty('schemaTemplate')) {
					try {
						let template = new SchemaTemplate(node.dataset.schemaTemplate);
						template.itemprop = prop;
						template.itemscope = '';
						template.data = thing.get(prop);
						node.replaceWith(template);
					} catch (e) {
						console.error(e);
						node.remove();
					}
				} else {
					console.error(`Missing data-template attribute for ${thing.type}`);
					node.remove();
				}
			} else if (node.hasAttribute('href')) {
				switch(prop) {
					case 'email':
						node.setAttribute('href', `mailto:${thing.get(prop)}`);
						node.title = thing.get(prop);
						break;

					case 'telephone':
						node.setAttribute('href', `tel:${thing.get(prop)}`);
						node.title = thing.get(prop);
						break;

					default:
						node.setAttribute('href', thing.get(prop));
				}
				if (! node.hasChildNodes()) {
					node.textContent = thing.get(prop);
				}
			} else if(node.hasAttribute('src')) {
				node.setAttribute('src', thing.get(prop));
			} else if (node.hasAttribute('content')) {
				node.setAttribute('content', thing.get(prop));
			} else {
				node.html = thing.get(prop);
			}
		}
	}

	get classList() {
		return this.firstElementChild.classList;
	}

	get dataset() {
		return this.firstElementChild.dataset;
	}

	appendTo(node) {
		this.itemscope = this.itemscope || '';
		node.appendChild(node.ownerDocument.importNode(this.firstElementChild, true));
	}

	hasAttribute(attr) {
		return this.firstElementChild.hasAttribute(attr);
	}

	getAttribute(attr) {
		return this.firstElementChild.getAttribute(attr);
	}

	setAttribute(attr, val) {
		this.firstElementChild.setAttribute(attr, val);
	}

	removeAttribute(attr) {
		this.firstElementChild.removeAttribute(attr);
	}

	has(prop) {
		return this.firstElementChild.querySelector(`[itemprop="${prop}"]`) instanceof HTMLElement;
	}

	find(prop) {
		return new SchemaNode(this.firstElementChild.querySelector(`[itemprop="${prop}"]`));
	}

	removeMicrodata() {
		SCHEMA_ATTRS.forEach(attr => {
			this.removeAttribute(attr);
			this.querySelectorAll(`[${attr}]`).forEach(node => {
				node.removeAttribute(attr);
			});
		});
	}

	*keys() {
		const nodes = this.firstElementChild.querySelectorAll('[itemprop]');
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			yield nodes.item(i).getAttribute('itemprop');
		}
	}

	*values() {
		const nodes = this.firstElementChild.querySelectorAll('[itemprop]');
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			yield new SchemaNode(nodes.item(i));
		}
	}

	*entries() {
		for (let node of this.values()) {
			yield [node.itemprop, node];
		}
	}
}
