import { events } from './attributes.js';

export const allowAttributes = undefined;
export const allowComments = false;
export const allowCustomElements = false;
export const allowElements = undefined;
export const blockElements = ['frame'];
export const dropAttributes = Object.fromEntries(events.map(event => [event, ['*']]));
export const dropElements = ['script', 'link', 'title', 'noscript', 'head', 'body', 'object', 'embed', 'param', 'iframe'];

export const SanitizerConfig = {
	allowAttributes, allowComments, allowElements, allowCustomElements,
	blockElements, dropAttributes, dropElements,
};
