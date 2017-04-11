export default class FileUpload {
	constructor(event) {
		event.preventDefault();
	}
	static uploadFile(file, url) {
		let headers = new Headers();
		headers.set('Content-Type', file.type);
		return fetch((new URL(url, location.origin)), {
			method: 'POST',
			credentials: 'include',
			body: file
		});
	}
	static readAsText(file, progressCallback) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();
			if (typeof progressCallback === 'function') {
				reader.addEventListener('progress', progressCallback);
			}
			reader.addEventListener('load', event => {
				resolve(event.target.result);
			});
			reader.addEventListener('error', event => {
				reject(event);
			});
			reader.readAsText(file);
		});
	}
	static readAsDataURL(file, progressCallback) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();
			if (typeof progressCallback === 'function') {
				reader.addEventListener('progress', progressCallback);
			}
			reader.addEventListener('load', event => {
				resolve(event.target.result);
			});
			reader.addEventListener('error', event => {
				reject(event);
			});
			reader.readAsDataURL(file);
		});
	}
	static readAsBinaryString(file, progressCallback) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();
			if (typeof progressCallback === 'function') {
				reader.addEventListener('progress', progressCallback);
			}
			reader.addEventListener('load', event => {
				resolve(event.target.result);
			});
			reader.addEventListener('error', event => {
				reject(event);
			});
			reader.readAsBinaryString(file);
		});
	}
	static readAsArrayBuffer(file, progressCallback) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();
			if (typeof progressCallback === 'function') {
				reader.addEventListener('progress', progressCallback);
			}
			reader.addEventListener('load', event => {
				resolve(event.target.result);
			});
			reader.addEventListener('error', event => {
				reject(event);
			});
			reader.readAsArrayBuffer(file);
		});
	}
}
