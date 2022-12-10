import { createIframe } from './elements.js';

export const allow = ['accelerometer', 'encrypted-media', 'gyroscope', 'picture-in-picture', 'fullscreen'];
export const sandbox = ['allow-scripts', 'allow-popups', 'allow-same-origin', 'allow-presentation'];
export const cookie = 'https://www.youtube.com/embed/';
export const noCookie = 'https://www.youtube-nocookie.com/embed/';

export function createYouTubeEmbed(video, {
	height, width, fetchPriority = 'low', referrerPolicy = 'origin',
	title = 'YouTube Embeded Video', loading = 'lazy', cookies = false,
} = {}) {
	const src = cookies ? new URL(`./${video}`, cookie) : new URL(`./${video}`, noCookie);

	return createIframe(src, {
		width, height, loading, title, fetchPriority, referrerPolicy, allow, sandbox, loading,
	});
}
