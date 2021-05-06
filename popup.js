export function popup(url, {
	name = '',
	referrer = false,
	opener = false,
	height = null,
	width = null,
	x = null,
	y = null,
	resizable = true,
	location = false,
	scrollbars = true,
} = {}) {
	let flags = [];

	if (opener === false) {
		flags.push('noopener');
	}

	if (referrer === false) {
		flags.push('noreferrer');
	}

	// Some properties only apply to sized windows
	if (Number.isInteger(width) || Number.isInteger(height)) {
		if (Number.isInteger(height)) {
			flags.push(`height=${height}`);
		}

		if (Number.isInteger(width)) {
			flags.push(`width=${width}`);
		}

		if (Number.isInteger(x)) {
			flags.push(`left=${x}`);
		}

		if (Number.isInteger(y)) {
			flags.push(`top=${y}`);
		}

		if (resizable) {
			flags.push('resiabled');
		}

		if (location) {
			flags.push('location');
		}

		if (scrollbars) {
			flags.push('scrollbars');
		}
	}

	return window.open(url, name, flags.join(','));
}
