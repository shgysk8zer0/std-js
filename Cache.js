'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CACHE_PREFIX = 'cache ';

var Cache = (function () {
	function Cache() {
		_classCallCheck(this, Cache);
	}

	_createClass(Cache, [{
		key: 'has',
		value: function has(name) {
			return localStorage.hasOwnProperty(_convertName(name));
		}
	}, {
		key: 'get',
		value: function get(name) {
			return localStorage.getItem(_convertName(name));
		}
	}, {
		key: 'set',
		value: function set(name, value) {
			localStorage.setItem(_convertName(name), value);
			return this;
		}
	}, {
		key: 'unset',
		value: function unset(name) {
			localStorage.removeItem(_convertName(name));
		}
	}, {
		key: 'keys',
		value: function keys() {
			return Object.keys(localStorage).filter(function (key) {
				return key.startsWith(CACHE_PREFIX);
			});
		}
	}, {
		key: 'each',
		value: function each(callback) {
			this.keys.forEach(callback);
		}
	}, {
		key: 'clear',
		value: function clear() {
			var _this = this;

			this.keys().forEach(function (key) {
				return _this.unset(key);
			});
			return this;
		}
	}, {
		key: '_convertName',
		value: function _convertName(name) {
			return ('' + CACHE_PREFIX + name).camelCase();
		}
	}]);

	return Cache;
})();

