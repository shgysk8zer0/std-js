export default class ShareTarget {
	/**
	 * For use with the ShareTarget API.
	 * Also useful as example of use of this API.
	 *
	 * @see https://web.dev/web-share-target/
	 * @param Object init - such as "share_target" from webapp manifest
	 * @param FormData formData
	 */
	constructor({
		method  = 'GET',
		enctype = 'application/x-www-form-urlencoded',
		// action  = null,
		params  = {
			title: 'title',
			text:  'text',
			url:   'url',
			files: {},
		},
	} = {}, formData = null) {
		this.title = null;
		this.text  = null;
		this.url   = null;
		this.files = {};

		// @TODO check `location.pathname` against `action`
		switch(method) {
			case 'GET':
				((search) => {
					this.title = search.get(params.title || 'title');
					this.text  = search.get(params.text  || 'text');
					this.url   = search.get(params.url   || 'url');
				})(new URL(location.href).searchParams);
				break;

			case 'POST':
				if (! (formData instanceof FormData)) {
					throw new Error('For POST shares, pass in a `FormData` object after config');
				} else {
					this.title = formData.get(params.title || 'title');
					this.text  = formData.get(params.text  || 'text');
					this.url   = formData.get(params.url   || 'url');

					// Files only supported with enctype of 'multipart/form-data'
					if (enctype === 'multipart/form-data') {
						this.files = Object.fromEntries(params.files.map(({name/*, accept = []*/}) => {
							if (formData.has(name)) {
								const file = formData.get(name);

								// @TODO check `accept` against `file.type`
								if (! (file instanceof File)) {
									throw new Error(`POST ${name} expects a file`);
								} else {
									return [name, file];
								}
							} else {
								return [name, null];
							}
						}));
					}
				}
				break;

			default: throw new Error(`Unsupported method: ${method}`);
		}
	}
}
