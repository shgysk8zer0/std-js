import md5 from './md5.js';
export default class Gravatar extends Image {
	constructor(email, size = 80) {
		super(size);
		const url = new URL(`/avatar/${md5(email)}`, 'https://gravatar.com/');
		if (size !== 80) {
			url.searchParams.set('s', size);
		}
		this.src = url;
		this.alt = 'Gravatar';
	}

	set size(size) {
		const url = new URL(this.src);
		if (size === 80) {
			url.searchParams.delete('s');
		} else {
			url.searchParams.set('s', size);
		}
		this.src = url;
		this.width = size;
		this.height = size;
	}

	get size() {
		const url = new URL(this.src);
		return url.searchParams.has('s') ? parseInt(url.searchParams.get('s')) : 80;
	}

	toString() {
		return this.src;
	}
}
