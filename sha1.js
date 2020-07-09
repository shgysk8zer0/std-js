import { hash } from './hash.js';

export default async function sha1(str) {
	return hash(str, 'SHA-1');
}
