import {query as $} from './functions.es6';

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
	let addClass = prompt('Enter class name to add');
	if (addClass.length !== 0) {
		getSelection().anchorNode.parentElement.classList.add(addClass);
	}
}

function removeClass(click) {
	click.preventDefault();
	let removeClass = prompt('Enter class name to remove');
	if (removeClass.length !== 0) {
		let el = getSelection().anchorNode.parentElement;
		el.classList.remove(removeClass);
		if (el.classList.length === 0) {
			el.removeAttribute('class');
		}
	}
}

function setAttribute(click) {
	click.preventDefault();
	let name = prompt('Enter attribute name');
	if (name.length !== 0) {
		var value = prompt('Enter attribute value');
		getSelection().anchorNode.parentElement.setAttribute(name, value.toString());
	}
}

function removeAttribute(click) {
	click.preventDefault();
	let attr = prompt('Enter name of attribute to remove');
	if (attr.length !== 0) {
		getSelection().anchorNode.parentElement.removeAttribute(attr);
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
};
