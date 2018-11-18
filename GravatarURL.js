import md5 from './md5.js';

export default class GravatarURL extends URL {
	constructor(hash, {
		size = 80,
		fallback = 'mp',
		force = false,
		rating = null,
	} = {}) {
		super(hash, 'https://secure.gravatar.com/avatar/');

		if (typeof size === 'number' && ! Number.isNaN(size)) {
			this.size = size;
		}

		if (typeof fallback === 'string') {
			this.fallback = fallback;
		}

		if (typeof force === 'boolean') {
			this.force = force;
		}

		if (typeof rating === 'string') {
			this.rating = rating;
		}
	}

	static getHash(email) {
		return md5(email);
	}

	set size(size) {
		this.searchParams.set('s', size);
	}

	get size() {
		return parseInt(this.searchParams.get('s')) || 80;
	}

	set fallback(fallback) {
		this.searchParams.set('d', fallback);
	}

	get fallback() {
		return this.searchParams.get('d');
	}

	set force(force) {
		if (force) {
			this.searchParams.set('f', 'y');
		} else {
			this.searchParams.delete('f');
		}
	}

	get force() {
		return this.searchParams.has('f');
	}

	set rating(rating) {
		this.searchParams.set('r', rating);
	}

	get rating() {
		return this.searchParams.set('r');
	}
}
