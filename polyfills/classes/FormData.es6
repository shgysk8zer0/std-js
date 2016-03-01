function $(selector, form) {
	return Array.from(form.querySelectorAll(selector));
}
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FormData
 */
export default class {
	constructor(form) {
		this.data = {};
		if (form instanceof HTMLFormElement) {
			$('input[name]', this).forEach(input => {
				if (input.type === 'checkbox' && input.checked) {
					this.append(input.name, input.value);
				} else {
					this.append(input.name, input.value);
				}
			});
		}
	}
	append(name, value) {
		if (name in this.data) {
			this.data[name].push(value);
		} else {
			this.set(name, value);
		}
	}
	set(name, value) {
		this.data[name] = [value];
	}
	has(name) {
		return name in this.data;
	}
	delete(name) {
		delete this.data[name];
	}
	get(name) {
		return this.has(name) ? this.getAll(name)[0] : undefined;
	}
	getAll(name) {
		return this.has(name) ? this.data[name] : [];
	}
	entries() {

	}
	keys() {

	}
	values() {
		
	}
}
