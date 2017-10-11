import './shims.js';
import {loadHandler} from './funcs.js';
import kbdShortcuts from '../kbd_shortcuts.js';
import {$} from '../functions.js';
import Cookie from '../Cookie.js';

(async () => {
	const $body = $('body');
	const $doc = $(':root');
	$doc.replaceClass('no-js', 'js');
	$doc.data({foo: {a: 1, b: [1,2]}, fooBar: false});
	$doc.attr({lang: 'en', dir: 'ltr'});
	$body.attr({contextmenu: 'context-menu'});
	await $(document).ready(loadHandler).then($doc => $doc.keypress(kbdShortcuts));

	Cookie.set('foo', 'bar', {'max-age': 60, path: '/test'});
	Cookie.set('name', 'Chris', {'max-age': 60, path: '/test'});
	Cookie.set('gibberish', '~!@#$%^&*()_+{}|[]\\;:"<>,./?', {'max-age': 60, path: '/test'});
	Cookie.set(Cookie.get('gibberish'), 'Works', {'max-age': 60, path: '/test'});
	if (Cookie.has(Cookie.get('gibberish'))) {
		Cookie.delete('foo');
		console.log(Cookie.getAll());
		console.log(Cookie.get('gibberish'));
	}
})();
