export async function alert(text) {
	return await new Promise(resolve => {
		const dialog = document.createElement('dialog');
		const msg = document.createElement('div');
		const close = document.createElement('button');

		dialog.classList.add('clearfix', 'animation-speed-normal', 'animation-ease-in', 'fadeInUp');
		close.classList.add('float-right');
		msg.textContent = text;
		close.textContent = 'Ok';

		dialog.addEventListener('close', event => {
			event.target.remove();
			resolve();
		});
		close.addEventListener('click', event => event.target.closest('dialog[open]').close());
		dialog.append(msg, close);
		document.body.append(dialog);
		dialog.showModal();
	});
}

export async function confirm(text) {
	return await new Promise(resolve => {
		const dialog = document.createElement('dialog');
		const msg = document.createElement('div');
		const close = document.createElement('button');
		const ok = document.createElement('button');

		close.type = 'button';
		ok.type = 'button';

		ok.classList.add('btn', 'btn-accept');
		close.classList.add('btn', 'btn-reject');
		dialog.classList.add('animation-speed-normal', 'animation-ease-in', 'fadeInUp');

		msg.textContent = text;
		close.textContent = 'Cancel';
		ok.textContent = 'Ok';

		ok.style.setProperty('margin-right', '0.4em');

		dialog.addEventListener('close', event => {
			event.target.remove();
			resolve(event.returnValue && event.target.returnValue === 'confirm');
		});

		close.addEventListener('click', event => {
			event.target.closest('dialog[open]').close();
		});

		ok.addEventListener('click', event => {
			event.target.closest('dialog[open]').close('confirm');
		});

		dialog.append(msg, ok, close);
		document.body.append(dialog);
		dialog.showModal();
	});
}

export async function prompt(text, defaultValue = '') {
	return await new Promise(resolve => {
		const dialog = document.createElement('dialog');
		const msg = document.createElement('div');
		const close = document.createElement('button');
		const ok = document.createElement('button');
		const form = document.createElement('form');
		const input = document.createElement('input');

		close.type = 'button';
		ok.type = 'submit';
		input.type = 'text';
		input.placeholder = defaultValue;
		input.value = defaultValue;
		input.name = 'result';

		ok.classList.add('btn', 'btn-accept');
		close.classList.add('btn', 'btn-reject');
		dialog.classList.add('animation-speed-normal', 'animation-ease-in', 'fadeInUp');

		msg.textContent = text;
		close.textContent = 'Cancel';
		ok.textContent = 'Ok';
		input.style.setProperty('margin-bottom', '12px');
		ok.style.setProperty('margin-right', '0.4em');

		dialog.addEventListener('close', event => event.target.remove());

		close.addEventListener('click', event => {
			event.target.closest('dialog[open]').close();
			resolve(null);
		});

		form.addEventListener('submit', event => {
			event.preventDefault();
			const data = new FormData(event.target);
			event.target.closest('dialog[open]').close();
			resolve(data.get('result'));
		});

		form.append(input, document.createElement('br'), ok, close);

		dialog.append(msg, form);
		document.body.append(dialog);
		dialog.showModal();
		input.select();
	});
}
