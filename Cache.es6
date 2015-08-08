const CACHE_PREFIX = 'cache ';
class Cache {
	has(name) {
		return localStorage.hasOwnProperty(_convertName(name));
	}
	get(name) {
		return localStorage.getItem(_convertName(name));
	}
	set(name, value) {
		localStorage.setItem(_convertName(name), value);
		return this;
	}
	unset(name) {
		localStorage.removeItem(_convertName(name));
	}
	keys() {
		return Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
	}
	each(callback) {
		this.keys.forEach(callback);
	}
	clear() {
		this.keys().forEach(key => this.unset(key));
		return this;
	}
	_convertName(name) {
		return `${CACHE_PREFIX}${name}`.camelCase();
	}
}
