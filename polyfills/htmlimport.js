if (! ('import' in HTMLLinkElement.prototype)) {
	Object.defineProperty(HTMLLinkElement.prototype, 'import', {
		get: function() {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', this.href, false);
			xhr.send();
			return new DOMParser().parseFromString(xhr.response, "text/html");
		}
	});
}
