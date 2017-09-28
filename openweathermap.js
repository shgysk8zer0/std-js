/**
 * Class for getting weather data using OpenWeatherMap
 * @see http://openweathermap.org/current
 */
const ENDPOINT = 'http://api.openweathermap.org';

export default class OpenWeatherMap {
	/**
	 * Creates new instance and sets class properties
	 * @param  {string} appid              Your unique API key [http://home.openweathermap.org/users/sign_up]
	 * @param  {String} [units='imperial'] imperial or metric
	 * @param  {String} [lang='en']        language code
	 * @param  {float} [version=2.5]       API version
	 */
	constructor(appid, {units = 'imperial', lang = 'en', version = 2.5} = {}) {
		this.url = new URL(`/data/${version}/weather`, ENDPOINT);
		this.headers = new Headers();
		this.url.searchParams.set('units', units);
		this.url.searchParams.set('lang', lang);
		this.url.searchParams.set('appid', appid);
		this.units = {};
		this.headers.set('Accept', 'application/json');

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
	 * @return {object}
	 */
	async getFromCoords() {
		const location = await OpenWeatherMap.getLocation();
		this.url.searchParams.set('lat', location.coords.latitude);
		this.url.searchParams.set('lon', location.coords.longitude);

		const resp = await fetch(this.url, {
			headers: this.headers,
			method: 'GET',
			mode: 'cors'
		});

		this.url.searchParams.delete('lat');
		this.url.searchParams.delete('lon');

		if (resp.ok) {
			return await resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}

	/**
	 * Get weather using city name
	 * @param  {string}   city             City name to get weather for
	 * @return {void}
	 */
	async getFromCity(city) {
		this.url.searchParams.set('q', city);

		const resp = await fetch(this.url, {
			headers: this.headers,
			method: 'GET',
			mode: 'cors',
		});

		this.url.searchParams.delete('q');

		if (resp.ok) {
			return await resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}

	/**
	 * Get weather from zip code
	 * @param  {integer}  zip      Zip code
	 * @return {object}
	 */
	async getFromZip(zip) {
		this.url.searchParams.set('zip', `${zip},us`);

		const resp = await fetch(this.url, {
			headers: this.headers,
			method: 'GET',
			mode: 'cors',
		});

		this.url.searchParams.delete('zip');

		if (resp.ok) {
			return await resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}

	/**
	 * Get weather from city ID
	 * @param  {integer} id       City ID number
	 * @return {void}
	 */
	async getFromID(id) {
		this.url.searchParams.set('id', id);

		const resp = await fetch(this.url, {
			headers: this.headers,
			method: 'GET',
			mode: 'cors',
		});

		this.url.searchParams.delete('id');
		if (resp.ok) {
			return await resp.json();
		} else {
			throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
		}
	}

	/**
	 * Get icon for current weather
	 * @param  {Object} weather An element from the weather array from response
	 * @return {Image}          <img src="..." alt="..." width="50" height="50">
	 */
	static getIcon(weather, {width = 50, height = 50} = {}) {
		let img = new Image(width, height);
		img.src = new URL(`/img/w/${weather.icon}.png`, ENDPOINT);
		img.alt = weather.description;
		return img;
	}

	/**
	 * Converts degrees into direction
	 * @param  {Object} wind {deg: ..., }
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
	 * Static method to get location using GeoLocation API
	 * @param  {object} options    GeoLocation options object
	 * @return {object}            GeoLocation coords
	 */
	static async getLocation(options = {}) {
		return await new Promise(function(success, fail) {
			if (!('geolocation' in navigator)) {
				fail('Your browser does not support GeoLocation');
			}
			navigator.geolocation.getCurrentPosition(success, fail, options);
		});
	}
}
