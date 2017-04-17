export default class {
	preventDefault() {
		this.returnValue = false;
	}
	stopPropagation() {
		this.cancelBubble = true;
	}
}
