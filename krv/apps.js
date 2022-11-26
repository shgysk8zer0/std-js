import { getJSON } from '../http.js';

export const apps = new URL('https://apps.kernvalley.us/apps.json');

export const getApps = async ({ signal } = {}) => getJSON(apps, { signal });
