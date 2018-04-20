/**
 * Validates a 16 digit credit card number
 *
 * @param  string ccnum   Any 13 | 16 digit number as a string
 * @return boolean        Whether or not it Validates
 */
export function isValidCC(ccnum) {
	ccnum = ccnum.replace('-', '').replace(' ', '');
	if ((ccnum.length !== 16 && ccnum.length !== 13) || ! /^\d+$/.test(ccnum)) {
		return false;
	}
	const sums = ccnum.split('').map(num => parseInt(num)).reduce((nums, num, i) => {
		if (i % 2  === 0) {
			nums[0] += num;
			if (num >= 5) {
				nums[2]++;
			}
		} else {
			nums[1] += num;
		}
		return nums;
	}, [0, 0, 0]);
	return (sums[0] * 2 + sums[1] + sums[2]) % 10 === 0;
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
