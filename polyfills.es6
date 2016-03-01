import * as classes from './polyfills/allClasses.es6';
import dePrefix from './deprefixer.es6';

// function checkFunction(functionName, functionObj) {
// 	if ((functionObj instanceof Function) && ! (functionName in window)) {
// 		window[functionName] = functionObj;
// 	}
// }

function checkClass(className, classObj) {
	if (! (classObj instanceof Function)) {
		throw new Error(`${className} is not a class.`);
	} else if (! (className in window)) {
		window[className] = classObj;
	} else {
		Object.getOwnPropertyNames(classObj.prototype).forEach(method => {
			if (classObj.prototype[method] instanceof Function) {
				if (! (method in window[className].prototype)) {
					window[className].prototype[method] = classObj.prototype[method];
				}
			}
		});
		Object.getOwnPropertyNames(classObj) (method => {
			if (classObj[method] instanceof Function) {
				if (! (method in window[className])) {
					window[className][method] = classObj[method];
				}
			}
		});
	}
}
export default function() {
	dePrefix();
	for (let shim in classes) {
		try {
			checkClass(shim, classes[shim]);
		} catch (e) {
			console.error(e);
			continue;
		}
	}
	// for (let shim in functions) {
	// 	try {
	// 		checkFunction(shim, functions[shim]);
	// 	} catch (e) {
	// 		console.error(e);
	// 		continue;
	// 	}
	// }
}
// export {MutationObserver} from './polyfills/MutationObserver.es6';
// export {classes, dePrefix};
