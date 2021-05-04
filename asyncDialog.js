import { css } from './dom.js';

function fadeIn(dialog) {
	if (dialog.animate instanceof Function) {
		dialog.animate([{
			opacity: 0,
			transform: 'translate(0, -50vh)',
		}, {
			opacity: 1,
			transform: 'none',
		}], {
			duration: 400,
			easing: 'ease-in-out',
		});
	}

	document.body.append(dialog);
	dialog.showModal();
}

const btnStyles = {
	'max-width': '180px',
	'min-width': '60px',
};

const btnContainerStyles = {
	'justify-content': 'center',
	'gap': '16px',
};

export async function alert(text) {
	return await new Promise(resolve => {
		const dialog = document.createElement('dialog');
		const msg = document.createElement('div');
		const close = document.createElement('button');
		const btns = document.createElement('div');
		css(btns, btnContainerStyles);
		btns.classList.add('flex', 'row', 'no-wrap');
		close.classList.add('btn', 'btn-primary', 'grow-1');
		css(close, btnStyles);

		dialog.classList.add('clearfix');
		msg.textContent = text;
		close.textContent = 'Ok';

		dialog.addEventListener('close', event => {
			event.target.remove();
			resolve();
		});
		close.addEventListener('click', event => event.target.closest('dialog[open]').close());
		btns.append(close);
		dialog.append(msg, document.createElement('br'), btns);
		fadeIn(dialog);
	});
}

export async function confirm(text) {
	return await new Promise(resolve => {
		const dialog = document.createElement('dialog');
		const msg = document.createElement('div');
		const close = document.createElement('button');
		const ok = document.createElement('button');
		const btns = document.createElement('div');
		css(btns, btnContainerStyles);

		close.type = 'button';
		ok.type = 'button';
		ok.classList.add('btn', 'btn-accept', 'grow-1');
		close.classList.add('btn', 'btn-reject', 'grow-1');
		btns. classList.add('flex', 'row', 'no-wrap');
		css(ok, btnStyles);
		css(close, btnStyles);

		msg.textContent = text;
		close.textContent = 'Cancel';
		ok.textContent = 'Ok';

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

		btns.append(close, ok);

		dialog.append(msg, document.createElement('br'), btns);
		fadeIn(dialog);
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
		const btns = document.createElement('div');
		css(btns, btnContainerStyles);

		close.type = 'button';
		ok.type = 'submit';
		input.type = 'text';
		input.placeholder = defaultValue;
		input.value = defaultValue;
		input.name = 'result';
		css(input, {
			width: '100%',
			background: 'transparent',
			'border-width': '0 0 2px 0',
			'border-color': 'currentColor',
			color: 'inherit',
			margin: '8px',
			padding: '4px 8px',
		});

		css(ok, btnStyles);
		css(close, btnStyles);

		ok.classList.add('btn', 'btn-primary', 'grow-1', 'shrink-0');
		close.classList.add('btn', 'btn-reject', 'grow-1');
		btns.classList.add('flex', 'row', 'no-wrap', 'center');

		msg.textContent = text;
		close.textContent = 'Cancel';
		ok.textContent = 'Ok';

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

		btns.append(ok, close);

		form.append(input, document.createElement('br'), btns);

		dialog.append(msg, form);
		fadeIn(dialog);
		input.select();
	});
}
