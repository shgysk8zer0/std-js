import $ from './qsaArray.es6';

export default  menu => {
	/* Do not use NodeList.forEach */
	$('[data-editor-command]', menu).forEach(item =>  {
		item.addEventListener('click', event =>  {
			event.preventDefault();
			document.execCommand('styleWithCSS', null, item.dataset.hasOwnProperty('styleWithCss'));
			let arg = null;
			if (item.dataset.hasOwnProperty('editorValue')) {
				arg = item.dataset.editorValue;
			} else if (item.dataset.hasOwnProperty('prompt')) {
				arg = prompt(item.dataset.prompt.toString());
			} else if (item.dataset.hasOwnProperty('selectionTo')) {
				let createdEl = document.createElement(item.dataset.selectionTo);
				createdEl.textContent = getSelection().toString();
				arg = createdEl.outerHTML;
			}
			document.execCommand(item.dataset.editorCommand, null, arg);
		});
	});
	$('[label="Add Class"]', menu).forEach(menuitem => {
		menuitem.addEventListener('click', event => {
			event.preventDefault();
			let addClass = prompt('Enter class name to add');
			if (addClass.length !== 0) {
				getSelection().anchorNode.parentElement.classList.add(addClass);
			}
		});
	});
	menu.querySelectorAll('[label="Remove Class"]').forEach(menuitem => {
		menuitem.addEventListener('click', event => {
			event.preventDefault();
			let removeClass = prompt('Enter class name to remove');
			if (removeClass.length !== 0) {
				let el = getSelection().anchorNode.parentElement;
				el.classList.remove(removeClass);
				if (el.classList.length === 0) {
					el.removeAttribute('class');
				}
			}
		});
	});
	$('[label="Set Attribute"]' menu,).forEach(menuitem => {
		menuitem.addEventListener('click', event => {
			event.preventDefault();
			let name = prompt('Enter attribute name');
			if (name.length !== 0) {
				var value = prompt('Enter attribute value');
				getSelection().anchorNode.parentElement.setAttribute(name, value.toString());
			}
		});
	});
	$('[label="Remove Attribute"]', menu).forEach(menuitem => {
		menuitem.addEventListener('click',event => {
			event.preventDefault();
			let attr = prompt('Enter name of attribute to remove');
			if (attr.length !== 0) {
				getSelection().anchorNode.parentElement.removeAttribute(attr);
			}
		});
	});
	$('[label="Save Work"]', menu).forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();
			localStorage.setItem('savedDoc', document.querySelector('[contenteditable="true"]').innerHTML);
		});
	});
	$('[label="Restore Work"]', menu).forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();
			document.querySelector('[contenteditable="true"]').innerHTML = localStorage.getItem('savedDoc');
		});
	});
}
