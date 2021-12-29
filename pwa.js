import { getCustomElement } from './custom-elements.js';
import { preload, loadScript } from './loader.js';
import { resolveOn, beforeInstallPromptPromise } from './promises.js';

export const beforeInstallPrompt = beforeInstallPromptPromise;

export async function install() {
	if (customElements.get('install-prompt') instanceof HTMLElement) {
		const HTMLInstallPromptElement = customElements.get('install-prompt');

		return await new HTMLInstallPromptElement().show();
	} else {
		const [HTMLInstallPromptElement] = await Promise.all([
			getCustomElement('install-prompt'),
			preload('https://cdn.kernvalley.us/components/install/prompt.html', { as: 'fetch', type: 'text/html' }),
			preload('https://cdn.kernvalley.us/components/install/prompt.css', { as: 'style' }),
			loadScript('https://cdn.kernvalley.us/components/install/prompt.js', { type: 'module' }),
		]);

		return await new HTMLInstallPromptElement().show();
	}
}
