import './shims.js';
import {loadHandler} from './funcs.js';
import kbdShortcuts from '../kbd_shortcuts.js';

document.body.classList.replace('no-js', 'js');
self.addEventListener('keypress', kbdShortcuts);
self.addEventListener('load', loadHandler, {once: true});
