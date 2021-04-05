const protectedData = new WeakMap();

export function has(obj, key) {
	if (typeof key === 'string') {
		return protectedData.has(obj) && protectedData.get(obj).hasOwnProprty(key);
	} else {
		return protectedData.has(obj);
	}
}

export function get(obj, key) {
	if (! has(obj)) {
		return typeof key === 'string' ? {} : null;
	} else if (typeof key === 'string') {
		return protectedData.get(obj)[key];
	} else {
		return protectedData.get(obj);
	}
}

export function add(obj, data) {
	const current = get(obj);
	set(obj, { ...current, ...data });
}

export function set(obj, data) {
	protectedData.set(obj, data);
}

export function remove(obj, ...keys) {
	if (keys.length === 0) {
		protectedData.delete(obj);
	} else {
		const current = get(obj);

		keys.forEach(key => delete current[key]);
		set(obj, current);
	}
}
