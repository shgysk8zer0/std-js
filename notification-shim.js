import { HTMLNotificationElement } from 'https://cdn.kernvalley.us/components/notification/html-notification.js';

export function supportsNotification() {
	try {
		if ('Notification' in window) {
			new Notification('');
			return Notification.permission !== 'denied';
		} else {
			return false;
		}
	} catch(err) {
		return ! (err instanceof TypeError);
	}
}

if (! supportsNotification()) {
	window.Notification = HTMLNotificationElement;
}

export function notify(title, init = {}) {
	if (Notification.permission === 'granted') {
		return new Notification(title, init);
	} else {
		return new HTMLNotificationElement(title, init);
	}
}
