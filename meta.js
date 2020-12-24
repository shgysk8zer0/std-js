export function meta({ name, itemprop, property, content, parent = document.head, replace = true }) {
	const created = document.createElement('meta');
	let existing;

	if (typeof name === 'string') {
		existing = parent.querySelector(`meta[name="${CSS.escape(name)}"]`);
		created.name = name;
	} else if (typeof itemprop === 'string') {
		existing = parent.querySelector(`meta[itemprop="${CSS.escape(itemprop)}"]`);
		created.setAttribute('itemprop', itemprop);
	} else if (typeof property === 'string') {
		existing = parent.querySelector(`meta[property="${CSS.escape(property)}"]`);
		created.setAttribute('property', property);
	}

	if (Array.isArray(content)) {
		created.content = content.join(', ');
	} else if (typeof content === 'string' || typeof content === 'number') {
		created.content = content;
	} else if (content instanceof URL) {
		created.content = content.href;
	} else if (typeof content === 'object') {
		created.content = Object.entries(content).map(([k, v]) => `${k}=${v}`).join(',');
	}

	if (! (parent instanceof Element)) {
		return created;
	} else if (existing instanceof HTMLMetaElement && replace === true) {
		existing.replaceWith(created);
		return created;
	} else {
		parent.append(created);
		return created;
	}
}

export function description(content) {
	return [
		meta({ name:     'description',         content }),
		meta({ itemprop: 'description',         content }),
		meta({ property: 'og:description',      content }),
		meta({ name:     'twitter:description', content }),
	];
}

export function keywords(content) {
	return [
		meta({ name:     'keywords',    content }),
		meta({ itemprop: 'keywords',    content }),
		meta({ property: 'og:keywords', content }),
	];
}

export function referrer(content) {
	return meta({ name: 'referrer', content });
}

export function robots(content) {
	return meta({ name: 'robots', content });
}

export function thumbnail(content) {
	return [
		meta({ itemprop: 'thumbnailUrl',  content }),
		meta({ property: 'og:image',      content}),
		meta({ name:     'twitter:image', content }),
	];
}

export function title(content) {
	document.title = content;
	return [
		meta({ itemprop: 'headline', content }),
		meta({ prooperty: 'og:title', content }),
	];
}
