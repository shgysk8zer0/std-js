/**
 * Import modules to improve support in legacy browsers.
 * Note: load order may be crucial, as some polyfills may rely on
 * e.g. `Object.fromEntries()`
 */
import './legacy/object.js';
import './legacy/array.js';
import './legacy/map.js';
import './legacy/element.js';
