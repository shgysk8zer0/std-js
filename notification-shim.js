import { HTMLNotificationElement } from 'https://cdn.kernvalley.us/components/notification/html-notification.js';

function supportsNotification() {
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
