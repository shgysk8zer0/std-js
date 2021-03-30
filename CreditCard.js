/**
 * @SEE https://www.w3.org/Payments/card-network-ids
 * @SEE https://www.w3resource.com/javascript/form/credit-card-validation.php
 * @SEE https://www.paypalobjects.com/en_GB/vhelp/paypalmanager_help/credit_card_numbers.htm
 **/

const protectedData = new WeakMap();

export const CardTypes = [{
	name: 'American Express',
	network: 'amex',
	pattern: /^(?:3[47][0-9]{13})$/,
}, {
	name: 'Cartes Bancaires',
	network: 'cartebancaire,'
}, {
	name: 'Diners Club International',
	network: 'diners',
	patterm: /^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$/,
},{
	name: 'Discover',
	network: 'discover',
	pattern: /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/,
}, {
	name: 'Japan Credit Bureau',
	network: 'jcb',
	pattern: /^(?:(?:2131|1800|35\d{3})\d{11})$/,
}, {
	name: 'Mastercard',
	network: 'mastercard',
	prefix: /^5[1-5]/,
	pattern: /^(?:5[1-5][0-9]{14})$/,
}, {
	name: 'Mir',
	network: 'mir',
}, {
	name: 'PayPak',
	network: 'paypak',
}, {
	name: 'Troy',
	network: 'troy',
}, {
	name: 'UnionPay',
	network: 'unionpay',
}, {
	name: 'Visa',
	network: 'visa',
	prefix: /^4/,
	pattern: /^(?:4[0-9]{12}(?:[0-9]{3})?)$/,
}];

export const CardNetworks = CardTypes.map(c => c.network);

export class CreditCard {
	constructor({ number, type, expires: { year, month }}) {
		if (! typeof number === 'string' || ! /^\d{13,16}$/.test(number.replace(/\D/g, ''))) {
			throw new Error('Invalid credit card number');
		} else if (! Number.isInteger(year) && Number.isInteger(month)) {
			throw new TypeError('Invalid expiry month or year');
		} else {
			protectedData.set(this, { number: number.replace(/\D/g, ''), type, expires: { year, month }});
		}
	}

	get expired() {
		const { expires: { year, month }} = protectedData.get(this);
		return CreditCard.isExpired({ year, month });
	}

	get type() {
		const { type, number } = protectedData.get(this);

		if (typeof type === 'string') {
			return type;
		} else {
			const card = CardTypes.find(({ pattern: p }) => p instanceof RegExp && p.test(number));

			if (typeof card === 'undefined') {
				return 'unknown';
			} else {
				return card.network;
			}
		}
	}

	get valid() {
		const { expired, number } = protectedData.get(this);
		return ! expired && CreditCard.luhnCheck(number);
	}

	static isExpired({ year, month }) {
		if (! Number.isInteger(year) && Number.isInteger(month)) {
			throw new TypeError('Year and month must be integers');
		} else {
			const now = new Date();
			const currentYear = now.getFullYear();

			if (year < currentYear) {
				return true;
			} else if (year > currentYear) {
				return false;
			} else {
				return ! month > (now.getMonth() + 1);
			}
		}
	}

	static isSupportedType(type) {
		return typeof type === 'string' && CreditCard.supportedTypes.includes(type);
	}

	static luhnCheck(val) {
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

	static get supportedTypes() {
		return CardNetworks;
	}
}
