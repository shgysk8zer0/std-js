function WYSIWYG(menu)
{
	menu.querySelectorAll('menuitem[data-editor-command]').forEach(function(item)
	{
		item.addEventListener('click', function()
		{
			var arg = null;
			if (this.dataset.hasOwnProperty('editorValue')) {
				arg = this.dataset.editorValue;
			} else if (this.dataset.hasOwnProperty('prompt')) {
				arg = prompt(this.dataset.prompt.toString());
			} else if (this.dataset.hasOwnProperty('selectionTo')) {
				var createdEl = document.createElement(this.dataset.selectionTo);
				createdEl.textContent = getSelection().toString();
				arg = createdEl.outerHTML;
			}
			document.execCommand(this.dataset.editorCommand, null, arg);
		});
	});
	menu.querySelectorAll('menuitem[label="Add Class"]').forEach(function(menuitem) {
		menuitem.addEventListener('click', function() {
			var addClass = prompt('Enter class name to add');
			if (addClass.length !== 0) {
				getSelection().anchorNode.parentElement.classList.add(addClass);
			}
		});
	});
	menu.querySelectorAll('menuitem[label="Remove Class"]').forEach(function(menuitem) {
		menuitem.addEventListener('click', function() {
			var removeClass = prompt('Enter class name to remove');
			if (removeClass.length !== 0) {
				var el = getSelection().anchorNode.parentElement;
				el.classList.remove(removeClass);
				if (el.classList.length === 0) {
					el.removeAttribute('class');
				}
			}
		});
	});
	menu.querySelectorAll('menuitem[label="Set Attribute"]').forEach(function(menuitem) {
		menuitem.addEventListener('click', function() {
			var name = prompt('Enter attribute name');
			if (name.length !== 0) {
				var value = prompt('Enter attribute value');
				getSelection().anchorNode.parentElement.setAttribute(name, value.toString());
			}
		})
	});
	menu.querySelectorAll('menuitem[label="Remove Attribute"]').forEach(function(menuitem) {
		menuitem.addEventListener('click', function() {
			var attr = prompt('Enter name of attribute to remove');
			if (attr.length !== 0) {
				getSelection().anchorNode.parentElement.removeAttribute(attr);
			}
		});
	});
}
