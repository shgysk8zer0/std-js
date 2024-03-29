/**
 * From: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 */
export function uuidv4() {
	return crypto.randomUUID();
}

/**
 * From https://www.arungudelli.com/tutorial/javascript/how-to-create-uuid-guid-in-javascript-with-examples/
 */
export function uuidv6() {
	console.warn('This generates a UUIDv4, not UUIDv6');
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
