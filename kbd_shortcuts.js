/*
Add this as a listener on keypress events
*/
export default event => {
	if (event.target.matches('[contenteditable="true"], [contenteditable="true"] *')) {
		switch (event.key.toLowerCase()) {
			case 'y':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('redo');
				}
				break;
			case 'z':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('undo');
				}
				break;
			case 'a':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('selectall');
				}
				break;
			case 'e':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('justifyCenter');
				}
				break;
			case 'l':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('justifyLeft');
				}
				break;
			case 'r':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('justifyRight');
				}
				break;
			case 'j':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('justiyFull');
				}
				break;
			case 'i':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('styleWithCSS', null, false);
					document.execCommand('italic');
				}
				break;
			case 'b':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('styleWithCSS', null, false);
					document.execCommand('bold');
				}
				break;
			case 'u':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('styleWithCSS', null, false);
					document.execCommand('underline');
				}
				break;
			case 'k':
				if (event.ctrlKey && !(event.altKey || event.shiftKey)) {
					event.preventDefault();
					event.stopPropagation();
					document.execCommand('styleWithCSS', null, false);
					document.execCommand('strikethrough');
				}
				break;
			case 'tab':
				event.preventDefault();
				event.stopPropagation();
				document.execCommand(event.shiftKey ? 'outdent' : 'indent');
				break;
		}
	}
};
