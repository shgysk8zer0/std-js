import { LockManager, actuallySupported, nativeSupport } from '../LockManager.js';
let polyfilled = false;

if (nativeSupport) {
	actuallySupported.then(supported => {
		if (! supported) {
			natigator.locks = LockManager;
		}
	});
} else {
	navigator.locks = LockManager;
	polyfilled = true;
}

export  { polyfilled };
