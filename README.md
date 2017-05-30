# std-js

- - -

[![Build Status](https://travis-ci.org/shgysk8zer0/std-js.svg?branch=master)](https://travis-ci.org/shgysk8zer0/std-js)
[![Join the chat at https://gitter.im/shgysk8zer0/std-js](https://badges.gitter.im/shgysk8zer0/std-js.svg)](https://gitter.im/shgysk8zer0/std-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## A JavaScript library for making front-end development sane!

## Navigation
- [Installing](#installing)
- [Contributing](./CONTRIBUTING.md)
- [Contact](#contact-developer)
- [Exporting](#exporting)
- [Importing](#importing)
- [Example](#example)

> The purpose of this library is not so much to provide alternatives to jQuery, etc,
> but rather to provide polyfills and wrappers to native JavaScript, enabling use
> of modern JavaScript with less headache over browser support and implementation.  
> It was, in part, influenced by the syntax of jQuery, but its purpose is different
> in that this places little emphasis on style and animation. Rather, its
> emphasis is on asynchronous event handling though [Mutation Observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
> and [Promises](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise).
> The "$" function can be thought of as a NodeList converted into an array, with
> a few Element methods that will be run on each element, as well as event handlers
> (e.g. `$('a').click()`).

### Installing
Simply clone or add as a submodule:

`git submodule add git://github.com/shgysk8zer0/std-js.git path/to/use`

### Contact Developer
- [Open an issue](https://github.com/shgysk8zer0/std-js/issues)
- [Email](mailto:shgysk8zer0@gmail.com?subject=std-js)

### Exporting
```js
// exports.js
// Export class/function/constant
export function myFunc() {
  // Function body
}
export function unused() {
  // Funciton body
}
export class MyClass {
  // Class body
}
export const FOO = 'bar';
```

```js
// Spiffy.js
// Default export (can only specify on default and should be only export)
export default class Spiffy {
  // Class body
}
```
### Importing
```js
// main.js
// Import specific functions/classes/classses
// Must be valid relative or absolute path, so replative paths
// must begin with "./" or "../" and must contain extension
import {myFunc, MyClass} from './exports.js';

// Or import everything into an object / namespace
import * as exports from './exports.js';
/**
 * const exports = {myFunc, unused, MyClass, FOO};
 */

// Import default (`export default`)
import Spiffy from './Spiffy.js';

// Import everything from a remote script
import 'https://cdn.polyfill.io/v2/polyfill.min.js';
```

### Example
```js
import {$} from './functions.js';
import handleJSON from './json_response.js';
import * as mutations from './mutations.js';

$(self).load(() => {
  $('[data-remove]').click(mutations.remove);
  $(document.body).watch(mutations.events, mutations.options, mutations.filter);
  $('a').filter(link => link.origin === location.origin && link.pathname !== location.pathname).click(async function(click) => {
    click.preventDefault();
    let url = new URL(this.href);
    let headers = new Headers();
    headers.set('Accept', 'application/json');

    const resp = fetch(url, {
      headers,
      method: 'GET',
      credentials: 'include'
    });
    if (resp.ok) {
      const json = await resp.json();
      handleJSON(json);
      history.pushState(json, document.title, resp.url);
    } else {
      throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
    }
  });
});
```
