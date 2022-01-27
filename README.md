# std-js

![Node CI](https://github.com/shgysk8zer0/std-js/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/shgysk8zer0/std-js/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/shgysk8zer0/std-js.svg)](https://github.com/shgysk8zer0/std-js/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/shgysk8zer0/std-js.svg)](https://github.com/shgysk8zer0/std-js/commits/master)
[![GitHub release](https://img.shields.io/github/release/shgysk8zer0/std-js.svg)](https://github.com/shgysk8zer0/std-js/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0)](https://github.com/sponsors/shgysk8zer0)

[![GitHub followers](https://img.shields.io/github/followers/shgysk8zer0.svg?style=social)](https://github.com/shgysk8zer0)
![GitHub forks](https://img.shields.io/github/forks/shgysk8zer0/std-js.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/shgysk8zer0/std-js.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
![Keybase PGP](https://img.shields.io/keybase/pgp/shgysk8zer0.svg)
![Keybase BTC](https://img.shields.io/keybase/btc/shgysk8zer0.svg)
- - -

## A JavaScript library for making front-end development sane

## Navigation
- [Installing](#installing)
- [Contributing](./.github/CONTRIBUTING.md)
- [Contact](#contact-developer)
- [Exporting](#exporting)
- [Importing](#importing)
- [Example](#example)

> This ain't jQuery or React or any of that... This is a JavaScript library for
> front-end developers who want the full power that modern JavaScript has to
> offer with minimal bundle sizes, polyfills where needed, and a familiar but
> terse syntax. It's friendly enough for beginners, but powerful enough for even
> the most experienced developer.

> It supports your [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
> It supports [`trustedTypes`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicy)
> and [`Sanitizer`](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
> and [`cookieStore`](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore)
> and your [`navigator.locks`](https://developer.mozilla.org/en-US/docs/Web/API/LockManager).
> And if you call in the next five minutes, I'll even throw in support for
> `array.groupBy()` & `set.difference()` (*TC39 proposals*) for free!

### Installing
Were you expecting this to be where I tell you to `npm install` something?

![We don't do that here meme](https://i.imgflip.com/2si67r.jpg)

Maybe someday it'll be published on NPM, but until then you can either download
it or add it as a submodule. There's just no reason for this to be restricted to
NPM or to rely on it, and we're all using `git` anyways, right?

```bash
git submodule add https://github.com/shgysk8zer0/std-js.git path/to/use
```

**To Update** `git submodule update --remote /path/to/use` (*assuming you added as a submodule*).

**Tip 1** Since this is all native JavaScript modules, you can easily plop everything
on some CDN and `import { stuff } from 'https://cdn.example.com/js/std-js/stuff.js';`.

**Tip 2** Use [Dependabot](https://github.com/dependabot) to automatically get
Pull Requests when a submodule (*like std-js*) is updated.

### Contact Developer
- [Open an issue](https://github.com/shgysk8zer0/std-js/issues)

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
// Default export (can only specify one default and should be only export)
export default class Spiffy {
  // Class body
}
```
### Importing
```js
// dialog.js
// Does not export anything.
if (! ('HTMLDialogElement' in window)) {
  Object.defineProperty(HTMLUnknownElement.prototype, 'open', {
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
// Import and run dialog.js
import './dialog.js';

// Import specific functions/classes/objects/etc.
// Must be valid relative or absolute path, so relative paths
// must begin with "./" or "../" and must contain extension.
// importing `as` aliases an import, allowing renaming from the name exported
import {myFunc, MyClass as CustomClass} from './exports.js';

// Or import everything into an object / namespace
import * as exports from './exports.js';
/**
 * const exports = { myFunc, unused, MyClass, FOO };
 */

// Import default (matching `export default`)
import Spiffy from './Spiffy.js';

// Import everything from a remote script
import 'https://cdn.polyfill.io/v2/polyfill.min.js';
```

### Example
```js
import './shims/sanitizer.js';
import './shims/trust.js';
import './shims/cookieStore.js';
import { html, on, attr, data, supportsElement, toggleClass } from './dom.js';
import { loadStylesheet, loadImage, preconnect } from './loader.js';
import { prefersColorScheme } from './match-media.js';
import { createPolicy } from './trust.js';
import { getJSON } from './http.js';
import { pwned } from './pwned.js';
import { YEARS } from './date-consts.js';
import { md5 } from './hash.js';
import { getBeforeUnloadSignal } from './abort.js';
// std-js does not provide these... They're just here for example
import { title, allowedOrigins } from './consts.js';
import { getCookiesConsent, createResultCard } from './funcs.js';

toggleClass(document.documentElement, {
  'no-dialog': ! supportsElement('dialog'),
  'no-details': ! supportsElement('details'),
  'js': true,
  'no-js': false,
});

const policy = createPolicy('default', {
  createHTML: input => new Sanitizer().sanitizeFor('div', input).innerHTML,
  createScript: () => trustedTypes.emptyScript,
  createScriptURL: input => {
    if (allowedorigins.includes(new URL(input, document.baseURI).origin)) {
      return input;
    } else {
      throw new Error(`Untrusted script URL: '${input}'`);
    }
  },
});

const signal = getBeforeUnloadSignal();

data(':root', {
  theme: prefersColorScheme(), // 'light' or 'dark'
  layout: 'default',
});

loadStylesheet('/style.css');

cookieStore.get({ name: 'cookie-consent' }).then(async cookie => {
  if (cookie == null) {
    if (await geCookieConsent()) {
      cookieStore.set({ name: 'cookie-consent', value: 'granted', expires: 2 * YEARS });
    }
  }
});

ready({ signal }).then(() => {
  html('heading', policy.createHTML(title));
  preconnect('https://api.pwnedpasswords.com');
  preconnect('https://secure.gravatar.com');
  
  on('input[type="password"]', {
    change: async ({ target }) => {
      attr('.pwned-notice', { hidden: ! await pwned(target.value) });
    }
  }, { signal });
  
  on('input[type="email"]', {
    change: async ({ target }) => {
      if (target.validity.valid) {
        const hash = await md5(input.value);
        const url = new URL(hash, 'https://secure.gravatar.com/avatar/');
        url.searchParams.set('s', 96);
        const img = await loadImage(url, { height: 96, width: 96 });
        document.getElementById('gravatar-container').replaceChildren(img);
      }
    }
  }, { signal });
  
  on(document.forms.search, {
    submit: async event => {
      event.preventDefault();
      const body = new FormData(event.target);
      const results = await getJSON(event.target.action, { body, signal });
      document.getElementById('search-results').replaceChildren(...await Array.fromAsync(results));
    },
    reset: () => document.getElementById('search-results').replaceChildren(),
  }, { signal });
});
```
