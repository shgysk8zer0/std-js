import { loadScript } from './loader.js';

/**
 * @SEE: https://firebase.google.com/docs/web/setup#libraries-cdn
 */
export const Plugins = {
	analytics: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js',
	auth: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-auth.js',
	firestore: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-firestore.js',
	database: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-database.js',
	functions: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-functions.js',
	messaging: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js',
	storage: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-storage.js',
	performance: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-performance.js',
	remoteConfig: 'https://www.gstatic.com/firebasejs/8.3.1/firebase-remote-config.js',
};

const base = 'https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js';

export async function init({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId }, ...plugins) {
	if (! Array.from(document.scripts).some(({ src }) => src === base)) {
		await loadScript(base, { crossOrigin: null, referrerPolicy: 'no-referrer' });

		if (plugins.length !== 0) {
			await loadPlugins(...plugins);
		}

		window.firebase.initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId });
	} else if (plugins.length !== 0) {
		await loadPlugins(...plugins);
	}

	return window.firebase;
}

export async function loadPlugins(...plugins) {
	const loadedScripts = Array.from(document.scripts).map(({ src }) => src);

	await Promise.all(plugins.map(async plugin => {
		if (typeof plugin !== 'string') {
			throw new TypeError('Plugins must be strings');
		} else if (! Plugins.hasOwnProperty(plugin)) {
			throw new Error(`Unknown Firebase plugin: ${plugin}`);
		} else if (! loadedScripts.includes(plugin)) {
			await loadScript(Plugins[plugin], { crossOrigin: null, referrerPolicy: 'no-referrer' });
		}
	}));
}
