import Listener from './Element.js';
import Event from './Event.js';
export default class {
	addEventListener() {
		return Listener.prototype.addEventListener.call(arguments, this);
	}
	removeEventListener() {
		return Listener.prototype.removeEventListener.call(arguments, this);
	}
}
