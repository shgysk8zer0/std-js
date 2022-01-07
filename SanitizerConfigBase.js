import { events } from './attributes.js';

export const allowAttributes = undefined;
export const allowComments = false;
export const allowCustomElements = false;
export const allowElements = undefined;
export const blockElements = ['iframe', 'frame', 'object', 'embed', 'param'];
export const dropAttributes = Object.fromEntries(events.map(event => [event, ['*']]));
export const dropElements = ['script', 'link', 'title'];

export const SanitizerConfig = {
	allowAttributes, allowComments, allowElements, allowCustomElements,
	blockElements, dropAttributes, dropElements,
};
