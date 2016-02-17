import $ from './qsaArray.es6';
export default (selector, parent = document) => {
	let matches = Array.from(parent.querySelectorAll(selector));
	if (parent.matches(selector)) {
		matches.unshift(parent);
	}
	return matches;
}
