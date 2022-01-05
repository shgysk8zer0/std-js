import { $ } from '../esQuery.js';
import { getJSON } from '../http.js';
import handleJSON from '../json_response.js';
import { on, data } from '../dom.js';
import * as mutations from '../mutations.js';
import { DAYS } from '../date-consts.js';
import { alert, prompt } from '../asyncDialog.js';
import { createScriptURL, createHTML, whenPolicyCreated } from '../trust.js';
import { loadScript } from '../loader.js';
import 'https://cdn.kernvalley.us/components/toast-message.js';

const modules = [
	'https://cdn.kernvalley.us/components/share-button.js',
	'https://cdn.kernvalley.us/components/github/user.js',
];

export async function loadHandler() {
	data('[data-cookie][data-expires]', {
		expires: new Date(Date.now() + 2 * DAYS),
	});

	Promise.allSettled(
		modules.map(url => loadScript(createScriptURL(url), { type: 'module' }))
	).catch(console.error);

	if (document.createElement('details') instanceof HTMLUnknownElement) {
		on('details > summary', 'click', function() {
			this.parentElement.open = ! this.parentElement.open;
		});
	}

	mutations.init();

	$(document.body).watch(mutations.events, mutations.options, mutations.filter);

	on('#set-cookie', 'click', async () => {
		const name = await prompt('Enter cookie name');
		if (name !== '') {
			const value = await prompt('Enter cookie value');
			cookieStore.set(name, value, {maxAge: 60});
		}
	});

	on('#get-cookie', 'click', async () => {
		const name = await prompt('Enter cookie name');
		if (name !== '') {
			alert(`${name} = "${cookieStore.get(name)}"`);
		}
	});

	on('#has-cookie', 'click', async () => {
		const name = await prompt('Enter cookieStore name');
		if (name !== '') {
			alert(cookieStore.has(name) ? 'Found' : 'Not found');
		}
	});

	on('#all-cookie', 'click', async () =>{
		console.log(await cookieStore.getAll());
		alert('Check console');
	});

	on('#clear-cookie', 'click', cookieStore.clear);

	try {
		const json = await getJSON('/fetch.json');
		await handleJSON(json);
		on('main', 'click', () => $('article:first-of-type').read());
		await Promise.all([customElements.whenDefined('github-user'), whenPolicyCreated('default')]);
		document.getElementById('header').insertAdjacentHTML('beforeend', createHTML('<github-user user="shgysk8zer0"></github-user>'));
		document.getElementById('header').insertAdjacentHTML('beforeend', createHTML('<github-user user="kernvalley"></github-user>'));
	} catch(err) {
		console.error(err);
	}
}
