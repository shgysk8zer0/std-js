import md5 from './md5.js';
const domain = 'https://gravatar.com';

export default class Gravatar extends Image {
	constructor(email, size, ...sizes) {
		const url = Gravatar.getURL(email, size);
		super(size);
		this.src = url;
		this.alt = 'Gravatar';

		if (sizes.length !== 0) {
			this.srcset = sizes.map(size => {
				url.searchParams.set('s', size);
				return `${url} ${size}w`;
			}).join(', ');
			delete this.width;
			delete this.height;
		}
	}

	toString() {
		return this.src;
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

	static getURL(email, size = null) {
		const url = new URL(`/avatar/${md5(email)}`, domain);
		if (Number.isInteger(size) && size !== 80) {
			url.searchParams.set('s', size);
		}
		return url;
	}
}
