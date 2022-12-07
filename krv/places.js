import { getJSON } from '../http.js';

const MAPS = 'https://maps.kernvalley.us/';

export const activities = new URL('/places/activities.json', MAPS);

export const bars = new URL('/places/bars.json', MAPS);

export const businesses = new URL('/places/businesses.json', MAPS);

export const cafes = new URL('/places/cafes.json', MAPS);

export const campgrounds = new URL('/places/campgrounds.json', MAPS);

export const churches = new URL('/places/churches.json', MAPS);

export const civic = new URL('/places/civic.json', MAPS);

export const financial = new URL('/places/financial.json', MAPS);

export const gas = new URL('/places/gas.json', MAPS);

export const landmarks = new URL('/places/landmarks.json', MAPS);

export const lodging = new URL('/places/lodging.json', MAPS);

export const restaurants = new URL('/places/restaurants.json', MAPS);

export const schools = new URL('/places/schools.json', MAPS);

export const stores = new URL('/places/stores.json', MAPS);

export const towns = new URL('/places/towns.json', MAPS);

export const getActivities = async ({ signal } = {}) => getJSON(activities, { signal });

export const getBars = async ({ signal } = {}) => getJSON(bars, { signal });

export const getBusinesses = async ({ signal } = {}) => getJSON(businesses, { signal });

export const getCafes = async ({ signal } = {}) => getJSON(cafes, { signal });

export const getCampgrounds = async ({ signal } = {}) => getJSON(campgrounds, { signal });

export const getChurches = async ({ signal } = {}) => getJSON(churches, { signal });

export const getCivic = async ({ signal } = {}) => getJSON(civic, { signal });

export const getFinancial = async ({ signal } = {}) => getJSON(financial, { signal });

export const getGas = async ({ signal } = {}) => getJSON(gas, { signal });

export const getLandmarks = async ({ signal } = {}) => getJSON(landmarks, { signal });

export const getLodging = async ({ signal } = {}) => getJSON(lodging, { signal });

export const getRestaurants = async ({ signal } = {}) => getJSON(restaurants, { signal });

export const getSchools = async ({ signal } = {}) => getJSON(schools, { signal });

export const getStores = async ({ signal } = {}) => getJSON(stores, { signal });

export const getTowns = async ({ signal } = {}) => getJSON(towns, { signal });
