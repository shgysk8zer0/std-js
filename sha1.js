export default async function sha1(str) {
	return await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str))
		.then(buffer => {
			return [...new Uint8Array(buffer)].map(value => {
				const hexCode = value.toString(16).toUpperCase();
				const paddedHexCode = hexCode.padStart(2, '0');
				return paddedHexCode;
			}).join('');
		});
}
