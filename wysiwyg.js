import { query as $ } from './functions.js';

function getSelectedElement(matching = '[contenteditable="true"] *') {
	let selected = getSelection().anchorNode;
	while(! (selected instanceof HTMLElement)) {
		selected = selected.parentElement;
	}

	if (selected.matches(`${matching} *`)) {
		return selected;
	} else {
		throw new Error('Attempting to edit an element that is not editable');
	}
}

function editorCommand(click) {
	click.preventDefault();
	document.execCommand('styleWithCSS', null, click.target.dataset.hasOwnProperty('styleWithCss'));
	let arg = null;
	if (click.target.dataset.hasOwnProperty('editorValue')) {
		arg = click.target.dataset.editorValue;
	} else if (click.target.dataset.hasOwnProperty('prompt')) {
		arg = prompt(click.target.dataset.prompt.toString());
	} else if (click.target.dataset.hasOwnProperty('selectionTo')) {
		let createdEl = document.createElement(this.dataset.selectionTo);
		createdEl.textContent = getSelection().toString();
		arg = createdEl.outerHTML;
	}
	document.execCommand(this.dataset.editorCommand, null, arg);
}

function addClass(click) {
	click.preventDefault();
	const cname = prompt('Enter class name to add');
	if (addClass.length !== 0) {
		getSelectedElement().classList.add(cname);
	}
}

function removeClass(click) {
	click.preventDefault();
	const cname = prompt('Enter class name to remove');
	if (removeClass.length !== 0) {
		const el = getSelectedElement();
		el.classList.remove(cname);
		if (el.classList.length === 0) {
			el.removeAttribute('class');
		}
	}
}

function setAttribute(click) {
	click.preventDefault();
	const name = prompt('Enter attribute name');
	if (name.length !== 0) {
		const value = prompt('Enter attribute value');
		getSelectedElement().setAttribute(name, value.toString());
	}
}

function removeAttribute(click) {
	click.preventDefault();
	const attr = prompt('Enter name of attribute to remove');
	if (attr.length !== 0) {
		getSelectedElement().removeAttribute(attr);
	}
}

function saveWork(click) {
	click.preventDefault();
	localStorage.setItem('savedDoc', document.querySelector('[contenteditable="true"]').innerHTML);
}

function restoreWork(click) {
	click.preventDefault();
	document.querySelector('[contenteditable="true"]').innerHTML = localStorage.getItem('savedDoc');
}

function embedYouTube(click) {
	click.preventDefault();
	const yt = prompt('Enter YouTube video URL');
	if (yt) {
		const url = new URL(yt, 'https://www.youtube.com/watch');
		if (url.searchParams.has('v')) {
			const iframe = document.createElement('iframe');
			url.pathname = `/embed/${url.searchParams.get('v')}`;
			url.searchParams.delete('v');
			iframe.width = 560;
			iframe.height = 315;
			iframe.src = url;
			iframe.setAttribute('frameborder', '0');
			iframe.setAttribute('allowfullscreen', '');
			document.execCommand('inserthtml', null, iframe.outerHTML);
		}
	}
}

export default  menu => {
	/* Do not use NodeList.forEach */
	$('[data-editor-command]', menu).forEach(item =>  {
		item.addEventListener('click', editorCommand);
	});
	$('[label="Add Class"]', menu).forEach(menuitem => {
		menuitem.addEventListener('click', addClass);
	});
	$('[label="Remove Class"]', menu).forEach(menuitem => {
		menuitem.addEventListener('click', removeClass);
	});
	$('[label="Set Attribute"]', menu).forEach(menuitem => {
		menuitem.addEventListener('click', setAttribute);
	});
	$('[label="Remove Attribute"]', menu).forEach(menuitem => {
		menuitem.addEventListener('click',removeAttribute);
	});
	$('[label="Save Work"]', menu).forEach(item => {
		item.addEventListener('click', saveWork);
	});
	$('[label="Restore Work"]', menu).forEach(item => {
		item.addEventListener('click', restoreWork);
	});
	$('[data-embed="youtube"]', menu).forEach(item => {
		item.addEventListener('click', embedYouTube);
	});
};
