/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */
export default class Promise {
	constructor(executor) {
		try {
			let ret = executor.call();
			Promise.resolve(ret);
		} catch(err) {
			Promise.reject(err);
		}
	}
	then(onFulfilled, onRejected) {
		return new Promise(onFulfilled, onRejected);
	}
	catch(onRejected) {
		onRejected.call();
	}
	static reject(reason) {

	}
	static resolve(value) {

	}
	static all(...promises) {

	}
	static race(...promises) {

	}
}
