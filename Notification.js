import { css } from './dom.js';

export default class Notification {
	constructor(title, {
		body = '',
		icon = '',
		dir = 'auto',
		lang = '',
		// tag = '',
		onclick = null,
		onerror = null,
	} = {}) {
		this.title = title;
		this.body = body;
		this.icon = icon;
		this._dialog = document.createElement('dialog');
		this._dialog.lang = lang;
		this._dialog.dir = dir;
		this.onclick = onclick;
		this.onerror = onerror;

		try {
			const titleEl = document.createElement('b');
			const img = new Image(60, 60);
			const msg = document.createElement('div');
			const btn = document.createElement('button');
			const container = document.createElement('div');

			btn.type = 'button';
			btn.textContent = 'X';

			titleEl.textContent = title;

			css(btn, {
				position: 'absolute',
				right: '3px',
				top: '3px',
				background: 'transparent',
				border: 'none',
				color: '#000',
			});

			css(titleEl, {
				display: 'block',
				margin: '8px'
			});

			css(img, {
				float: 'left',
				'max-height': '60px',
				'max-width': '60px',
				height: 'auto',
				width: 'auto',
				'margin-right': '10px',
			});

			css(msg, {
				float: 'left',
				display: 'inline-block',
			});

			css(this._dialog, {
				background: '#FEFEFE',
				'font-family': 'system-ui',
				'font-size': '14px',
				clear: 'both',
				border: 'none',
				position: 'fixed',
				top: '12px',
				right: '12px',
				left: 'initial',
				width: '320px',
				height: '110px',
				padding: '4px',
				'border-radius': '2px',
				'box-shadow': '4px 4px 4px rgba(0,0,0,0.7)',
			});

			css(container, {
				clear: 'both',
				padding: '2px',
			});

			img.src = icon;
			msg.textContent = body;

			container.append(img, msg);
			this._dialog.append(titleEl, btn, container);

			btn.addEventListener('click', () => {
				this.close();
			});

			this.addEventListener('click', event => {
				if (this.onclick instanceof Function) {
					this.onclick(event);
				}
				this.close();
			});

			this.addEventListener('error', event => {
				if (this.onerror instanceof Function) {
					this.onerror(event);
				}
			});
			setTimeout(() => {
				document.body.append(this._dialog);
				if (this._dialog.show instanceof Function) {
					this._dialog.show();
				}
				if (Element.prototype.animate instanceof Function) {
					this._dialog.animate([
						{
							opacity: 0,
							top: '-120px'
						},
						{
							opacity: 1,
							top: '12px',
						},
					], {
						duration: 400,
						easing: 'ease-in-out',
						fill: 'both',
					});
				}
				this.dispatchEvent(new CustomEvent('show'));
			}, 10);
		} catch (error) {
			this.dispatchEvent(new ErrorEvent(error));
		}
	}

	close() {
		try {
			if (Element.prototype.animate instanceof Function) {
				const anim = this._dialog.animate([
					{
						opacity: 1,
						top: '12px',
					},{
						opacity: 0,
						top: '-120px'
					},
				], {
					duration: 400,
					easing: 'ease-in-out',
					fill: 'both',
				});
				anim.addEventListener('finish', () => {
					this._dialog.remove();
				});
			} else {
				this._dialog.remove();
			}
			this.dispatchEvent(new CustomEvent('close'));
		} catch(error) {
			this.dispatchEvent(new ErrorEvent(error));
		}
	}

	addEventListener(...args) {
		this._dialog.addEventListener(...args);
	}

	dispatchEvent(event) {
		this._dialog.dispatchEvent(event, this);
	}

	static async requestPermission() {
		return Notification.permission;
	}

	static get permission() {
		return 'granted';
	}
}
