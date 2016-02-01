[build-status]: https://travis-ci.org/shgysk8zer0/std-js.svg?branch=master
[travis-ci]: https://travis-ci.org/shgysk8zer0/std-js
[gitter-badge]: https://badges.gitter.im/shgysk8zer0/std-js.svg
[gitter-link]: https://gitter.im/shgysk8zer0/std-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[promises]: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise
[mutations]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
# std-js
- - -
[![Build Status][build-status]][travis-ci] [![Join the chat at https://gitter.im/shgysk8zer0/std-js][gitter-badge]][gitter-link]
## A JavaScript library for making front-end development sane!

> The purpose of this library is not so much to provide alternatives to jQuery, etc, but rather to provide polyfills and wrappers to native JavaScript, enabling use of modern JavaScript with less headache over browser support and implementation.  
It was, in part, influenced by the syntax of jQuery, but its purpose is different in that this places little emphasis on style and animation. Rather, its emphasis is on asynchronous event handling though [Mutation Observers][mutations] and [Promises][promises].
The "$" function can be thought of as a NodeList converted into an array, with a few Element methods that will be run on each element, as well as event handlers (e.g. `$('a').click()`).

## Polyfills included:
- ### Array.prototype
  - `includes`
  - `some`
  - `every`
  - `from`
  - `of`
- ### Element.prototype
  - `remove`
  - `show`
  - `dataset`
  - `classList`
  - `matches`
- ### JSON
  - `parse`
  - `stringify`
- ### CSS
  - `escape`
  - `matches`
- `fetch`
- `URL`
- `Promise`
- A few more

## Recommendations for developers
- [ESLint](http://eslint.org/)
- [Babel](http://babeljs.io/)
- [Webpack](https://webpack.github.io/)

`npm install "babel-loader" "babel-core" "babel-preset-es2015" "webpack" "eslint"`

### Example
```js
import {default as $} from './zq.es6';
import * as polyfills from './polyfills.es6';

$('[data-remove]').click(function(click) {
	click.preventDefault();
	$(this.dataset.remove).remove();
});

$('a').filter(link => link.origin === location.origin && link.pathname !== location.pathname).click(function(click) => {
	click.preventDefault();
	let url = new URL(this.href);
	let headers = new Headers();
	headers.set('Accept', 'application/json');
	fetch(url, {
		headers,
		method: 'GET',
		credentials: 'include'
	}).then(resp => {
		if (resp.ok) {
			let type = resp.headers.get('Content-Type');
			if (type.startsWith('application/json')) {
				history.pushState({}, document.title, resp.url);
				return resp.json();
			} else {
				throw new Error(`Unsupported Content-Type: ${type}`);
			}
		} else {
			throw new Error(`<${resp.url}> ${resp.statusText}`);
		}
	}).then(json => {
		// Handle JSON
	}).catch(error => {
		console.error(error);
	});
});
```
