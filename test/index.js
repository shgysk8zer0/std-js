import './shims.js';
import {loadHandler} from './funcs.js';
import kbdShortcuts from '../kbd_shortcuts.js';
import {$} from '../functions.js';
import Cookie from '../Cookie.js';

(async () => {
	$('body').replaceClass('no-js', 'js');
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
