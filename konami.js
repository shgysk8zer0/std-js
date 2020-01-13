export default async function konami() {
	await new Promise(resolve => {
		// Keycodes for: ↑ ↑ ↓ ↓ ← → ← → B A
		const expectedPattern = '38384040373937396665';
		let rollingPattern = '';

		const listener = event => {
			rollingPattern += event.keyCode;
			rollingPattern = rollingPattern.slice(-expectedPattern.length);

			if (rollingPattern === expectedPattern) {
				window.removeEventListener('keydown', listener);
				resolve();
			}
		};

		window.addEventListener('keydown', listener);
	});
}
