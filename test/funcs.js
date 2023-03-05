import { $ } from '../esQuery.js';
import { getJSON } from '../http.js';
import handleJSON from '../json_response.js';
import { on, data } from '../dom.js';
import { events, options, filter, init } from '../mutations.js';
import { DAYS } from '../date-consts.js';
import { alert, prompt } from '../asyncDialog.js';
import { createHTMLPolicyGetter } from '../trust.js';

export const trustPolicies = ['loader#html'];

export async function loadHandler() {
	data('[data-cookie][data-expires]', {
		expires: new Date(Date.now() + 2 * DAYS),
	});

	const policy = createHTMLPolicyGetter('loader#html', input => input)();

	init();

	$(document.body).watch(events, options, filter);

	on('#set-cookie', 'click', async () => {
		const name = await prompt('Enter cookie name');
		if (name !== '') {
			const value = await prompt('Enter cookie value');
			await cookieStore.set(name, value, {maxAge: 60});
		}
	});

	on('#get-cookie', 'click', async () => {
		const name = await prompt('Enter cookie name');
		if (name !== '') {
			alert(`${name} = "${await cookieStore.get(name)}"`);
		}
	});

	on('#has-cookie', 'click', async () => {
		const name = await prompt('Enter cookieStore name');
		if (name !== '') {
			alert(await cookieStore.has(name) ? 'Found' : 'Not found');
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
		document.getElementById('header').insertAdjacentHTML('beforeend', policy.createHTML('<github-user user="shgysk8zer0"></github-user>'));
		document.getElementById('header').insertAdjacentHTML('beforeend', policy.createHTML('<github-user user="kernvalley"></github-user>'));
	} catch(err) {
		console.error(err);
	}
}
