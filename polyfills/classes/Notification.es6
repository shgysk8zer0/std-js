export default class Notification {
	constructor(title, options = {}) {
		this.title = title;
		this.dir = options.dir || 'auto';
		this.body = options.body || '';
		this.icon = options.icon || '';
		this.lang = options.lang || '';
		this.tag = options.tag || '';
		this.sticky = options.stick || false;
		if ('mozNotificationz' in navigator) {
			let notification = navigator.mozNotification(this.title, this.body, this.icon);
		} else {
			alert(`${this.title}\n${this.body}`);
		}
	}
}
