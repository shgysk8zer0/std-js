/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
export const events = Object.keys(
	Object.getOwnPropertyDescriptors(HTMLElement.prototype)
).filter(desc => desc.startsWith('on'));

export const urls = [
	'action',
	'cite',
	'formaction',
	'href',
	'ping',
	'src',
];
