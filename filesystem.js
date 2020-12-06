export async function save(file) {
	if (! (file instanceof File)) {
		throw new DOMException('Not a file');
	} else {
		const link = document.createElement('a');
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		link.style.setProperty('display', 'none');

		link.addEventListener('click', ({ target }) => {
			setTimeout(() => {
				URL.revokeObjectURL(target.href);
			}, 100);
		}, { passive: true, capture: true });

		link.click();
	}
}

export async function open({ accept = null, multiple = false, directory = false, description = 'Select file(s)' } = {}) {
	const form = document.createElement('form');
	const input = document.createElement('input');
	const dialog = document.createElement('dialog');
	const btns = document.createElement('div');
	const submit = document.createElement('button');
	const reset = document.createElement('button');
	const label = document.createElement('label');
	const container = document.createElement('div');

	input.name = 'files';
	input.type = 'file';
	input.toggleAttribute('webkitdirectory', directory);

	label.textContent = description;
	label.classList.add('input-label', 'block', 'required', 'cursor-pointer');

	if (Array.isArray(accept)) {
		input.accept = accept;
	} else if (typeof accept === 'string') {
		input.accept = accept;
	}

	dialog.classList.add('card', 'shadow');

	form.name = 'file-picker';
	input.accept = accept;
	input.multiple = multiple;
	input.required = true;
	input.classList.add('input');

	container.classList.add('form-group');
	submit.type = 'submit';
	submit.classList.add('btn', 'btn-accept', 'grow-1');
	submit.textContent = 'Ok';
	reset.type = 'reset';
	reset.classList.add('btn', 'btn-reject', 'grow-1');
	reset.textContent = 'Cancel';
	btns.classList.add('flex', 'row', 'no-wrap');
	btns.style.setProperty('margin-top', '18px');
	btns.style.setProperty('gap', '2em');

	return await new Promise((resolve, reject) => {
		form.addEventListener('submit', event => {
			event.preventDefault();
			const dialog = event.target.parentElement;
			resolve(Array.from(input.files));

			if (dialog.animate instanceof Function) {
				const anim = dialog.animate([{
					opacity: 1,
				}, {
					opacity: 0,
				}], {
					duration: 400,
					easing: 'ease-in-out',
					fill: 'both',
				});

				anim.finished.then(() => dialog.close());
			} else {
				dialog.close();
			}
		});

		dialog.addEventListener('close', event => event.target.remove());

		form.addEventListener('reset', event => {
			reject(new DOMException('The user aborted a request'));
			event.target.parentElement.close();
		});

		btns.append(submit, reset);
		input.click();
		container.append(label, input);
		form.append(container, btns);
		dialog.append(form);
		document.body.append(dialog);

		if (dialog.animate instanceof Function) {
			const anim = dialog.animate([{
				opacity: 0.1,
				transform: 'scale(0.3)',
			}, {
				opacity: 1,
				transform: 'none',
			}], {
				duration: 400,
				easing: 'ease-in-out',
				fill: 'both',
				delay: 100,
			});

			dialog.showModal();
			anim.finished.then(() => input.click());
		} else {
			dialog.showModal();
			setTimeout(() => input.click(), 200);
		}
	});
}
