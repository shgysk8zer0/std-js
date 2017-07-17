import './shims.js';
import {loadHandler} from './funcs.js';
import kbdShortcuts from '../kbd_shortcuts.js';
import {$} from '../functions.js';

document.body.classList.replace('no-js', 'js');

$(document).ready(loadHandler).keypress(kbdShortcuts);
