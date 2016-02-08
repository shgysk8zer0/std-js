import * as classes from './polyfills/allClasses.es6';
export {default as dePrefix} from './deprefixer.es6';
export {default as promise} from './polyfills/promises.es6';
export {default as fetch} from './polyfills/fetch.es6';

export function checkFunction(functionName, functionObj) {
	if ((functionObj instanceof Function) && ! (functionName in window)) {
		window[functionName] = functionObj;
	}
}

export function checkClass(className, classObj) {
	if (! (classObj instanceof Function)) {
		throw new Error(`${className} is not a class.`);
		return;
	} else if (! (className in window)) {
		window[className] = classObj;
	} else {
		for (let method of Object.getOwnPropertyNames(classObj.prototype)) {
			if (classObj.prototype[method] instanceof Function) {
				if (! (method in window[className]['prototype'])) {
					window[className]['prototype'][method] = classObj.prototype[method];
				}
			}
		}
		for (let method of Object.getOwnPropertyNames(classObj)) {
			if (classObj[method] instanceof Function) {
				if (! (method in window[className])) {
					window[className][method] = classObj[method];
				}
			}
		}
	}
}
// export {MutationObserver} from './polyfills/MutationObserver.es6';
export {classes};
