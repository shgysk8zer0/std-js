[travis-ci]: https://travis-ci.org/shgysk8zer0/std-js.svg?branch=master
[promises]: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise
[mutations]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
# std-js ![Build Status][travis-ci]
## A JavaScript library for making front-end development sane!

[![Join the chat at https://gitter.im/shgysk8zer0/std-js](https://badges.gitter.im/shgysk8zer0/std-js.svg)](https://gitter.im/shgysk8zer0/std-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
> The purpose of this library is not so much to provide alternatives to jQuery, etc, but rather to provide polyfills and wrappers to native JavaScript, enabling use of modern JavaScript with less headache over browser support and implementation.  
It was, in part, influenced by the syntax of jQuery, but its purpose is different in that this places little emphasis on style and animation. Rather, its emphasis is on asynchronous event handling though [Mutation Observers][mutations] and [Promises][promises].
### Example
```js
$('a').filter(function(link) {
	return link.origin === location.origin;
}).click(function(event) {
	event.preventDefault();
	fetch(this.href).then(function(resp) {
		if (resp.ok) {
			history.pushState({}, document.title, link.href);
			if (resp.headers.get('Content-Type').startsWith('application/json')) {
				return resp.json();
			} else {
				throw 'Unsupported Content-Type in response.';
			}
		} else {
			throw 'Request failed';
		}
	}).then(...);
});
```
