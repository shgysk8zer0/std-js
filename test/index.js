import '../shims.js';
import '../deprefixer.js';
import {loadHandler} from './funcs.js';
import kbdShortcuts from '../kbd_shortcuts.js';
import {$, ready} from '../functions.js';

ready().then(async () => {
	const $body = $('body');
	const $doc = $(':root');
	$doc.replaceClass('no-js', 'js');
	$doc.data({foo: {a: 1, b: [1,2]}, fooBar: false});
	$doc.attr({lang: 'en', dir: 'ltr'});
	$body.attr({contextmenu: 'context-menu'});
	$doc.keypress(kbdShortcuts);
	document.body.append(await $('link[rel="import"]').import());
	loadHandler();
});
