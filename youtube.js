/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import { createIframe } from './elements.js';
import { getYouTubePolicy } from './trust-policies.js';

export const allow = ['accelerometer', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'fullscreen'];
export const sandbox = ['allow-scripts', 'allow-popups', 'allow-same-origin', 'allow-presentation'];
export const cookie = 'https://www.youtube.com/embed/';
export const noCookie = 'https://www.youtube-nocookie.com/embed/';

export  const policy = getYouTubePolicy();

export function createYouTubeEmbed(video, {
	height, width, fetchPriority = 'low', referrerPolicy = 'origin',
	title = 'YouTube Embeded Video', loading = 'lazy', cookies = false,
	controls = true, start,
} = {}) {
	const src = cookies ? new URL(`./${video}`, cookie) : new URL(`./${video}`, noCookie);

	if (! controls) {
		src.searchParams.set('controls', '0');
	}

	if (Number.isSafeInteger(start) && start > 0) {
		src.searchParams.set('start', start);
	}

	return createIframe(src.href, {
		width, height, loading, title, fetchPriority, referrerPolicy, allow,
		sandbox, policy,
	});
}

export const trustPolicies = [policy.name];
