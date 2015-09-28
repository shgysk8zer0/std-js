/*eslint no-use-before-define: 0*/
/*============================ zQ Functions =======================*/
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var zQ = (function () {
	function zQ() {
		var selector = arguments.length <= 0 || arguments[0] === undefined ? document : arguments[0];

		_classCallCheck(this, zQ);

		try {
			switch (typeof selector) {
				case 'string':
					this.results = document.querySelectorAll(selector);
					break;

				case 'object':
					this.results = selector instanceof zQ ? selector.results : [selector];
					break;

				case 'undefined':
					this.results = [document.documentElement];
					break;
			}
			this.query = selector || ':root';
		} catch (error) {
			console.error(error, this);
			console.error('No results for ' + this.query);
		} finally {
			this.length = this.results.length;
			this.found = this.results.length !== 0;
			this.filters = [];
		}
	}

	_createClass(zQ, [{
		key: 'item',
		value: function item(n) {
			return this.results.item(n);
		}
	}, {
		key: 'each',
		value: function each(callback) {
			if (this.found) {
				this.results.forEach(callback);
			}
			return this;
		}
	}, {
		key: 'toArray',
		value: function toArray() {
			if (!this.results.isArray) {
				this.results = Array.prototype.slice.call(this.results, 0);
			}
			return this;
		}
	}, {
		key: 'indexOf',
		value: function indexOf(i) {
			return this.results.indexOf(i);
		}
	}, {
		key: 'some',
		value: function some(callback) {
			return this.results.some(callback);
		}
	}, {
		key: 'every',
		value: function every(callback) {
			return this.results.every(callback);
		}
	}, {
		key: 'filter',
		value: function filter(callback) {
			this.filters.push(callback.toString());
			this.results = this.results.filter(callback);
			this.length = this.results.length;
			return this;
		}
	}, {
		key: 'map',
		value: function map(callback) {
			return this.results.map(callback);
		}
	}, {
		key: 'addClass',
		value: function addClass(cname) {
			this.each(function (el) {
				return el.classList.add(cname);
			});
			return this;
		}
	}, {
		key: 'removeClass',
		value: function removeClass(cname) {
			this.each(function (el) {
				return el.classList.remove(cname);
			});
			return this;
		}
	}, {
		key: 'hasClass',
		value: function hasClass(cname) {
			return this.some(function (el) {
				return el.classList.contains(cname);
			});
		}
	}, {
		key: 'toggleClass',
		value: function toggleClass(cname, condition) {
			if (typeof condition === 'undefined') {
				this.each(function (el) {
					return el.classList.toggle(cname);
				});
			} else {
				this.each(function (el) {
					return el.classList.toggle(cname, condition);
				});
			}
			return this;
		}
	}, {
		key: 'swapClass',
		value: function swapClass(cname1, cname2) {
			this.each(function (el) {
				return el.classList.swap(cname1, cname2);
			});
			return this;
		}
	}, {
		key: 'pickClass',
		value: function pickClass(cname1, cname2, condition) {
			condition ? this.addClass(cname1) : this.addClass(cname2);
			return this;
		}
	}, {
		key: 'remove',
		value: function remove() {
			this.each(function (el) {
				return el.remove();
			});
			return this;
		}
	}, {
		key: 'delete',
		value: function _delete() {
			return this.remove();
		}
	}, {
		key: 'hasAttribute',
		value: function hasAttribute(attr) {
			return this.some(function (el) {
				return el.hasAttribute(attr);
			});
		}
	}, {
		key: 'attr',
		value: function attr(_attr, val) {
			if (typeof val == 'undefined' || val === true) {
				val = '';
			}
			if (val === false) {
				this.each(function (el) {
					return el.removeAttribute(_attr);
				});
			} else {
				this.each(function (el) {
					return el.setAttribute(_attr, val);
				});
			}
			return this;
		}
	}, {
		key: 'pause',
		value: function pause() {
			this.each(function (media) {
				return media.pause();
			});
			return this;
		}

		/*==================== Listener Functions =================================*/
	}, {
		key: 'on',
		value: function on(event, callback) {
			this.each(function (e) {
				'addEventListener' in Element.prototype ? e.addEventListener(event, callback, true) : e['on' + event] = callback;
			});
			return this;
		}
	}, {
		key: 'ready',
		value: function ready(callback) {
			if (document.readyState !== 'loading') {
				callback();
				return this;
			}
			return this.on('DOMContentLoaded', callback);
		}
	}, {
		key: 'networkChange',
		value: function networkChange(callback) {
			return this.online(callback).offline(callback);
		}
	}, {
		key: 'playing',
		value: function playing(callback) {
			this.each(function (e) {
				return e.onplay = callback;
			});
			return this;
		}
	}, {
		key: 'paused',
		value: function paused(callback) {
			this.each(function (e) {
				return e.onpause = callback;
			});
			return this;
		}
	}, {
		key: 'visibilitychange',
		value: function visibilitychange(callback) {
			this.each(function (e) {
				['', 'moz', 'webkit', 'ms'].forEach(function (pre) {
					$(e).on(pre + 'visibilitychange', callback);
				});
			});
			return this;
		}
	}, {
		key: 'click',
		value: function click(callback) {
			return this.on('click', callback);
		}
	}, {
		key: 'dblclick',
		value: function dblclick(callback) {
			this.on('dblclick', callback);
		}
	}, {
		key: 'contextmenu',
		value: function contextmenu(callback) {
			return this.on('contextmenu', callback);
		}
	}, {
		key: 'keypress',
		value: function keypress(callback) {
			return this.on('keypress', callback);
		}
	}, {
		key: 'keyup',
		value: function keyup(callback) {
			return this.on('keyup', callback);
		}
	}, {
		key: 'keydown',
		value: function keydown(callback) {
			return this.on('keydown', callback);
		}
	}, {
		key: 'mouseenter',
		value: function mouseenter(callback) {
			return this.on('mouseenter', callback);
		}
	}, {
		key: 'mouseleave',
		value: function mouseleave(callback) {
			return this.on('mouseleave', callback);
		}
	}, {
		key: 'mouseover',
		value: function mouseover(callback) {
			return this.on('mouseover', callback);
		}
	}, {
		key: 'mouseout',
		value: function mouseout(callback) {
			return this.on('mouseout', callback);
		}
	}, {
		key: 'mousemove',
		value: function mousemove(callback) {
			return this.on('mousemove', callback);
		}
	}, {
		key: 'mousedown',
		value: function mousedown(callback) {
			return this.on('mousedown', callback);
		}
	}, {
		key: 'mouseup',
		value: function mouseup(callback) {
			return this.on('mouseup', callback);
		}
	}, {
		key: 'input',
		value: function input(callback) {
			return this.on('input', callback);
		}
	}, {
		key: 'change',
		value: function change(callback) {
			return this.on('change', callback);
		}
	}, {
		key: 'submit',
		value: function submit(callback) {
			return this.on('submit', callback);
		}
	}, {
		key: 'reset',
		value: function reset(callback) {
			return this.on('reset', callback);
		}
	}, {
		key: 'invalid',
		value: function invalid(callback) {
			return this.on('invalid', callback);
		}
	}, {
		key: 'select',
		value: function select(callback) {
			return this.on('select', callback);
		}
	}, {
		key: 'focus',
		value: function focus(callback) {
			return this.on('focus', callback);
		}
	}, {
		key: 'blur',
		value: function blur(callback) {
			return this.on('blur', callback);
		}
	}, {
		key: 'resize',
		value: function resize(callback) {
			return this.on('resize', callback);
		}
	}, {
		key: 'updateready',
		value: function updateready(callback) {
			return this.on('updateready', callback);
		}
	}, {
		key: 'DOMContentLoaded',
		value: function DOMContentLoaded(callback) {
			return this.on('DOMContentLoaded', callback);
		}
	}, {
		key: 'load',
		value: function load(callback) {
			if (document.readyState === 'complete') {
				callback();
				return this;
			}
			return this.on('load', callback);
		}
	}, {
		key: 'unload',
		value: function unload(callback) {
			return this.on('unload', callback);
		}
	}, {
		key: 'beforeunload',
		value: function beforeunload(callback) {
			return this.on('beforeunload', callback);
		}
	}, {
		key: 'abort',
		value: function abort(callback) {
			return this.on('abort', callback);
		}
	}, {
		key: 'error',
		value: function error(callback) {
			return this.on('error', callback);
		}
	}, {
		key: 'scroll',
		value: function scroll(callback) {
			return this.on('scroll', callback);
		}
	}, {
		key: 'drag',
		value: function drag(callback) {
			return this.on('drag', callback);
		}
	}, {
		key: 'offline',
		value: function offline(callback) {
			return this.on('offline', callback);
		}
	}, {
		key: 'online',
		value: function online(callback) {
			return this.on('online', callback);
		}

		/*visibilitychange(callback) {
  	return this.on('visibilitychange', callback);
  }*/
	}, {
		key: 'popstate',
		value: function popstate(callback) {
			return this.on('popstate', callback);
		}
	}, {
		key: 'pagehide',
		value: function pagehide(callback) {
			return this.on('pagehide', callback);
		}
	}, {
		key: 'watch',
		value: function watch(watching, options, attributeFilter) {
			/*https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver*/
			if (typeof options === 'undefined') {
				options = [];
			}
			/*var watcher = new MutationObserver(function(mutations) {
   	mutations.forEach(function(mutation) {
   		watching[mutation.type].call(mutation);
   	});
   })*/
			var watcher = new MutationObserver(function (mutations) {
				return mutations.forEach(function (mutation) {
					return watching[mutation.type].call(mutation);
				});
			}),
			    watches = {};
			Object.keys(watching).concat(options).forEach(function (event) {
				return watches[event] = true;
			});
			if (typeof attributeFilter !== 'undefined' && attributeFilter.isArray) {
				watches.attributeFilter = attributeFilter;
			}
			this.each(function (el) {
				return watcher.observe(el, watches);
			});
			return this;
		}

		/*====================================================================================================================*/
	}, {
		key: '$',
		value: (function (_$) {
			function $(_x) {
				return _$.apply(this, arguments);
			}

			$.toString = function () {
				return _$.toString();
			};

			return $;
		})(function (selector) {
			return $(this.query.split(',').map(function (str) {
				return selector.split(',').map(function (q) {
					return str.trim() + ' ' + q.trim();
				});
			})).join(', ');
		})
	}, {
		key: 'css',
		value: function css(args) {
			var style = document.styleSheets[document.styleSheets.length - 1];
			style.insertRule(this.query + ' {' + args + '}', style.cssRules.length);
			return this;
		}
	}]);

	return zQ;
})();

Object.prototype.$ = function (q) {
	if (this === document || this === window) {
		return $(q);
	}
	return $(this).$(q);
};
Object.prototype.isZQ = false;
zQ.prototype.isZQ = true;
function $() {
	var q = arguments.length <= 0 || arguments[0] === undefined ? document : arguments[0];

	return q.isZQ ? q : new zQ(q);
}
