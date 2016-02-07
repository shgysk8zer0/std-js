import {default as Listener} from './Element.es6';
import {default as Event} from './Event.es6';
export default class {
	addEventListener() {
		return Listener.prototype.addEventListener.call(arguments, this);
	}
	removeEventListener() {
		return Listener.prototype.removeEventListener.call(arguments, this);
	}
}
