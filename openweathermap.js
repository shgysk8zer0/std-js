import { getJSON } from './http.js';
import { KeyValueStore } from './KeyValueStore.js';
/**
 * Class for getting weather data using OpenWeatherMap
 * @see https://openweathermap.org/current
 */
const ENDPOINT = 'http://api.openweathermap.org';

const GPS_PRECISION = 3;

const API_VERSION = 2.5;

const defaults = {
	lang: 'en',
	units: 'imperial',
};

export const units = {
	imperial: {
		temp: 'F',
		speed: 'MPH'
	},
	metric: {
		temp: 'C',
		speed: 'M/S',
	},
};

const ENDPOINTS = {
	forecast: `${ENDPOINT}/data/${API_VERSION}/forecast`, ENDPOINT,
	currentConditions: `${ENDPOINT}/data/${API_VERSION}/weather`,
};

export const config = {
	name: 'OpenWeatherMap',
	version: 1,
	stores: [{
		store: 'forecast',
		options: {
			keyPath: 'location',
			autoIncrement: false,
		},
		indicies: [{
			name: 'data',
			unique: false,
			multiEntry: false,
		}, {
			name: 'updated',
			unique: false,
			multiEntry: false,
		}],
		values: [],
	}, {
		store: 'current',
		options: {
			keyPath: 'location',
			autoIncrement: false,
		},
		indicies: [{
			name: 'data',
			unique: false,
			multiple: false,
		}, {
			name: 'updated',
			unique: false,
			multiple: false,
		}],
		values: [],
	},  {
		store: 'prefs',
		options: {
			keyPath: 'key',
			autoIncrement: false,
		},
		indicies: [{
			name: 'value',
			unique: false,
			multiple: false,
		}],
		values: [
			{ key: 'temp', value: 'F' },
			{ key: 'speed', value: 'MPH' },
			{ key: 'units', value: 'imperial' },
		]
	}]
};

const protectedData = new WeakMap();

function setData(obj, data) {
	if (protectedData.has(obj)) {
		const current = protectedData.get(obj);
		protectedData.setr(obj, { ...current, ...data });
	} else {
		protectedData.set(obj, data);
	}
}

function getData(obj, key) {
	if (! protectedData.has(obj)) {
		return null;
	} else if (typeof key === 'string') {
		const data = protectedData.get(obj);
		return data[key];
	} else {
		return protectedData.get(obj);
	}
}

async function fetchData(obj, type, location) {
	if (! (location instanceof WeatherLocation)) {
		throw new TypeError('location must be an instance of WeatherLocation a sub-class');
	}

	const { db, appId: appid } = getData(obj);
	const { temp, speed } = await getPrefs(db);

	if (typeof db === 'undefined') {
		return await getJSON(ENDPOINTS[type], {
			body: { appid, temp, speed, ...location },
			headers: new Headers({ Accept: 'application/json' }),
		});
	} else {
		//
	}
}

async function getPrefs(timeout = 500) {
	const store = new KeyValueStore('OpenWeatherMapPrefs');
	const prefs = await Promise.race([
		store.getAll().catch(err => console.error(err)),
		new Promise(r => setTimeout(() => r({}), timeout)),
	]);

	return {...units[defaults.units], ...prefs };
}

class WeatherLocation {
	// This is a parent class for Cities, Postal Codes, Lat/Lng
}

export class LatLng extends WeatherLocation {
	constructor({ latitude, longitude }) {
		super();
		if (! (typeof latitude === 'number' && typeof longitude === 'number')) {
			throw new TypeError('Latitude and longitude must be numerical');
		} else {
			this._latitude = latitude.toFixed(GPS_PRECISION);
			this.longitude = longitude.toFixed(GPS_PRECISION);
		}
	}

	toJSON() {
		return { lat: this._latitude, lng: this._longitude };
	}
}

export class PostalCode extends WeatherLocation {
	constructor(zip) {
		super();

		if (Number.isInteget(zip)) {
			this._zip = zip;
		} else if (typeof zip === 'string') {
			this._zip = parseInt(zip);
		} else {
			throw new TypeError('PostalCode must be an integer');
		}
	}

	toJSON() {
		return { zip: this._zip };
	}
}

export class City extends WeatherLocation {
	constructor(city, state, country) {
		super();
		const data = [city, state, country].filter(q => typeof q === 'string').join(',');
		if (data.length === 0) {
			throw new TypeError('City accepts city: string[, state: string[, country: string]]');
		} else {
			this._data = data;
		}
	}

	toJSON() {
		return { q: this._data };
	}
}

export class OpenWeatherMap extends EventTarget {
	/**
	 * Creates new instance and sets class properties
	 * @param  {string} appid              Your unique API key [http://home.openweathermap.org/users/sign_up]
	 */
	constructor(appId) {
		super();

		setData(this, { appId, db: null });

		if ('indexedDB' in window) {
			const req = indexedDB.open(config.name, config.version);

			req.addEventListener('success', ({ target: { result: db }}) => {
				setData(this, { db });
				this.dispatchEvent('connected');
			});

			req.addEventListener('error', ev => this.dispatchEvent(ev));

			req.addEventListener('upgradeneeded', ({ target: { result: db }}) => {
				const objectStores = db.objectStoreNames;

				config.stores.forEach(({ name, options, indicies, values }) => {
					if (! objectStores.contains(name) && Array.isArray(indicies)) {
						const store = db.createObjectStore(name, options);

						indicies.forEach(({ name, keyPath, unique = false, multiEntry = false, locale = 'auto' }) => {
							store.createIndex(name, name || keyPath, { unique, multiEntry, locale });
						});

						if (Array.isArray(values) && values.length !== 0) {
							values.forEach(value => store.put(value));
						}
					}
				});


				/*if (! stores.contains('forecast')) {
					const forecast = db.createObjectStore('forecast', { keyPath: 'location' });
					forecast.createIndex('data', 'data', { unique: false });
					forecast.createIndex('updated', 'updated', { unique: false });
				}

				if (! stores.contains('currentConditions')) {
					const current = db.createObjectStore('currentConditions', { keyPath: 'location' });
					current.createIndex('data', 'data', { unique: false });
					current.createIndex('updated', 'updated', { unique: false });
				}

				if (! stores.contains('preferences')) {
					const prefs = db.createObjectStore('preferences', { keyPath: 'key' });
					prefs.createIndex('value', 'value', { unique: false });
				}*/
			});
		}
	}

	get connected() {
		if (typeof getData(this, 'db') === 'undefined') {
			return Promise.race([
				new Promise(r => this.addEventListener('connected', () => r(this), { once: true })),
				new Promise((res, rej) => setTimeout(() => rej(new Error('Connection timeout'), 500))),
			]);
		} else {
			return Promise.resolve(this);
		}
	}

	async getConditionsFromPostalCode(postalCode) {
		return await fetchData(this, 'currentConditions', new PostalCode(postalCode));
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

	static get apiVersion() {
		return 2.5;
	}
}
