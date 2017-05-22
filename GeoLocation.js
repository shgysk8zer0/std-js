export default class GPS {
	constructor({
		enableHighAccuracy = false,
		timeout            = Infinity,
		maximumAge         = Infinity
	} = {}) {
		this.id = null;
		this.options = {enableHighAccuracy, timeout, maximumAge};
	}

	watchPosition(success, error = console.error) {
		return this.id = navigator.geolocation.watchPosition(success, error, this.options);
	}

	clearWatch() {
		navigator.geolocation.clearWatch(this.id);
	}

	async getCurrentPosition() {
		let promise = new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, this.options);
		});
		let loc = await promise;
		return loc;
	}

	static getURI(loc) {
		return `geo:${loc.coords.latitude},${loc.coords.longitude},${loc.coords.altitude};u=${loc.coords.accuracy}`;
	}
}
