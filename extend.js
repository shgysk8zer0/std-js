export function extend(base = class EmptyClass {}, ...classes) {
	class CompositeClass extends base {}

	for (const parent of classes.reverse()) {
		const staticProps = Object.getOwnPropertyDescriptors(parent);
		const instanceProps = Object.getOwnPropertyDescriptors(parent.prototype);
		delete staticProps.prototype;
		delete instanceProps.constructor;

		Object.defineProperties(CompositeClass, staticProps);
		Object.defineProperties(CompositeClass.prototype, instanceProps);
	}

	return CompositeClass;
}
