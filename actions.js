const click = {
	print: () => window.print(),
	back: () => history.back(),
	forward: () => history.forward(),
	reload: () => location.reload(),
};

function hasClickHandler(action) {
	return click.hasOwnProperty(action);
}

function hasClickProp(element) {
	return element instanceof Element && element.dataset.hasOwnProperty('click');
}

export function addClickHandler(attr, handler) {
	click[attr] = handler;
}

export function setClickHandler(element, handler) {
	element.addEventListener('click', click[handler]);
}

export function removeClickHandler(element, ...handlers) {
	handlers.forEach(handler => {
		if (element.dataset.click !== handler) {
			element.removeEventListener('click', click[handler]);
		}
	});
}

export function clickHandler(element) {
	if (hasClickProp(element) &&  hasClickHandler(element.dataset.click)) {
		setClickHandler(element, element.dataset.click);
	} else {
		removeClickHandler(element, ...Object.keys(click));
	}
}
