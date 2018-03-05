// TODO: Remove JavaScript style & animations & create rules in core-css
/**
 * Configure Web Share API Shim with share params {url, icon, label}s
 * @param share {url, icon, label)[, {}, [...]]
 * @return Promise
 */
export default (...shares) => {
	shares.forEach(share => share.url = new URL(share.url));
	if (! Navigator.prototype.hasOwnProperty('share')) {
		Navigator.prototype.share = ({
			text  = null,
			title = null,
			url   = null,
		} = {}) =>   new Promise((resolve, reject) => {
			const size   = 64;
			const dialog = document.createElement('dialog');
			const header = document.createElement('header');
			const close  = document.createElement('button');
			const body   = document.createElement('div');
			const msg    = document.createElement('b');
			const font   = 'Roboto, Helvetica, "Sans Seriff"';

			const styles = {
				dialog: {
					display: 'block',
					position: 'fixed',
					background: '#fefefe',
					top: '0',
					bottom: 'auto',
					left: '0',
					right: '0',
					transform: 'none',
					'border-radius': '0 0 5px 5px',
					'max-height': '500px',
				},
				header: {
					height: '47px',
					'line-height': '47px',
					color: '#232323',
					'box-shadow': 'none',
					'border-bottom': '1px solid #d5d5d5',
				},
				closeBtn: {
					float: 'right',
					'font-family': font,
					'font-weight': 'bold',
					'font-size': '16px',
					color: 'black',
					border: 'none',
					background: 'transparent',
				},
				msg: {
					'font-family': font,
					'font-size': '24px',
					display: 'block',
				},
				link: {
					display: 'inline-block',
					margin: '0.3em',
					'text-decoration': 'none',
					color: '#626262',
					'text-align': 'center',
					'font-family': font,
					'font-size': '20px',
				},
			};

			function closeDialog(event) {
				if (
					(event.type === 'click'
						&& ! event.target.matches('dialog[open],dialog[open] *')
					) || (event.type === 'keypress' && event.code === 'Escape')
				) {
					dialog.close('Share canceled');
				}
			}

			function css(el, rules) {
				Object.entries(rules).forEach(([key, value]) => {
					el.style.setProperty(key, value);
				});
			}

			function closeHandler(event) {
				if (Element.prototype.hasOwnProperty('animate')) {
					const rects = dialog.getClientRects()[0];
					const anim = dialog.animate([
						{top: 0},
						{top: `-${rects.height}px`},
					], {
						duration: 400,
						easing:   'ease-out',
						fill:     'both',
					});
					anim.onfinish = () => dialog.remove();
					anim.onerror = () => dialog.remove();
					anim.oncancel = () => dialog.remove();
				} else {
					dialog.remove();
				}

				document.removeEventListener('keypress', closeDialog);
				document.removeEventListener('click', closeDialog);
				reject(new DOMException(event.detail));
			}

			if (text === null && title === null && url === null) {
				reject(new TypeError('No known share data fields supplied. If using only new fields (other than title, text and url), you must feature-detect them first.'));
			} else if (shares.length === 0) {
				reject(new Error('No shares configured'));
			} else {
				msg.textContent = 'Share via';
				close.title     = 'Close dialog';

				shares.forEach(share => {
					const link = document.createElement('a');
					const icon = new Image(size, size);

					if (share.url.searchParams.has('url')) {
						share.url.searchParams.set('url', url);
					} else if (share.url.searchParams.has('u')) {
						share.url.searchParams.set('u', url);
					}

					if (share.url.searchParams.has('title')) {
						share.url.searchParams.set('title', title);
					} else if (share.url.searchParams.has('t')) {
						share.url.searchParams.set('t', title);
					} else if (share.url.searchParams.has('subject')) {
						share.url.searchParams.set('subject', title);
					} else if (share.url.searchParams.has('su')) {
						share.url.searchParams.set('su', title);
					}

					if (share.url.searchParams.has('text')) {
						share.url.searchParams.set('text', text);
					} else if (share.url.searchParams.has('summary')) {
						share.url.searchParams.set('summary', text);
					} else if (share.url.searchParams.has('body')) {
						share.url.searchParams.set('body', `${text}\n${url}`);
					}

					css(link, styles.link);

					link.target = '_blank';
					icon.src    = share.icon.toString();
					link.href   = share.url.toString();
					link.title  = share.label;

					link.append(icon, document.createElement('br'), share.label);
					body.append(link);

					link.addEventListener('click', () => {
						resolve();
						dialog.close();
					});
				});

				css(dialog, styles.dialog);
				css(header, styles.header);
				css(msg, styles.msg);
				css(close, styles.closeBtn);

				if (CSS.supports('width', 'fit-content')) {
					dialog.style.setProperty('width', 'fit-content');
				} else if (CSS.supports('width', '-moz-fit-content')) {
					dialog.style.setProperty('width', '-moz-fit-content');
				} else if (CSS.supports('width', '-webkit-fit-content')) {
					dialog.style.setProperty('width', '-webkit-fit-content');
				} else {
					dialog.style.setProperty('min-width', '320px');
				}

				header.append(close, msg);
				close.append('X');
				dialog.append(header);
				dialog.append(body);
				document.body.append(dialog);
				dialog.showModal();

				if (Element.prototype.hasOwnProperty('animate')) {
					const rects = dialog.getClientRects()[0];

					dialog.animate([
						{top: `-${rects.height}px`},
						{top: 0},
					], {
						duration: 400,
						easing:   'ease-out',
						fill:     'both',
					});
				}

				dialog.addEventListener('close', closeHandler, {once: true});
				document.addEventListener('keypress', closeDialog);
				document.addEventListener('click', closeDialog);
				close.addEventListener('click', () => {
					dialog.close('Share canceled');
				}, {once: true});
			}
		});
	}
};
