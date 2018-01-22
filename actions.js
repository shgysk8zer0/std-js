const actions = {
	print: () => window.print(),
	back: () => history.back(),
	forward: () => history.forward(),
	reload: () => location.reload(),
};

function hasAction(action) {
	return actions.hasOwnProperty(action);
}

function hasProp(event) {
	return event.target instanceof Element && event.target.dataset.hasOwnProperty('action');
}

export function addAction(event, handler) {
	actions[event] = handler;
}

export default function actionHandler(event) {
	event.preventDefault();
	if (hasProp(event) && hasAction(event.target.dataset.action)) {
		actions[event.target.dataset.action]();
	}
}
