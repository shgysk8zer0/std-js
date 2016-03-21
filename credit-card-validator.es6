/**
 * Validates a 16 digit credit card number
 *
 * @param  string ccnum   Any 16 digit number as a string
 * @return boolean        Whether or not it Validates
 */
export default function(ccnum) {
	if (ccnum.length !== 16 || ! /^\d+$/.test(ccnum)) {
		return false;
	}
	let sums = ccnum.split('').map(num => parseInt(num)).reduce((nums, num, i) => {
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
