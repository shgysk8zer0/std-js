window.addEventListener('keypress', function (event) {
    if (event.target.matches('[contenteditable="true"], [contenteditable="true"] *')) {
        switch (event.key.toLowerCase()) {
            case 'y':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('redo');
                }
                break;
            case 'z':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault()
                    event.stopPropagation();
                    document.execCommand('undo');
                }
                break;
            case 'a':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('selectall');
                }
                break;
            case 'e':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('justifyCenter');
                }
                break;
            case 'l':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('justifyLeft');
                }
                break;
            case 'r':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('justifyRight');
                }
                break;
            case 'j':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('justiyFull');
                }
                break;
            case 'i':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('styleWithCSS', null, true);
                    document.execCommand('italic');
                }
                break;
            case 'b':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('styleWithCSS', null, true);
                    document.execCommand('bold');
                }
                break;
            case 'u':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('styleWithCSS', null, true);
                    document.execCommand('underline');
                }
                break;
            case 'k':
                if (!(event.altKey || event.shiftKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    document.execCommand('styleWithCSS', null, true);
                    document.execCommand('strikethrough');
                }
                break;
            case 'tab':
                event.preventDefault();
                event.stopPropagation();
                (event.shiftKey) ? document.execCommand('outdent')  : document.execCommand('indent');
                break;
            default:
                console.log(event, this);
                break;
        }
    }
},
true);
