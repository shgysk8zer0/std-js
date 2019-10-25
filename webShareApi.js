import 'https://cdn.kernvalley.us/components/toast-message.js';
/**
 * Configure Web Share API Shim with share params {url, icon, label}s
 * @param share {url, icon, label)[, {}, [...]]
 * @return Promise
 */
export default (...shares) => {
	shares.forEach(share => share.url = new URL(share.url));
	if (! Navigator.prototype.hasOwnProperty('share')) {
		Navigator.prototype.share = async ({
			text  = null,
			title = null,
			url   = null,
		} = {}) =>   {

			if (text === null && title === null && url === null) {
				throw new TypeError('No known share data fields supplied. If using only new fields (other than title, text and url), you must feature-detect them first.');
			} else if (shares.length === 0) {
				throw new Error('No shares configured');
			} else {
				await customElements.whenDefined('toast-message');
				const HTMLToastMessageElement = customElements.get('toast-message');
				const toast = new HTMLToastMessageElement();
				const font   = 'Roboto, Helvetica, "Sans Seriff"';
				const header = document.createElement('header');
				const body   = document.createElement('div');
				const msg    = document.createElement('b');
				const size   = 64;
				const css = (el, rules) => {
					Object.entries(rules).forEach(([key, value]) => {
						el.style.setProperty(key, value);
					});
				};
				const styles = {
					header: {
						height: '47px',
						'line-height': '47px',
						'box-shadow': 'none',
						'border-bottom': '1px solid #d5d5d5',
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
					link.classList.add('inline-block');

					link.append(icon, document.createElement('br'), share.label);
					link.addEventListener('click', () => toast.close());
					body.append(link);
				});

				css(header, styles.header);
				css(msg, styles.msg);
				header.slot = 'content';
				body.slot = 'content';

				header.append(msg);
				toast.append(header, body);
				document.body.append(toast);
				await toast.show();
				await toast.closed;
				toast.remove();
			}

		};
	}
};
