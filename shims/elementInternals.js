/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @see https://caniuse.com/mdn-api_formdataevent
 * @see https://caniuse.com/mdn-api_elementinternals
 * @todo: Figure out how to cleanup MutationObserver for removed inputs
 * @todo: Can I add a MutationObserver to automatically set/unset forms,
 * even in `ShadowRoot`s?
 *
 * This polyfill needs a bit of extra work from the custom element to work.
 * Check if `internals._polyfilled` to see if extra steps are necessary:
 * - Call `internals._associateForm(form, this)` in `connectedCallback()`
 * - Call again with `(null, this)` in `disconnectedCallback()` to disassociate
 *
 * Additionally, if `internals.states._polyfilled`
 * - Use `._state--*` in addition to `:--*` to query element internals states
 * - This includes `:disabled` -> `._state--disabled` & `:invalid` -> `._state--invalid`
 */
import { aria } from './aom.js';

const symbols = {
	key: Symbol('key'),
	internals: Symbol('element-internals'),
	form: Symbol('form'),
	fieldset: Symbol('fieldset'),
	element: Symbol('element'),
	validity: Symbol('validity'),
	validationMessage: Symbol('validation-message'),
	value: Symbol('value'),
	state: Symbol('state'),
	formController: Symbol('form-controller'),
	anchor: Symbol('anchor'),
	customInputs: Symbol('custom-inputs'),
};

function shimAria(prototype) {
	const enumerable = true;
	const configurable = true;
	const props = Object.fromEntries(Object.keys(aria).map(prop => [prop, {
		get: function() {
			return this[symbols.element][prop];
		},
		set: function(val) {
			this[symbols.element][prop] = val;
		},
		enumerable, configurable,
	}]));

	Object.defineProperties(prototype, props);
}

if (! (HTMLElement.prototype.attachInternals instanceof Function) && 'FormDataEvent' in globalThis) {
	const validationObject = {
		valueMissing: false, typeMismatch: false, patternMismatch: false, tooLong: false,
		tooShort: false, rangeUnderflow: false, rangeOverflow: false, stepMismatch: false,
		badInput: false, customError: false, valid: true,
	};

	const hasDisabledFieldset = component => component.hasOwnProperty(symbols.fieldset)
		&& component[symbols.fieldset] instanceof HTMLFieldSetElement
		&& component[symbols.fieldset].disabled;

	const isFormAssociated = (component) => {
		return component instanceof HTMLElement
			&& component.tagName.includes('-')
			&& customElements.get(component.tagName.toLowerCase()).formAssociated;
	};

	const getFormDataHandler = (component, internals) => {
		return function(event) {
			if (! event.target.reportValidity()) {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
			} else if (internals.willValidate && event.formData instanceof FormData) {
				const value = internals[symbols.value];

				if (value instanceof FormData) {
					value.entries().forEach(([k, v]) => event.formData.set(k, v));
				} else if (component.hasAttribute('name')) {
					event.formData.set(component.getAttribute('name'), internals[symbols.value]);
				}
			}
		};
	};

	const css = (el, rules) => {
		Object.entries(rules).forEach(([k, v]) => el.style.setProperty(k, v));
	};

	const findAssociatedForm = (component) => {
		if (component.hasAttribute('form')) {
			return document.forms[component.getAttribute('form')] || component.closest('form');
		} else {
			return component.closest('form');
		}
	};

	// To be used in/after `connectedCallback`
	const associateForm = (form, internals, component) => {
		if (! (form instanceof HTMLFormElement)) {
			if (internals[symbols.formController] instanceof AbortController) {
				internals[symbols.formController].abort();
			}

			internals[symbols.form] = null;
			internals[symbols.formController] = null;

			if (component.hasOwnProperty(symbols.fieldset)) {
				const fieldset = component[symbols.fieldset];

				if (fieldset.hasOwnProperty(symbols.customInputs)) {
					fieldset[symbols.customInputs].delete(component);

					if (fieldset[symbols.customInputs.size] === 0) {
						delete fieldset[symbols.customInputs];
					}
				}
				component[symbols.fieldset] = null;
			}
		} else if (! (component instanceof HTMLElement && component.tagName.includes('-'))) {
			throw new TypeError('Not a custom element');
		} else if (! (internals instanceof ElementInternals || internals instanceof globalThis.ElementInternals)) {
			throw new TypeError('Invalid ElementInternals');
		} else if (! isFormAssociated(component)) {
			throw new TypeError(`${component.tagName} is not form associated.`);
		} else if (! (component.formAssociatedCallback instanceof Function)) {
			throw new TypeError(`${component.tagName} is missing a formAssociatedCallback method.`);
		} else {
			const controller = new AbortController();
			const fieldset = component.closest('fieldset');

			if (fieldset instanceof Element) {
				component[symbols.fieldset] = fieldset;
				if (! fieldset.hasOwnProperty(symbols.customInputs)) {
					fieldset[symbols.customInputs] = new Set();
				}

				fieldset[symbols.customInputs].add(component);
				observer.observe(fieldset, observerOpts);
			}

			internals[symbols.form] = form;
			internals[symbols.formController] = controller;

			const { checkValidity, reportValidity } = form;

			form.reportValidity = function() {
				if (! reportValidity.call(this)) {
					return false;
				} else {
					return internals.reportValidity();
				}
			};

			form.checkValidity = function() {
				if (! checkValidity.call(this)) {
					return false;
				} else {
					return internals.checkValidity();
				}
			};

			controller.signal.addEventListener('abort', () => {
				form.reportValidity = reportValidity;
				form.checkValidity = checkValidity;
			}, { once: true });

			form.addEventListener('formdata', getFormDataHandler(component, internals), { signal: controller.signal });
			form.addEventListener('submit', event => {
				if (! event.target.reportValidity()) {
					event.preventDefault();
					event.stopImmediatePropagation();
					event.stopPropagation();
				}
			}, { signal: controller.signal });

			if (component.formResetCallback instanceof Function) {
				form.addEventListener('reset', () => component.formResetCallback(), { signal: controller.signal });
			}
		}
	};

	const observer = new MutationObserver((mutations) => {
		mutations.forEach(({ target, type, attributeName }) => {
			if (type === 'attributes' && attributeName === 'disabled') {
				const disabled = target.hasAttribute('disabled');

				/**
				 * Check that target is a valid candiate and not a child of a
				 * `<fieldset disabled>`, unless they are both being toggled
				 * together to the same value.
				 */
				if (
					isFormAssociated(target)
					&& target.hasOwnProperty(symbols.internals)
					&& target[symbols.internals].states.has('--disabled') !== disabled
					&& (
						mutations.length === 1
							// target is not a descendant of a `<fieldset disabled>`
							? ! hasDisabledFieldset(target)
							: (
								// target & `<fieldset>` are being enabled/disabled together
								target.hasAttribute('disabled') === hasDisabledFieldset(target)
								&& mutations.some((m) =>
									m.target.isSameNode(target[symbols.fieldset])
								)
							)
					)
				) {
					const internals = target[symbols.internals];

					if (disabled) {
						internals.states.add('--disabled');
					} else {
						internals.states.delete('--disabled');
					}

					if (target.formDisabledCallback instanceof Function) {
						target.formDisabledCallback(disabled);
					}
				} else if (
					target.tagName === 'FIELDSET'
					&& target.hasOwnProperty(symbols.customInputs)
					&& (
						mutations.length === 1
						|| ! mutations.some(m => target[symbols.customInputs].has(m.target))
					)
				) {
					target[symbols.customInputs].forEach(el => {
						if (el.isConnected && el.hasOwnProperty(symbols.internals)) {
							// Do not toggle disabled on elements that are `disabled`
							if (! el.hasAttribute('disabled')) {
								if (disabled) {
									el[symbols.internals].states.add('--disabled');
								} else {
									el[symbols.internals].states.delete('--disabled');
								}

								if (el.formDisabledCallback instanceof Function) {
									el.formDisabledCallback(disabled);
								}
							}
						} else {
							target[symbols.customInputs].delete(el);
						}
					});
				}
			}
		});
	});

	const observerOpts = { attributes :true, attributeFilter: ['disabled'] };

	class ElementInternals {
		constructor(element, key) {
			if (key !== symbols.key) {
				throw new TypeError('Illegal constructor');
			} else if (! (element instanceof HTMLElement)) {
				throw new TypeError('Must be called on an HTMLElement');
			} else if (! element.tagName.includes('-')) {
				throw new DOMException('Cannot attach internals to a built-in element.');
			} else {
				// internals.add(this);
				const configurable = true;
				const enumerable = false;
				const writable = true;

				Object.defineProperties(this, {
					[symbols.element]: { value: element, configurable, enumerable, writable },
					[symbols.form]: { value: null, configurable, enumerable, writable },
					[symbols.fieldset]: { value: null, configurable, enumerable, writable },
					[symbols.anchor]: { value: null, configurable, enumerable, writable },
					[symbols.validity]: { value: validationObject, configurable, enumerable, writable },
					[symbols.validationMessage]: { value: '', configurable, enumerable, writable },
					[symbols.value]: { value: null, configurable, enumerable, writable },
					[symbols.state]: { value: null, configurable, enumerable, writable },
					[symbols.formController]: { value: null, configurable, enumerable, writable },
				});

				if (isFormAssociated(element)) {
					observer.observe(element, observerOpts);
				}

				Object.defineProperty(element, symbols.internals, {
					value: this,
					enumerable: false,
					configurable: false,
					writable: false,
				});

				setTimeout(() => this.states.add('--element-internals-polyfilled'), 10);
			}
		}

		get form() {
			return this[symbols.form];
		}

		get labels() {
			const form = this.form;

			if (form instanceof HTMLFormElement && this[symbols.element].id.length !== 0) {
				return form.querySelectorAll(`label[for="${this[symbols.element].id}"]`);
			} else {
				return document.createDocumentFragment().childNodes;
			}
		}

		get _polyfilled() {
			return true;
		}

		get shadowRoot() {
			const el = this[symbols.element];
			return el.shadowRoot;
		}

		get validity() {
			if (isFormAssociated(this[symbols.element])) {
				return this[symbols.validity];
			} else {
				return undefined;
			}
		}

		get validationMessage() {
			if (isFormAssociated(this[symbols.element])) {
				return this[symbols.validationMessage] || '';
			} else {
				return undefined;
			}
		}

		get willValidate() {
			const element = this[symbols.element];

			return isFormAssociated(element)
				&& ! hasDisabledFieldset(element)
				&& ! ['disabled', 'readonly'].some(attr => element.hasAttribute(attr));
		}

		checkValidity() {
			if (! this.willValidate) {
				return true;
			} else if (! this.validity.valid) {
				this[symbols.element].dispatchEvent(new Event('invalid'));
				return false;
			} else {
				const next = this[symbols.element].nextElementSibling;

				if (next instanceof HTMLElement && next.classList.contains('_element-internals-popup')) {
					next.remove();
				}
				return true;
			}
		}

		reportValidity() {
			if (! this.checkValidity()) {
				const message = this.validationMessage;

				if (typeof message === 'string' && message.length !== 0) {
					// this[symbols.element].scrollIntoView({ block: 'start' });
					const { bottom, left } = this[symbols.element].getBoundingClientRect();
					const el = document.createElement('div');
					el.textContent = message;

					css(el, {
						'position': 'fixed',
						'background-color': '#2b2a33',
						'color': '#fafafa',
						'top': `${bottom + 2}px`,
						'left': `${left}px`,
						'z-index': 2147483647,
						'color-scheme': 'light-dark',
						'font-family': 'system-ui, serif',
						'font-size': '18px',
						'display': 'inline-block',
						'padding': '0.6em 0.8em',
						'border': '1px solid #1a1a1a',
						'border-radius': '6px',
					});

					el.classList.add('_element-internals-popup');

					this[symbols.element].focus();

					const next = this[symbols.element].nextElementSibling;

					if (next instanceof Element && next.classList.contains('_element-internals-popup')) {
						next.remove();
					}

					this[symbols.element].insertAdjacentElement('afterend', el);

					if (this[symbols.anchor] instanceof Element) {
						this[symbols.anchor].focus();
					}

					setTimeout(() => {
						if (el.isConnected) {
							el.remove();
						}
					}, 3000);
				}

				return false;
			} else {
				return true;
			}
		}

		setFormValue(value, state) {
			if (isFormAssociated(this[symbols.element])) {
				this[symbols.value] = value;
				this[symbols.state] = state;
			} else {
				throw new DOMException('Not form associated');
			}
		}

		setValidity({
			valueMissing = false,
			typeMismatch = false,
			patternMismatch = false,
			tooLong = false,
			tooShort = false,
			rangeUnderflow = false,
			rangeOverflow = false,
			stepMismatch = false,
			badInput = false,
			customError = false,
		}, message = '', anchor) {
			if (! isFormAssociated(this[symbols.element])) {
				throw new DOMException('Not form associated');
			} else if (
				(typeof message !== 'string' || message.length === 0)
				&& (
					valueMissing || typeMismatch || patternMismatch || tooLong || tooShort
					|| rangeUnderflow || rangeOverflow || stepMismatch || badInput || customError
				)
			) {
				throw new DOMException('Message required if any flags are true.');
			} else {
				const valid = [
					valueMissing, typeMismatch, patternMismatch, tooLong, tooShort,
					rangeUnderflow, rangeOverflow, stepMismatch, badInput, customError,
				].every(val => val === false);

				this[symbols.validity] = {
					valueMissing, typeMismatch, patternMismatch, tooLong, tooShort,
					rangeUnderflow, rangeOverflow, stepMismatch, badInput, customError,
					valid,
				};

				this[symbols.validationMessage] = message;
				this[symbols.anchor] = anchor;

				if (! valid) {
					this.states.add('--invalid');
					this.states.delete('--valid');
					this[symbols.element].dispatchEvent(new Event('invalid'));
				} else {
					this.states.delete('--invalid');
					this.states.add('--valid');
				}
			}
		}

		_associateForm(form, component) {
			associateForm(form, this, component);
		}

		_findAssociatedForm(component) {
			return findAssociatedForm(component);
		}
	}

	HTMLElement.prototype.attachInternals = function attachInternals() {
		if (this.hasOwnProperty(symbols.internals)) {
			throw new DOMException('Invalid operation');
		} else if (! this.tagName.includes('-')) {
			throw new DOMException('Cannot call attachInternals on built-in elements.');
		} else {
			return new ElementInternals(this, symbols.key);
		}
	};

	globalThis.ElementInternals = ElementInternals;
}

/**
 * Add `states` to `ElementInternals`
 * Uses `._state--foo` instead of `:--foo` though
 * Requires Iterator Helpers (`./iterator.js`)
 */
if ('ElementInternals' in globalThis && ! ('CustomStateSet' in globalThis)) {
	const prefix = '_state';
	const protectedData = new WeakMap();
	const getCName = state => {
		if (! state.toString().startsWith('--')) {
			throw new DOMException(`Failed to execute 'add' on 'CustomStateSet': The specified value '${state}' must start with '--'.`);
		} else {
			return `${prefix}${state}`;
		}
	};

	const {
		value, writable, configurable, enumerable,
	} = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'attachInternals');

	class CustomStateSet {
		constructor(el, key) {
			if (key !== symbols.key) {
				throw new TypeError('Illegal Constructor');
			} else if (! (el instanceof HTMLElement)) {
				throw new TypeError('el must be an HTMLElement');
			} else {
				protectedData.set(this, el);
				this.add('--custom-states-polyfilled');
			}
		}

		get _polyfilled() {
			return true;
		}

		get size() {
			return [...this.values()].length;
		}

		add(state) {
			protectedData.get(this).classList.add(getCName(state));
		}

		has(state) {
			return protectedData.get(this).classList.contains(getCName(state));
		}

		delete(state) {
			const c = getCName(state);

			if (protectedData.get(this).classList.contains(c)) {
				protectedData.get(this).classList.remove(c);
				return true;
			} else {
				return false;
			}
		}

		clear() {
			this.values().forEach(state => this.delete(state));
		}

		keys() {
			return this.values();
		}

		values() {
			const states = protectedData.get(this).classList.values()
				.filter(c => c.startsWith(`${prefix}--`));

			return states.map(c => c.substr(prefix.length));
		}

		entries() {
			return this.values().map(c => [c, c]);
		}

		forEach(callbackFn, thisArg) {
			this.values().forEach(state => callbackFn.call(thisArg || this, state, state, this));
		}

		[Symbol.toStringTag]() {
			return 'CustomStateSet';
		}

		[Symbol.iterator]() {
			return this.values();
		}
	}

	Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
		value: function() {
			const internals = value.call(this);

			Object.defineProperty(internals, symbols.element, {
				value: this,
				enumerable: false,
				writable: false,
				configurable: false,
			});

			Object.defineProperty(internals, 'states', {
				value: new CustomStateSet(this, symbols.key),
				configurable: true,
				enumberable: true,
			});

			if (Object.is(internals.shadowRoot, null) && ! Object.is(this.shadowRoot, null)) {
				Object.defineProperty(internals, 'shadowRoot', {
					value: this.shadowRoot,
					configurable: true,
					enumerable: true,
				});
			}

			return internals;
		},
		writable, configurable, enumerable,
	});

	globalThis.CustomStateSet = CustomStateSet;
	shimAria(ElementInternals.prototype);
}
