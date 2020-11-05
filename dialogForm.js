function makeOpt({ text, value, icon = null }) {
	const btn = document.createElement('button');
	btn.type = 'submit';
	btn.classList.add('btn', 'btn-default');
	btn.value = value || text;

	if (typeof icon === 'string') {
		const span = document.createElement('span');
		const img = document.createElement('img');
		span.textContent = text || value;
		img.crossOrigin = 'anonymous';
		img.referrerPolicy = 'no-referrer';
		img.loading = 'lazy';
		img.decoding = 'async';
		img.src = icon;
		css(img, { 'margin': '4px', 'vertical-align': 'middle' });
		btn.append(span, img);
	} else {
		btn.textContent = text || value;
	}
	return btn;
}

function css(el, props) {
	Object.entries(props).forEach(([k, v]) => el.style.setProperty(k, v));
}

export async function dialogForm(question, ...opts) {
	const prompt = document.createElement('dialog');
	const form = document.createElement('form');
	const heading = document.createElement('h3');
	const container = document.createElement('div');
	const cancel = document.createElement('button');

	form.method = 'dialog';
	cancel.type = 'reset';
	cancel.textContent = 'Cancel';
	cancel.classList.add('btn', 'btn-reject');
	heading.textContent = question;

	css(heading, { 'text-align': 'center' });
	css(container, {
		display: 'flex',
		'flex-direction': 'row',
		'justify-content': 'space-around',
		gap: '8px',
		margin: '6px',
	});

	opts.forEach(opt => {
		if (typeof opt === 'string' || typeof opt === 'number') {
			container.append(makeOpt({ text: opt, value: opt }));
		} else {
			container.append(makeOpt(opt));
		}
	});

	form.append(container, cancel);
	prompt.append(heading, form);

	return await new Promise((resolve) => {
		prompt.addEventListener('close', async ({ target }) => {
			resolve(target.returnValue);
			target.remove();
		});

		form.addEventListener('reset', () => prompt.close());

		document.body.append(prompt);
		prompt.showModal();
	});
}
