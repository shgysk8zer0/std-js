import { getJSON } from '../http.js';

export const events = new URL('https://events.kernvalley.us/events.json');

export const getEvents = async ({ signal } = {}) => getJSON(events, { signal });
