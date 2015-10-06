function WYSIWYG(menu) {
	'use strict';
	menu.querySelectorAll('[data-editor-command]').forEach(item =>  {
		item.addEventListener('click', event =>  {
			event.preventDefault();
			document.execCommand('styleWithCSS', null, this.dataset.hasOwnProperty('styleWithCss'));
			let arg = null;
			if (this.dataset.hasOwnProperty('editorValue')) {
				arg = this.dataset.editorValue;
			} else if (this.dataset.hasOwnProperty('prompt')) {
				arg = prompt(this.dataset.prompt.toString());
			} else if (this.dataset.hasOwnProperty('selectionTo')) {
				let createdEl = document.createElement(this.dataset.selectionTo);
				createdEl.textContent = getSelection().toString();
				arg = createdEl.outerHTML;
			}
			document.execCommand(this.dataset.editorCommand, null, arg);
		});
	});
	menu.querySelectorAll('[label="Add Class"]').forEach(menuitem => {
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
	menu.querySelectorAll('[label="Set Attribute"]').forEach(menuitem => {
		menuitem.addEventListener('click', event => {
			event.preventDefault();
			let name = prompt('Enter attribute name');
			if (name.length !== 0) {
				var value = prompt('Enter attribute value');
				getSelection().anchorNode.parentElement.setAttribute(name, value.toString());
			}
		});
	});
	menu.querySelectorAll('[label="Remove Attribute"]').forEach(menuitem => {
		menuitem.addEventListener('click', function(event) {
			event.preventDefault();
			let attr = prompt('Enter name of attribute to remove');
			if (attr.length !== 0) {
				getSelection().anchorNode.parentElement.removeAttribute(attr);
			}
		});
	});
	menu.querySelectorAll('[label="Save Work"]').forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();
			localStorage.setItem('savedDoc', document.querySelector('[contenteditable="true"]').innerHTML);
		});
	});
	menu.querySelectorAll('[label="Restore Work"]').forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();
			document.querySelector('[contenteditable="true"]').innerHTML = localStorage.getItem('savedDoc');
		});
	});
}
