# std-js

![Node CI](https://github.com/shgysk8zer0/std-js/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/shgysk8zer0/std-js/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/shgysk8zer0/std-js.svg)](https://github.com/shgysk8zer0/std-js/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/shgysk8zer0/std-js.svg)
![GitHub release](https://img.shields.io/github/release/shgysk8zer0/std-js.svg)

![GitHub followers](https://img.shields.io/github/followers/shgysk8zer0.svg?style=social)
![GitHub forks](https://img.shields.io/github/forks/shgysk8zer0/std-js.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/shgysk8zer0/std-js.svg?style=social)
![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
![Keybase PGP](https://img.shields.io/keybase/pgp/shgysk8zer0.svg)
![Keybase BTC](https://img.shields.io/keybase/btc/shgysk8zer0.svg)
- - -

## A JavaScript library for making front-end development sane

## Navigation
- [Installing](#installing)
- [Contributing](./docs/CONTRIBUTING.md)
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
- [Email](mailto:admin@kernvalley.us?subject=std-js)

### Exporting
```js
// exports.js
// Export class/function/constant
export function myFunc() {
  // Function body
}

function notExported() {
  // Function body
}

export function unused() {
  // Function body
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
// shim.js
// Does not export anything.
if (! ('HTMLDialogElement' in window)) {
  Object.defineProperty(HTMLElement.prototype, 'open', {
    get: function() {
      return this.hasAttribute('open');
    },
    set: function(open) {
      if (open) {
        this.setAttribute('open', '');
      } else {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      }
    }
  });
}
```
```js
// main.js
// Import and run shim.js
import './shim.js';

// Import specific functions/classes/objects/etc.
// Must be valid relative or absolute path, so relative paths
// must begin with "./" or "../" and must contain extension.
// importing `as` aliases an import, allowing renaming from the name exported
import {myFunc, MyClass as CustomClass} from './exports.js';

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
import {$, wait} from './functions.js';
import handleJSON from './json_response.js';
import * as mutations from './mutations.js';

// Note that almost all DOM operations are async
$(document).ready(async () => {
  $('[data-remove]').click(mutations.remove);
  $('[data-show-modal]').click(mutations.showModal);
  $(document.body).watch(mutations.events, mutations.options, mutations.filter);

  // Use promises
  $('#container p').some(p => p.textContent.startsWith('Lorem impsum')).then(ipsum => {
    if (ipsum) {
      $('.no-ipum').hide();
    }
  });
  // Or `await` results (Here, to search nodes by their text)
  // In this example, `found` would be a regular `Element`
  const found = await $('div').find(el => el.textContent.startsWith('Delete me'));
  if (found) {
    found.remove();
  }

  document.querySelector('.someClass').textContent = 'baz ';
  // Will most likely result in textContent of "baz foo bar"
}, {once: true});
```
