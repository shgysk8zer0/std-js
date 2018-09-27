import '../shims.js';
import '../deprefixer.js';
import {loadHandler} from './funcs.js';
import kbdShortcuts from '../kbd_shortcuts.js';
import {$, ready, getImports} from '../functions.js';

ready().then(async () => {
	const $body = $('body');
	const $doc = $(':root');
	$doc.replaceClass('no-js', 'js');
	$doc.data({foo: {a: 1, b: [1,2]}, fooBar: false});
	$doc.attr({lang: 'en', dir: 'ltr'});
	$body.attr({contextmenu: 'context-menu'});
	$doc.keypress(kbdShortcuts);

	const items = await getImports();
	items.forEach(item => document.body.append(...item.content.body.children));
	loadHandler();
});
