function luhnCheck(val) {
	let sum = 0;

	for (let i = 0; i < val.length; i++) {
		let intVal = parseInt(val.substr(i, 1));
		if (i % 2 === 0) {
			intVal *= 2;
			if (intVal > 9) {
				intVal = 1 + (intVal % 10);
			}
		}
		sum += intVal;
	}
	return (sum % 10) == 0;
}

/**
 * @SEE https://www.w3.org/Payments/card-network-ids
 * @SEE https://www.w3resource.com/javascript/form/credit-card-validation.php
 * @SEE https://www.paypalobjects.com/en_GB/vhelp/paypalmanager_help/credit_card_numbers.htm
 */
export const CCTypes = {
	'amex': {
		name: 'American Express',
		length: [15],
		prefixes: [
			{ value: '34' },
			{ value: '37' },
		]
	},
	'cartebancaire': {
		name: 'Cartes Bancaires',
	},
	'diners': {
		name: 'Diners Club International',
		length: [14],
	},
	'discover': {
		name: 'Discover',
		length: [15],
		prefixes: ['6011', '5'],
	},
	'jcb': {
		name: 'Japan Credit Bureau',
		length: [16],
	},
	'mastercard': {
		name: 'Mastercard',
		length: [16],
		prefixes: [
			{ range: { start: '51', end: '55' }},
		]
	},
	'mir': {
		name: 'Mir',
	},
	'paypak': {
		name: 'PayPak',
	},
	'troy': {
		name: 'Troy',
	},
	'unionpay': {
		name: 'UnionPay'
	},
	'visa': {
		name: 'Visa',
		length: [15, 16],
		prefixes: [
			{ value: '4' },
		]
	},
};

/**
 * Validates a 13-16 digit credit card number
 *
 * @param  string ccnum   Any 13 | 16 digit number as a string
 * @return boolean        Whether or not it Validates
 */
export function isValidCC(ccnum, type) {
	if (typeof ccnum !== 'string') {
		throw new TypeError('ccunum must be a string');
	} else if (ccnum.length < 13 || ccnum.length > 16) {
		throw new RangeError('ccnum must be between 13 and 16 digits');
	} else if (typeof type !== 'string') {
		return luhnCheck(ccnum);
	} else if ('type' in CCTypes) {
		//
	} else {
		return false;
	}
}

export function validateCCInput(event) {
	if (HTMLInputElement.prototype.hasOwnProperty('setCustomValidity')) {
		if (isValidCC(event.target.value)) {
			event.target.setCustomValidity('');
		} else {
			event.target.setCustomValidity('Please enter a valid credit card number');
		}
	} else {
		event.target.removeEventListener(event.type, validateCCInput);
	}
}

export function setCCValidator() {
	if (HTMLInputElement.prototype.hasOwnProperty('setCustomValidity')) {
		Array.from(document.querySelectorAll('[autocomplete="cc-number"]')).forEach(input => {
			input.addEventListener('change', validateCCInput);
		});
	}
}
