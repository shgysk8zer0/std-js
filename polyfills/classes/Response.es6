/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
export default class Response {
	constructor(body, init = {}) {
		if (! (body instanceof Body)) {
			body = new Body(body);
		}
		this.type = '';
		this.status = 0;
		this.statusText = '';
		this.ok = true;
		this.headers = new Headers();
		this.url = '';
		this.useFinalURL = true;
		this.bodyUsed = false;
	}

	json() {
		return this.text().then(json => JSON.parse(json));
	}
	text() {
		return new Promise(() => {
			return '';
		});
	}
	formData() {
		return new Promise(() => {
			new FormData();
		});
	}
	arrayBuffer() {
		return;
	}
	blob() {
		return;
	}
	clone() {
		return;
	}
	error() {
		return;
	}
	redirect() {
		return;
	}
}
