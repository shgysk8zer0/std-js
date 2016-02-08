function isCallable(fn) {
  return typeof fn === 'function' || tObject.prototype.toString.call(fn) === '[object Function]';
}
function toInteger(value) {
  var number = Number(value);
  if (isNaN(number)) {
	  return 0;
  }
  if (number === 0 || !isFinite(number)) {
	  return number;
  }
  return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
}
let maxSafeInteger = Math.pow(2, 53) - 1;
function toLength(value) {
  var len = toInteger(value);
  return Math.min(Math.max(len, 0), maxSafeInteger);
}

export default class {
	static from(arrayLike/*, mapFn, thisArg */) {
	  // 1. Let C be the this value.
	  var C = this;

	  // 2. Let items be ToObject(arrayLike).
	  var items = Object(arrayLike);

	  // 3. ReturnIfAbrupt(items).
	  if (arrayLike == null) {
		throw new TypeError('Array.from requires an array-like object - not null or undefined');
	  }

	  // 4. If mapfn is undefined, then let mapping be false.
	  var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
	  var T;
	  if (typeof mapFn !== 'undefined') {
		// 5. else
		// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
		if (!isCallable(mapFn)) {
		  throw new TypeError('Array.from: when provided, the second argument must be a function');
		}

		// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 2) {
		  T = arguments[2];
		}
	  }

	  // 10. Let lenValue be Get(items, "length").
	  // 11. Let len be ToLength(lenValue).
	  var len = toLength(items.length);

	  // 13. If IsConstructor(C) is true, then
	  // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
	  // 14. a. Else, Let A be ArrayCreate(len).
	  var A = isCallable(C) ? Object(new C(len)) : new Array(len);

	  // 16. Let k be 0.
	  var k = 0;
	  // 17. Repeat, while k < len… (also steps a - h)
	  var kValue;
	  while (k < len) {
		kValue = items[k];
		if (mapFn) {
		  A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
		} else {
		  A[k] = kValue;
		}
		k += 1;
	  }
	  // 18. Let putStatus be Put(A, "length", len, true).
	  A.length = len;
	  // 20. Return A.
	  return A;
	}

	of(...args) {
		return args;
	}

	map(callback, thisArg) {

	  var T, A, k;

	  if (this == null) {
		throw new TypeError(' this is null or not defined');
	  }

	  // 1. Let O be the result of calling ToObject passing the |this|
	  //    value as the argument.
	  var O = Object(this);

	  // 2. Let lenValue be the result of calling the Get internal
	  //    method of O with the argument "length".
	  // 3. Let len be ToUint32(lenValue).
	  var len = O.length >>> 0;

	  // 4. If IsCallable(callback) is false, throw a TypeError exception.
	  // See: http://es5.github.com/#x9.11
	  if (typeof callback !== 'function') {
		throw new TypeError(callback + ' is not a function');
	  }

	  // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	  if (arguments.length > 1) {
		T = thisArg;
	  }

	  // 6. Let A be a new array created as if by the expression new Array(len)
	  //    where Array is the standard built-in constructor with that name and
	  //    len is the value of len.
	  A = new Array(len);

	  // 7. Let k be 0
	  k = 0;

	  // 8. Repeat, while k < len
	  while (k < len) {

		var kValue, mappedValue;

		// a. Let Pk be ToString(k).
		//   This is implicit for LHS operands of the in operator
		// b. Let kPresent be the result of calling the HasProperty internal
		//    method of O with argument Pk.
		//   This step can be combined with c
		// c. If kPresent is true, then
		if (k in O) {

		  // i. Let kValue be the result of calling the Get internal
		  //    method of O with argument Pk.
		  kValue = O[k];

		  // ii. Let mappedValue be the result of calling the Call internal
		  //     method of callback with T as the this value and argument
		  //     list containing kValue, k, and O.
		  mappedValue = callback.call(T, kValue, k, O);

		  // iii. Call the DefineOwnProperty internal method of A with arguments
		  // Pk, Property Descriptor
		  // { Value: mappedValue,
		  //   Writable: true,
		  //   Enumerable: true,
		  //   Configurable: true },
		  // and false.

		  // In browsers that support Object.defineProperty, use the following:
		  // Object.defineProperty(A, k, {
		  //   value: mappedValue,
		  //   writable: true,
		  //   enumerable: true,
		  //   configurable: true
		  // });

		  // For best browser support, use the following:
		  A[k] = mappedValue;
		}
		// d. Increase k by 1.
		k++;
	  }

	  // 9. return A
	  return A;
	}

	reducefunction(callback /*, initialValue*/) {
	  'use strict';
	  if (this == null) {
		throw new TypeError('Array.prototype.reduce called on null or undefined');
	  }
	  if (typeof callback !== 'function') {
		throw new TypeError(callback + ' is not a function');
	  }
	  var t = Object(this), len = t.length >>> 0, k = 0, value;
	  if (arguments.length == 2) {
		value = arguments[1];
	  } else {
		while (k < len && !(k in t)) {
		  k++;
		}
		if (k >= len) {
		  throw new TypeError('Reduce of empty array with no initial value');
		}
		value = t[k++];
	  }
	  for (; k < len; k++) {
		if (k in t) {
		  value = callback(value, t[k], k, t);
		}
	  }
	  return value;
	}

	reduceRightfunction(callback /*, initialValue*/) {
	  'use strict';
	  if (null === this || 'undefined' === typeof this) {
		throw new TypeError('Array.prototype.reduce called on null or undefined' );
	  }
	  if ('function' !== typeof callback) {
		throw new TypeError(callback + ' is not a function');
	  }
	  var t = Object(this), len = t.length >>> 0, k = len - 1, value;
	  if (arguments.length >= 2) {
		value = arguments[1];
	  } else {
		while (k >= 0 && !(k in t)) {
		  k--;
		}
		if (k < 0) {
		  throw new TypeError('Reduce of empty array with no initial value');
		}
		value = t[k--];
	  }
	  for (; k >= 0; k--) {
		if (k in t) {
		  value = callback(value, t[k], k, t);
		}
	  }
	  return value;
	}

	includes(searchElement /*, fromIndex*/ ) {
		'use strict';
		var O = Object(this);
		var len = parseInt(O.length) || 0;
		if (len === 0) {
			return false;
		}
		var n = parseInt(arguments[1]) || 0;
		var k;
		if (n >= 0) {
			k = n;
		} else {
			k = len + n;
			if (k < 0) {
				k = 0;
			}
		}
		var currentElement;
		while (k < len) {
			currentElement = O[k];
			if (searchElement === currentElement ||
				(searchElement !== searchElement && currentElement !== currentElement)
			) {
				return true;
			}
			k++;
		}
		return false;
	}

	some(fun/*, thisArg*/) {
	  'use strict';

	  if (this == null) {
		throw new TypeError('Array.prototype.some called on null or undefined');
	  }

	  if (typeof fun !== 'function') {
		throw new TypeError();
	  }

	  var t = Object(this);
	  var len = t.length >>> 0;

	  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	  for (var i = 0; i < len; i++) {
		if (i in t && fun.call(thisArg, t[i], i, t)) {
		  return true;
		}
	  }

	  return false;
	}

	indexOf(searchElement, fromIndex) {

	  var k;

	  // 1. Let O be the result of calling ToObject passing
	  //    the this value as the argument.
	  if (this == null) {
		throw new TypeError('"this" is null or not defined');
	  }

	  var O = Object(this);

	  // 2. Let lenValue be the result of calling the Get
	  //    internal method of O with the argument "length".
	  // 3. Let len be ToUint32(lenValue).
	  var len = O.length >>> 0;

	  // 4. If len is 0, return -1.
	  if (len === 0) {
		return -1;
	  }

	  // 5. If argument fromIndex was passed let n be
	  //    ToInteger(fromIndex); else let n be 0.
	  var n = +fromIndex || 0;

	  if (Math.abs(n) === Infinity) {
		n = 0;
	  }

	  // 6. If n >= len, return -1.
	  if (n >= len) {
		return -1;
	  }

	  // 7. If n >= 0, then Let k be n.
	  // 8. Else, n<0, Let k be len - abs(n).
	  //    If k is less than 0, then let k be 0.
	  k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

	  // 9. Repeat, while k < len
	  while (k < len) {
		// a. Let Pk be ToString(k).
		//   This is implicit for LHS operands of the in operator
		// b. Let kPresent be the result of calling the
		//    HasProperty internal method of O with argument Pk.
		//   This step can be combined with c
		// c. If kPresent is true, then
		//    i.  Let elementK be the result of calling the Get
		//        internal method of O with the argument ToString(k).
		//   ii.  Let same be the result of applying the
		//        Strict Equality Comparison Algorithm to
		//        searchElement and elementK.
		//  iii.  If same is true, return k.
		if (k in O && O[k] === searchElement) {
		  return k;
		}
		k++;
	  }
	  return -1;
	}

	lastIndexOf(searchElement /*, fromIndex*/) {
	  'use strict';

	  if (this === void 0 || this === null) {
		throw new TypeError();
	  }

	  var n, k,
		t = Object(this),
		len = t.length >>> 0;
	  if (len === 0) {
		return -1;
	  }

	  n = len - 1;
	  if (arguments.length > 1) {
		n = Number(arguments[1]);
		if (n != n) {
		  n = 0;
		}
		else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
		  n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
	  }

	  for (k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) {
		if (k in t && t[k] === searchElement) {
		  return k;
		}
	  }
	  return -1;
	}

	copyWithin(target, start/*, end*/) {
	  // Steps 1-2.
	  if (this == null) {
		throw new TypeError('this is null or not defined');
	  }

	  var O = Object(this);

	  // Steps 3-5.
	  var len = O.length >>> 0;

	  // Steps 6-8.
	  var relativeTarget = target >> 0;

	  var to = relativeTarget < 0 ?
		Math.max(len + relativeTarget, 0) :
		Math.min(relativeTarget, len);

	  // Steps 9-11.
	  var relativeStart = start >> 0;

	  var from = relativeStart < 0 ?
		Math.max(len + relativeStart, 0) :
		Math.min(relativeStart, len);

	  // Steps 12-14.
	  var end = arguments[2];
	  var relativeEnd = end === undefined ? len : end >> 0;

	  var final = relativeEnd < 0 ?
		Math.max(len + relativeEnd, 0) :
		Math.min(relativeEnd, len);

	  // Step 15.
	  var count = Math.min(final - from, len - to);

	  // Steps 16-17.
	  var direction = 1;

	  if (from < to && to < (from + count)) {
		direction = -1;
		from += count - 1;
		to += count - 1;
	  }

	  // Step 18.
	  while (count > 0) {
		if (from in O) {
		  O[to] = O[from];
		} else {
		  delete O[to];
		}

		from += direction;
		to += direction;
		count--;
	  }

	  // Step 19.
	  return O;
	}

	every(callbackfn, thisArg) {
	  'use strict';
	  var T, k;

	  if (this == null) {
		throw new TypeError('this is null or not defined');
	  }

	  // 1. Let O be the result of calling ToObject passing the this
	  //    value as the argument.
	  var O = Object(this);

	  // 2. Let lenValue be the result of calling the Get internal method
	  //    of O with the argument "length".
	  // 3. Let len be ToUint32(lenValue).
	  var len = O.length >>> 0;

	  // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
	  if (typeof callbackfn !== 'function') {
		throw new TypeError();
	  }

	  // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	  if (arguments.length > 1) {
		T = thisArg;
	  }

	  // 6. Let k be 0.
	  k = 0;

	  // 7. Repeat, while k < len
	  while (k < len) {

		var kValue;

		// a. Let Pk be ToString(k).
		//   This is implicit for LHS operands of the in operator
		// b. Let kPresent be the result of calling the HasProperty internal
		//    method of O with argument Pk.
		//   This step can be combined with c
		// c. If kPresent is true, then
		if (k in O) {

		  // i. Let kValue be the result of calling the Get internal method
		  //    of O with argument Pk.
		  kValue = O[k];

		  // ii. Let testResult be the result of calling the Call internal method
		  //     of callbackfn with T as the this value and argument list
		  //     containing kValue, k, and O.
		  var testResult = callbackfn.call(T, kValue, k, O);

		  // iii. If ToBoolean(testResult) is false, return false.
		  if (!testResult) {
			return false;
		  }
		}
		k++;
	  }
	  return true;
	}

	fillfunction(value) {

	  // Steps 1-2.
	  if (this == null) {
		throw new TypeError('this is null or not defined');
	  }

	  var O = Object(this);

	  // Steps 3-5.
	  var len = O.length >>> 0;

	  // Steps 6-7.
	  var start = arguments[1];
	  var relativeStart = start >> 0;

	  // Step 8.
	  var k = relativeStart < 0 ?
		Math.max(len + relativeStart, 0) :
		Math.min(relativeStart, len);

	  // Steps 9-10.
	  var end = arguments[2];
	  var relativeEnd = end === undefined ?
		len : end >> 0;

	  // Step 11.
	  var final = relativeEnd < 0 ?
		Math.max(len + relativeEnd, 0) :
		Math.min(relativeEnd, len);

	  // Step 12.
	  while (k < final) {
		O[k] = value;
		k++;
	  }

	  // Step 13.
	  return O;
	}

	filter(fun/*, thisArg*/) {
	  'use strict';

	  if (this === void 0 || this === null) {
		throw new TypeError();
	  }

	  var t = Object(this);
	  var len = t.length >>> 0;
	  if (typeof fun !== 'function') {
		throw new TypeError();
	  }

	  var res = [];
	  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	  for (var i = 0; i < len; i++) {
		if (i in t) {
		  var val = t[i];

		  // NOTE: Technically this should Object.defineProperty at
		  //       the next index, as push can be affected by
		  //       properties on Object.prototype and Array.prototype.
		  //       But that method's new, and collisions should be
		  //       rare, so use the more-compatible alternative.
		  if (fun.call(thisArg, val, i, t)) {
			res.push(val);
		  }
		}
	  }

	  return res;
	}

	find(predicate) {
	  if (this === null) {
		throw new TypeError('Array.prototype.find called on null or undefined');
	  }
	  if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	  }
	  var list = Object(this);
	  var length = list.length >>> 0;
	  var thisArg = arguments[1];
	  var value;

	  for (var i = 0; i < length; i++) {
		value = list[i];
		if (predicate.call(thisArg, value, i, list)) {
		  return value;
		}
	  }
	  return undefined;
	}

	findIndex(predicate) {
	  if (this === null) {
		throw new TypeError('Array.prototype.findIndex called on null or undefined');
	  }
	  if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	  }
	  var list = Object(this);
	  var length = list.length >>> 0;
	  var thisArg = arguments[1];
	  var value;

	  for (var i = 0; i < length; i++) {
		value = list[i];
		if (predicate.call(thisArg, value, i, list)) {
		  return i;
		}
	  }
	  return -1;
	}

	forEach(callback, thisArg) {

	  var T, k;

	  if (this == null) {
		throw new TypeError(' this is null or not defined');
	  }

	  // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	  var O = Object(this);

	  // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
	  // 3. Let len be ToUint32(lenValue).
	  var len = O.length >>> 0;

	  // 4. If IsCallable(callback) is false, throw a TypeError exception.
	  // See: http://es5.github.com/#x9.11
	  if (typeof callback !== 'function') {
		throw new TypeError(callback + ' is not a function');
	  }

	  // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	  if (arguments.length > 1) {
		T = thisArg;
	  }

	  // 6. Let k be 0
	  k = 0;

	  // 7. Repeat, while k < len
	  while (k < len) {

		var kValue;

		// a. Let Pk be ToString(k).
		//   This is implicit for LHS operands of the in operator
		// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
		//   This step can be combined with c
		// c. If kPresent is true, then
		if (k in O) {

		  // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
		  kValue = O[k];

		  // ii. Call the Call internal method of callback with T as the this value and
		  // argument list containing kValue, k, and O.
		  callback.call(T, kValue, k, O);
		}
		// d. Increase k by 1.
		k++;
	  }
	  // 8. return undefined
	}
}
