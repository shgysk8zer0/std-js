/**
 * Class for getting weather data using OpenWeatherMap
 * @see http://openweathermap.org/current
 */
export default class OpenWeatherMap {
	/**
	 * Creates new instance and sets class properties
	 *
	 * @param  {string}                   imperial or metric
	 * @param  {string}                   language code
	 * @param  {float}                    API version number
	 */
	constructor(appid, units = 'imperial', lang = 'en', version = 2.5) {
		this.url = new URL(`http://api.openweathermap.org/data/${version}/weather`);
		this.url.searchParams.set('units', units);
		this.url.searchParams.set('lang', lang);
		this.url.searchParams.set('appid', appid);
		this.units = {};
		if (units === 'imperial') {
			this.units.temp = 'F';
			this.units.speed = 'MPH';
		} else if (units === 'metric') {
			this.units.temp = 'C';
			this.units.speed = 'M/S';
		}
	}

	/**
	 * Get weather using GeoLocation API
	 *
	 * @param  {callable} callback     Callback to call with response
	 *
	 * @return {void}
	 */
	getFromCoords(callback = data => console.log(data)) {
		OpenWeatherMap.getLocation().then(location => {
			this.url.searchParams.set('lat', location.coords.latitude);
			this.url.searchParams.set('lon', location.coords.longitude);
			fetch(this.url, {
				method: 'GET',
				mode: 'cors'
			}).then(resp => this.parseResponse(resp)).then(callback);
		}).catch(err => {
			console.error(err);
		});
	}

	/**
	 * Get weather using city name
	 *
	 * @param  {string}   city             City name to get weather for
	 * @param  {callable} callback         Callback to call with response
	 *
	 * @return {void}
	 */
	getFromCity(city, callback = data => console.log(data)) {
		this.url.searchParams.set('q', city);
		fetch(this.url, {
			method: 'GET',
			mode: 'cors'
		}).then(resp => this.parseResponse(resp)).then(callback).catch(err => {
			console.error(err);
		});
	}

	/**
	 * Get weather from zip code
	 *
	 * @param  {integer}  zip      Zip code
	 * @param  {[type]}   callback Callback to call with response
	 *
	 * @return {void}
	 */
	getFromZip(zip, callback = data => console.log(data)) {
		this.url.searchParams.set('zip', `${zip},us`);
		fetch(this.url, {
			method: 'GET',
			mode: 'cors'
		}).then(resp => this.parseResponse(resp)).then(callback).catch(err => {
			console.error(err);
		});
	}

	/**
	 * Get weather from city ID
	 *
	 * @param  {integer} id       City ID number
	 * @param  {[type]}  callback Callback to call with response
	 *
	 * @return {void}
	 */
	getFromID(id, callback = data => console.log(data)) {
		this.url.searchParams.set('id', id);
		fetch(this.url, {
			method: 'GET',
			mode: 'cors'
		}).then(resp => this.parseResponse(resp)).then(callback).catch(err => {
			console.error(err);
		});
	}

	/**
	 * Get icon for current weather
	 *
	 * @param  {Object} weather An element from the weather array from response
	 *
	 * @return {Image}          <img src="..." alt="..." width="50" height="50">
	 */
	static getIcon(weather) {
		let img = new Image(50, 50);
		img.src = `http://openweathermap.org/img/w/${weather.icon}.png`;
		img.alt = weather.description;
		return img;
	}

	/**
	 * Converts degrees into direction
	 *
	 * @param  {Object} wind {deg: ..., }
	 *
	 * @return {string}      "N", "NE", etc...
	 */
	static getDirectionFromDegree(wind) {
		if ((wind.deg >= 33.5) || (wind.deg <= 22.5)) {
			return 'N';
		} else if (wind.deg < 67.5) {
			return 'NE';
		} else if (wind.deg < 112.5) {
			return 'E';
		} else if (wind.deg < 157.5) {
			return 'SE';
		} else if (wind.deg < 202.5) {
			return 'S';
		} else if (wind.deg < 247.5) {
			return 'SW';
		} else if (wind.deg < 292.5) {
			return 'W';
		} else {
			return 'NW';
		}
	}

	/**
	 * Parse response from fetch request
	 *
	 * @param  {Response} resp Reponse object from fetch
	 *
	 * @return {void}
	 */
	parseResponse(resp) {
		if (resp.ok) {
			let type = resp.headers.get('Content-Type').toLowerCase();
			if (type.startsWith('application/json')) {
				return resp.json();
			} else {
				throw new Error(`Unsupported Content-Type: "${type}"`);
			}
		} else {
			throw new Error(`<${this.url.origin}> ${resp.status}: ${resp.statusText}`);
		}
	}

	/**
	 * Static method to get location using GeoLocation API
	 *
	 * @param  {object} options    GeoLocation options object
	 *
	 * @return {Promise}           A promise which resolves with GeoLocation coords
	 */
	static getLocation(options = {}) {
		return new Promise(function(success, fail) {
			if (!('geolocation' in navigator)) {
				fail('Your browser does not support GeoLocation');
			}
			navigator.geolocation.getCurrentPosition(success, fail, options);
		});
	}
}
