import { HTMLNotificationElement } from 'https://cdn.kernvalley.us/components/notification/html-notification.js';

function supportsNotification() {
	if ('Notification' in window && Notification.permission !== 'denied') {
		try {
			new Notification('').close();
			return true;
		} catch(err) {
			return ! (err instanceof TypeError);
		}
	} else {
		return false;
	}
}

if (! supportsNotification()) {
	window.Notification = HTMLNotificationElement;
}
