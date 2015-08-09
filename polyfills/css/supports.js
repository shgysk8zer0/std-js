if (!('supports' in CSS)) {
	CSS.supports = function (prop, value) {
		var el = document.createElement('div');
		el.style = prop + ':' + value;
		return (getComputedStyle(el)[prop] === value);
	};
}
