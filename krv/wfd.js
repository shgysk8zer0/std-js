import { getJSON } from '../http.js';

export const events = new URL('https://whiskeyflatdays.com/events.json');

export const getEvents = async ({ signal } = {}) => getJSON(events, { signal });
