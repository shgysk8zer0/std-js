/**
 * @copyright 2023 Chris Zuber <admin@kernvalley.us>
 */
import {
	createSVG, createPath, createGroup, createCircle, createRect, translate, rotate,
} from './svg.js';

/**
 * Adwaita Icons
 */
export function createAddressBookIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M1.189 14c0 1.09.91 2 2 2h8.823c1.09 0 2-.91 2-2V3c0-1.09-.91-2-2-2H3.189c-1.09 0-2 .91-2 2h10.823v11H1.189z', {
				'fill-rule': 'evenodd',
			}),
			createPath('M.594 12a.502.502 0 1 0 .093 1H2.5a.5.5 0 1 0 0-1H.687a.5.5 0 0 0-.093 0zm0-2a.502.502 0 1 0 .093 1H2.5a.5.5 0 1 0 0-1H.687a.5.5 0 0 0-.093 0zm0-2a.502.502 0 1 0 .093 1H2.5a.5.5 0 1 0 0-1H.687a.5.5 0 0 0-.093 0zm0-2a.502.502 0 1 0 .093 1H2.5a.5.5 0 1 0 0-1H.687a.5.5 0 0 0-.093 0zm0-2a.502.502 0 1 0 .093 1H2.5a.5.5 0 1 0 0-1H.687a.5.5 0 0 0-.093 0z', {
				'fill-rule': 'evenodd',
			}),
			createPath('M7 10c.328.066.666.007 1 0 .334-.007.669.04 1 0 .624-.074 1.196-.462 1.523-.998a2.41 2.41 0 0 0 .26-1.817A2.807 2.807 0 0 0 9.75 5.652 3.366 3.366 0 0 0 8.009 5a3.737 3.737 0 0 0-2.565.746 3.69 3.69 0 0 0-1.382 2.285 3.647 3.647 0 0 0 .185 1.895c.228.6.618 1.137 1.119 1.54.5.402 1.11.668 1.744.76A3.647 3.647 0 0 0 9 12v-1c-.453.299-1 .453-1.542.437a2.677 2.677 0 0 1-1.513-.53 2.676 2.676 0 0 1-.932-1.304A2.677 2.677 0 0 1 5 8a2.818 2.818 0 0 1 1.154-1.511A3.13 3.13 0 0 1 8 6c.537.026 1.082.193 1.483.551.2.18.362.404.456.656.095.252.12.53.061.793-.054.24-.18.464-.355.637a1.294 1.294 0 0 1-.645.34V8a1.628 1.628 0 0 0-.595-.737 1.628 1.628 0 0 0-.905-.277c-.32 0-.64.098-.905.277-.266.18-.476.44-.595.737-.158.394-.152.856.033 1.238.186.383.55.678.967.762m1.036-.977a.708.708 0 0 1-.814.132.707.707 0 0 1-.378-.732.707.707 0 0 1 .453-.554A.706.706 0 0 1 8 8', {
				'letter-spacing': '0',
				'word-spacing': '0',
			})
		]
	});
}

export function createAlertIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export  function createAppsIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0,24, 24],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M 15.9994,19.9981L 19.9994,19.9981L 19.9994,15.9981L 15.9994,15.9981M 15.9994,13.9981L 19.9994,13.9981L 19.9994,9.99807L 15.9994,9.99807M 9.99938,7.99807L 13.9994,7.99807L 13.9994,3.99807L 9.99938,3.99807M 15.9994,7.99807L 19.9994,7.99807L 19.9994,3.99807L 15.9994,3.99807M 9.99938,13.9981L 13.9994,13.9981L 13.9994,9.99807L 9.99938,9.99807M 3.99938,13.9981L 7.99938,13.9981L 7.99938,9.99807L 3.99938,9.99807M 3.99938,19.9981L 7.99938,19.9981L 7.99938,15.9981L 3.99938,15.9981M 9.99938,19.9981L 13.9994,19.9981L 13.9994,15.9981L 9.99938,15.9981M 3.99938,7.99807L 7.99938,7.99807L 7.99938,3.99807L 3.99938,3.99807L 3.99938,7.99807 Z', {
				'stroke-width': 0.2,
				'stroke-linejoin': 'round',
			})
		]
	});
}

export function createBellIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M13.99 11.991v1H0v-1l.73-.58c.769-.769.809-2.547 1.189-4.416.77-3.767 4.077-4.996 4.077-4.996 0-.55.45-1 .999-1 .55 0 1 .45 1 1 0 0 3.387 1.229 4.156 4.996.38 1.879.42 3.657 1.19 4.417l.659.58h-.01zM6.995 15.99c1.11 0 1.999-.89 1.999-1.999H4.996c0 1.11.89 1.999 1.999 1.999z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

/**
 * Adwaita Icons
 */
export function createCallStartIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M13.032 1c.534 0 .969.427.969.969v.062c-.017 6.613-5.383 11.97-12 11.97H1.97c-.545 0-.97-.447-.97-1v-3c0-.555.447-1 1-1h2c.555 0 1 .445 1 1v.468A8.967 8.967 0 0 0 10.47 5H10c-.553 0-1-.446-1-1V2c0-.554.447-1 1-1h3.032z', {
				'overflow': 'visible',
			})
		]
	});
}

export function createCheckIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createCreditCardIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M12 9H2V8h10v1zm4-6v9c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h14c.55 0 1 .45 1 1zm-1 3H1v6h14V6zm0-3H1v1h14V3zm-9 7H2v1h4v-1z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createCommentIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M14 1H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2v3.5L7.5 11H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 9H7l-2 2v-2H2V2h12v8z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

/**
 * Adwaita Icons
 */
export function createContactNewIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createGroup({
				transform: translate(-261, -727),
				children: [
					createPath('M269.55 735.09c-.705.624-1.54.906-2.555.906s-1.853-.29-2.558-.914c-1.11.363-2.436 1.288-2.438 2.902l-.004 3.012c0 .554.446 1 1 1h8c.554 0 1-.446 1-1v-3c0-1.387-1.102-2.556-2.445-2.906z'),
					createCircle({ cx: 49.5, cy: 342.5, r: 2.5, transform: 'matrix(1.2 0 0 1.2 207.6 321)' }),
					createPath('M273 728v1.997h-2v1.996h2v1.997h2v-1.997h2v-1.996h-2V728z')
				]
			}),
			createPath('M14 1H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2v3.5L7.5 11H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 9H7l-2 2v-2H2V2h12v8z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

/**
 * Adwaita Icons
 */
export function createDialogPasswordIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M5 3C2.25 3 0 5.25 0 8s2.25 5 5 5c1.586 0 2.903-.845 3.813-2h5.593l.22-.75 1.03-4L15.97 5H8.813C7.903 3.845 6.586 3 5 3zm0 2c1.116 0 2.038.595 2.563 1.5l.312.5h5.531l-.53 2H7.874l-.312.5C7.038 10.405 6.116 11 5 11c-1.669 0-3-1.331-3-3s1.331-3 3-3z', {
				'overflow': 'visible',
			}),
			createPath('M14.498 8H9l-.563 2H14z', {
				'overflow': 'visible',
				'opacity': 0.35,
			}),
			createPath('M5 8a1 1 0 1 1-2 0 1 1 0 1 1 2 0z', {
				'overflow': 'visible',
			}),
		]
	});
}

export function createFileIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createFileCodeIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M8.5 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V4.5L8.5 1zM11 14H1V2h7l3 3v9zM5 6.98L3.5 8.5 5 10l-.5 1L2 8.5 4.5 6l.5.98zM7.5 6L10 8.5 7.5 11l-.5-.98L8.5 8.5 7 7l.5-1z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createFileMediaIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M6 5h2v2H6V5zm6-.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v11l3-5 2 4 2-2 3 3V5z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createFilePDFIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M8.5 1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4.5L8.5 1zM1 2h4a.68.68 0 0 0-.31.2 1.08 1.08 0 0 0-.23.47 4.22 4.22 0 0 0-.09 1.47c.06.609.173 1.211.34 1.8A21.78 21.78 0 0 1 3.6 8.6c-.5 1-.8 1.66-.91 1.84a7.161 7.161 0 0 0-.69.3 4.19 4.19 0 0 0-1 .64V2zm4.42 4.8a5.65 5.65 0 0 0 1.17 2.09c.275.237.595.417.94.53-.64.09-1.23.2-1.81.33a12.22 12.22 0 0 0-1.81.59c-.587.243.22-.44.61-1.25.365-.74.67-1.51.91-2.3l-.01.01zM11 14H1.5a.743.743 0 0 1-.17 0 2.12 2.12 0 0 0 .73-.44 10.14 10.14 0 0 0 1.78-2.38c.31-.13.58-.23.81-.31l.42-.14c.45-.13.94-.23 1.44-.33s1-.16 1.48-.2c.447.216.912.394 1.39.53.403.11.814.188 1.23.23h.38V14H11zm0-4.86a3.74 3.74 0 0 0-.64-.28 4.22 4.22 0 0 0-.75-.11c-.411.003-.822.03-1.23.08a3 3 0 0 1-1-.64 6.07 6.07 0 0 1-1.29-2.33c.111-.662.178-1.33.2-2 .02-.25.02-.5 0-.75a1.05 1.05 0 0 0-.2-.88.82.82 0 0 0-.61-.23H8l3 3v4.14z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createFileZipIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M8.5 1H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4.5L8.5 1zM11 14H1V2h3v1h1V2h3l3 3v9zM5 4V3h1v1H5zM4 4h1v1H4V4zm1 2V5h1v1H5zM4 6h1v1H4V6zm1 2V7h1v1H5zM4 9.28A2 2 0 0 0 3 11v1h4v-1a2 2 0 0 0-2-2V8H4v1.28zM6 10v1H4v-1h2z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}



export function createFindLocationIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M7 0v1.031A6.514 6.514 0 0 0 1.062 7H0v1h1.063A6.514 6.514 0 0 0 7 13.969V15h1v-1.031c3.188-.234 5.724-2.78 5.969-5.969H15V7h-1.031C13.724 3.811 11.189 1.233 8 1V0zm.531 2.813c2.607 0 4.688 2.08 4.688 4.687s-2.081 4.688-4.688 4.688c-2.606 0-4.75-2.082-4.75-4.688s2.144-4.688 4.75-4.688zM7.5 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z')
		]
	});
}

export function createGrabberIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 8, 16],
		...rest, height: size, width: parseInt(8 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M8 4v1H0V4h8zM0 8h8V7H0v1zm0 3h8v-1H0v1z', { 'fill-rule': 'evenodd' })
		]
	});
}

export function createGlobeIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M7 1C3.14 1 0 4.14 0 8s3.14 7 7 7c.48 0 .94-.05 1.38-.14-.17-.08-.2-.73-.02-1.09.19-.41.81-1.45.2-1.8-.61-.35-.44-.5-.81-.91-.37-.41-.22-.47-.25-.58-.08-.34.36-.89.39-.94.02-.06.02-.27 0-.33 0-.08-.27-.22-.34-.23-.06 0-.11.11-.2.13-.09.02-.5-.25-.59-.33-.09-.08-.14-.23-.27-.34-.13-.13-.14-.03-.33-.11s-.8-.31-1.28-.48c-.48-.19-.52-.47-.52-.66-.02-.2-.3-.47-.42-.67-.14-.2-.16-.47-.2-.41-.04.06.25.78.2.81-.05.02-.16-.2-.3-.38-.14-.19.14-.09-.3-.95s.14-1.3.17-1.75c.03-.45.38.17.19-.13-.19-.3 0-.89-.14-1.11-.13-.22-.88.25-.88.25.02-.22.69-.58 1.16-.92.47-.34.78-.06 1.16.05.39.13.41.09.28-.05-.13-.13.06-.17.36-.13.28.05.38.41.83.36.47-.03.05.09.11.22s-.06.11-.38.3c-.3.2.02.22.55.61s.38-.25.31-.55c-.07-.3.39-.06.39-.06.33.22.27.02.5.08.23.06.91.64.91.64-.83.44-.31.48-.17.59.14.11-.28.3-.28.3-.17-.17-.19.02-.3.08-.11.06-.02.22-.02.22-.56.09-.44.69-.42.83 0 .14-.38.36-.47.58-.09.2.25.64.06.66-.19.03-.34-.66-1.31-.41-.3.08-.94.41-.59 1.08.36.69.92-.19 1.11-.09.19.1-.06.53-.02.55.04.02.53.02.56.61.03.59.77.53.92.55.17 0 .7-.44.77-.45.06-.03.38-.28 1.03.09.66.36.98.31 1.2.47.22.16.08.47.28.58.2.11 1.06-.03 1.28.31.22.34-.88 2.09-1.22 2.28-.34.19-.48.64-.84.92s-.81.64-1.27.91c-.41.23-.47.66-.66.8 3.14-.7 5.48-3.5 5.48-6.84 0-3.86-3.14-7-7-7L7 1zm1.64 6.56c-.09.03-.28.22-.78-.08-.48-.3-.81-.23-.86-.28 0 0-.05-.11.17-.14.44-.05.98.41 1.11.41.13 0 .19-.13.41-.05.22.08.05.13-.05.14zM6.34 1.7c-.05-.03.03-.08.09-.14.03-.03.02-.11.05-.14.11-.11.61-.25.52.03-.11.27-.58.3-.66.25zm1.23.89c-.19-.02-.58-.05-.52-.14.3-.28-.09-.38-.34-.38-.25-.02-.34-.16-.22-.19.12-.03.61.02.7.08.08.06.52.25.55.38.02.13 0 .25-.17.25zm1.47-.05c-.14.09-.83-.41-.95-.52-.56-.48-.89-.31-1-.41-.11-.1-.08-.19.11-.34.19-.15.69.06 1 .09.3.03.66.27.66.55.02.25.33.5.19.63h-.01z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createHeartIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M9 2c-.97 0-1.69.42-2.2 1-.51.58-.78.92-.8 1-.02-.08-.28-.42-.8-1-.52-.58-1.17-1-2.2-1-1.632.086-2.954 1.333-3 3 0 .52.09 1.52.67 2.67C1.25 8.82 3.01 10.61 6 13c2.98-2.39 4.77-4.17 5.34-5.33C11.91 6.51 12 5.5 12 5c-.047-1.69-1.342-2.913-3-3z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createInfoIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createLinkIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createLinkExternalIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M11 10h1v3c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h3v1H1v10h10v-3zM6 2l2.25 2.25L5 7.5 6.5 9l3.25-3.25L12 8V2H6z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createMarkLocationIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M8 0a5 5 0 0 0-5 5c0 .173.014.332.031.5.014.167.036.336.063.5C3.666 9.514 6 12.003 8 14.003c2-2 4.334-4.489 4.906-8.003a6.38 6.38 0 0 0 .063-.5c.017-.168.03-.327.03-.5a5 5 0 0 0-5-5zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z')
		]
	});
}

/**
 * Adwaita Icons
 */
export function createOpenMenuIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M3 3h10v2H3zm0 4h10v2H3zm0 4h10v2H3z')
		]
	});
}

/**
 * Adwaita Icons
 */
export function createPublicShareIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M5.969 7.969a2.969 2.969 0 1 1-5.938 0 2.969 2.969 0 1 1 5.938 0zm9.969 5a2.969 2.969 0 1 1-5.938 0 2.969 2.969 0 1 1 5.938 0zm0-10a2.969 2.969 0 1 1-5.938 0 2.969 2.969 0 1 1 5.938 0z', {
				'overflow': 'visible',
			}),
			createPath('M12.625 2.156L2.562 7.031.75 7.938l1.812.906 10.032 5.062.906-1.812-8.22-4.156 8.219-4-.875-1.782z', {
				'overflow': 'visible',
			})
		]
	});
}

export function createLockIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M4 13H3v-1h1v1zm8-6v7c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h1V4c0-2.2 1.8-4 4-4s4 1.8 4 4v2h1c.55 0 1 .45 1 1zM3.8 6h4.41V4c0-1.22-.98-2.2-2.2-2.2-1.22 0-2.2.98-2.2 2.2v2H3.8zM11 7H2v7h9V7zM4 8H3v1h1V8zm0 2H3v1h1v-1z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createMailIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M0 4v8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1zm13 0L7 9 1 4h12zM1 5.5l4 3-4 3v-6zM2 12l3.5-3L7 10.5 8.5 9l3.5 3H2zm11-.5l-4-3 4-3v6z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createMapIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 48, 48],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M41 6c-.11 0-.21.01-.31.05L30 10.2 18 6 6.73 9.8c-.42.14-.73.5-.73.96V41c0 .55.45 1 1 1 .11 0 .21-.01.31-.05L18 37.8 30 42l11.28-3.79c.42-.15.72-.51.72-.97V7c0-.55-.45-1-1-1zM30 38l-12-4.21V10l12 4.21V38z')
		]
	});
}

export function createPersonIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M12 14.002a.998.998 0 0 1-.998.998H1.001A1 1 0 0 1 0 13.999V13c0-2.633 4-4 4-4s.229-.409 0-1c-.841-.62-.944-1.59-1-4 .173-2.413 1.867-3 3-3s2.827.586 3 3c-.056 2.41-.159 3.38-1 4-.229.59 0 1 0 1s4 1.367 4 4v1.002z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createPinIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M10 1.2V2l.5 1L6 6H2.2c-.44 0-.67.53-.34.86L5 10l-4 5 5-4 3.14 3.14a.5.5 0 0 0 .86-.34V10l3-4.5 1 .5h.8c.44 0 .67-.53.34-.86L10.86.86a.5.5 0 0 0-.86.34z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createPlusIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M12 9H7v5H5V9H0V7h5V2h2v5h5v2z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createQuestionIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M6 10h2v2H6v-2zm4-3.5C10 8.64 8 9 8 9H6c0-.55.45-1 1-1h.5c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5h-1c-.28 0-.5.22-.5.5V7H4c0-1.5 1.5-3 3-3s3 1 3 2.5zM7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createQuoteIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M6.16 3.5C3.73 5.06 2.55 6.67 2.55 9.36c.16-.05.3-.05.44-.05 1.27 0 2.5.86 2.5 2.41 0 1.61-1.03 2.61-2.5 2.61-1.9 0-2.99-1.52-2.99-4.25 0-3.8 1.75-6.53 5.02-8.42L6.16 3.5zm7 0c-2.43 1.56-3.61 3.17-3.61 5.86.16-.05.3-.05.44-.05 1.27 0 2.5.86 2.5 2.41 0 1.61-1.03 2.61-2.5 2.61-1.89 0-2.98-1.52-2.98-4.25 0-3.8 1.75-6.53 5.02-8.42l1.14 1.84h-.01z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createReplyIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M6 3.5c3.92.44 8 3.125 8 10-2.312-5.062-4.75-6-8-6V11L.5 5.5 6 0v3.5z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createRepoIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createScreenFullIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M13 10h1v3c0 .547-.453 1-1 1h-3v-1h3v-3zM1 10H0v3c0 .547.453 1 1 1h3v-1H1v-3zm0-7h3V2H1c-.547 0-1 .453-1 1v3h1V3zm1 1h10v8H2V4zm2 6h6V6H4v4zm6-8v1h3v3h1V3c0-.547-.453-1-1-1h-3z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createScreenNormalIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M2 4H0V3h2V1h1v2c0 .547-.453 1-1 1zm0 8H0v1h2v2h1v-2c0-.547-.453-1-1-1zm9-2c0 .547-.453 1-1 1H4c-.547 0-1-.453-1-1V6c0-.547.453-1 1-1h6c.547 0 1 .453 1 1v4zM9 7H5v2h4V7zm2 6v2h1v-2h2v-1h-2c-.547 0-1 .453-1 1zm1-10V1h-1v2c0 .547.453 1 1 1h2V3h-2z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createSearchIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M15.7 13.3l-3.81-3.83A5.93 5.93 0 0 0 13 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 0 0 0-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createSettingsIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M4 7H3V2h1v5zm-1 7h1v-3H3v3zm5 0h1V8H8v6zm5 0h1v-2h-1v2zm1-12h-1v6h1V2zM9 2H8v2h1V2zM5 8H2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm5-3H7c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm5 4h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export const createShareIcon = (...args) => createPublicShareIcon(...args);

export function createSignInIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M7 6.75V12h4V8h1v4c0 .55-.45 1-1 1H7v3l-5.45-2.72c-.33-.17-.55-.52-.55-.91V1c0-.55.45-1 1-1h9c.55 0 1 .45 1 1v3h-1V1H3l4 2v2.25L10 3v2h4v2h-4v2L7 6.75z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createSignOutIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M11.992 8.994V6.996H7.995v-2h3.997V2.999l3.998 2.998-3.998 2.998zm-1.998 2.998H5.996V2.998L2 1h7.995v2.998h1V1c0-.55-.45-.999-1-.999H.999A1.001 1.001 0 0 0 0 1v11.372c0 .39.22.73.55.91L5.996 16v-3.008h3.998c.55 0 1-.45 1-1V7.996h-1v3.998z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export const createSignUpIcon = (...args) => createContactNewIcon(...args);

export function createSpinnerIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	const height = 12.837;
	const width = 26.263;
	const rx = 6.4187;
	const ry = rx;

	return createSVG({
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		viewBox: [0, 0, 106.82, 106.82],
		children: [
			createGroup({
				transform: translate(-73.591, -148.34),
				children: [
					createRect({ height, width, rx, ry, x: 154.15,  y: 195.33,                                            }),
					createRect({ height, width, rx, ry, x: 36.256,  y: 231.8,   transform: rotate(-30),                   }),
					createRect({ height, width, rx, ry, x: -84.075, y: 204.44,  transform: rotate(-60), opacity: 0.0833,  }),
					createRect({ height, width, rx, ry, x: -174.6,  y: 120.58,  transform: rotate(-90), opacity: 0.16666, }),
					createRect({ height, width, rx, ry, x: -211.07, y: 2.6915,  transform: rotate(240), opacity: 0.25,    }),
					createRect({ height, width, rx, ry, x: -183.71, y: -117.64, transform: rotate(210), opacity: 0.3333,  }),
					createRect({ height, width, rx, ry, x: -99.854, y: -208.17, transform: rotate(180), opacity: 0.4166,  }),
					createRect({ height, width, rx, ry, x: 18.035,  y: -244.64, transform: rotate(150), opacity: 0.5,     }),
					createRect({ height, width, rx, ry, x: 138.37,  y: -217.28, transform: rotate(120), opacity: 0.5833,  }),
					createRect({ height, width, rx, ry, x: 228.9,   y: -133.42, transform: rotate(90),  opacity: 0.6666,  }),
					createRect({ height, width, rx, ry, x: 265.37,  y: -15.529, transform: rotate(60),  opacity: 0.75,    }),
					createRect({ height, width, rx, ry, x: 238.01,  y: 104.8,   transform: rotate(30),  opacity: 0.8333,  }),
				]
			})
		],
	});
}

export function createSyncIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M10.24 7.4a4.15 4.15 0 0 1-1.2 3.6 4.346 4.346 0 0 1-5.41.54L4.8 10.4.5 9.8l.6 4.2 1.31-1.26c2.36 1.74 5.7 1.57 7.84-.54a5.876 5.876 0 0 0 1.74-4.46l-1.75-.34zM2.96 5a4.346 4.346 0 0 1 5.41-.54L7.2 5.6l4.3.6-.6-4.2-1.31 1.26c-2.36-1.74-5.7-1.57-7.85.54C.5 5.03-.06 6.65.01 8.26l1.75.35A4.17 4.17 0 0 1 2.96 5z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createSystemSoftwareInstallIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M3 8h10v7.059c0 .492-.472.937-.996.937H4c-.539 0-1-.43-1-1z', {
				'overflow': 'visible',
			}),
			createPath('M6.688 2.969a1 1 0 0 0-.657.375L3.22 6.812a1 1 0 0 0-.22.625v1a1 1 0 1 0 2 0v-.656l2.594-3.156a1 1 0 0 0-.907-1.656zm2.218 3a1 1 0 1 0-.031 2l2.156.375V8.5a1 1 0 1 0 2 0v-1a1 1 0 0 0-.812-1l-3-.5a1 1 0 0 0-.313-.031z', {
				'overflow': 'visible',
			})
		]
	});
}

export function createTagIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: parseInt(14 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M7.685 1.72a2.49 2.49 0 0 0-1.76-.726H3.48A2.5 2.5 0 0 0 .994 3.48v2.456c0 .656.269 1.292.726 1.76l6.024 6.024a.99.99 0 0 0 1.402 0l4.563-4.563a.99.99 0 0 0 0-1.402L7.685 1.72zM2.366 7.048A1.54 1.54 0 0 1 1.9 5.925V3.48c0-.874.716-1.58 1.58-1.58h2.456c.418 0 .825.159 1.123.467l6.104 6.094-4.702 4.702-6.094-6.114zm.626-4.066h1.989v1.989H2.982V2.982h.01z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createThumbsUpIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M13.991 13.991c-.05.69-1.269 1-1.998 1H5.666l-1.668-1V7.995c1.359 0 2.108-.75 3.128-1.879 1.229-1.359 1.139-2.558.879-4.127-.08-.5.5-1 1-1 .829 0 1.998 2.729 1.998 3.998l-.02 1.03c0 .689.33.969 1.02.969H14c.63 0 .98.36 1 .999l-1 5.996-.01.01zm0-7.995h-2.018l.02-.98C11.993 3.719 10.823 0 8.994 0c-.58 0-1.169.3-1.559.77-.36.41-.5.909-.42 1.409.25 1.479.28 2.278-.629 3.278-1 1.089-1.48 1.549-2.388 1.549h-2C.94 6.996 0 7.935 0 8.994v3.998c0 1.06.94 1.999 1.999 1.999h1.719l1.439.86c.16.089.33.139.52.139h6.325c1.13 0 2.839-.5 2.999-1.879l.979-5.946c.02-.08.02-.14.02-.2-.03-1.17-.84-1.969-1.999-1.969h-.01z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createThumbsDownIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M15.97 7.825L15 1.88C14.83.499 13.123 0 11.994 0H5.686c-.2 0-.38.05-.53.14L3.719 1h-1.72C.94 1 0 1.938 0 2.997v3.998c0 1.059.94 2.018 1.999 1.998h1.999c.909 0 1.389.45 2.388 1.55.91.999.88 1.798.63 3.267-.08.5.06 1 .42 1.42.39.47.979.769 1.558.769 1.83 0 2.999-3.718 2.999-5.017l-.02-.98h2.038c1.16 0 1.949-.799 1.979-1.968 0-.06.02-.13-.02-.2v-.01zm-1.969 1.19h-1.989c-.7 0-1.029.28-1.029.969l.03 1.03c0 1.268-1.17 3.997-1.999 3.997-.5 0-1.079-.5-.999-1 .25-1.579.34-2.778-.89-4.137-1.019-1.13-1.768-1.879-3.127-1.879V1.999l1.668-1h6.327c.729 0 1.948.31 1.998 1l.02.02 1 5.996c-.03.64-.38 1-1 1h-.01z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createToolsIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M4.48 7.27c.26.26 1.28 1.33 1.28 1.33l.56-.58-.88-.91 1.69-1.8s-.76-.74-.43-.45c.32-1.19.03-2.51-.87-3.44C4.93.5 3.66.2 2.52.51l1.93 2-.51 1.96-1.89.52-1.93-2C-.19 4.17.1 5.48 1 6.4c.94.98 2.29 1.26 3.48.87zm6.44 1.94l-2.33 2.3 3.84 3.98c.31.33.73.49 1.14.49.41 0 .82-.16 1.14-.49.63-.65.63-1.7 0-2.35l-3.79-3.93zM16 2.53L13.55 0 6.33 7.46l.88.91-4.31 4.46-.99.53-1.39 2.27.35.37 2.2-1.44.51-1.02L7.9 9.08l.88.91L16 2.53z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createTrashCanIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 14, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createXIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 12, 16],
		...rest, height: size, width: parseInt(12 * (size / 16)), fill, classList, part, slot, animation,
		children: [
			createPath('M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z', {
				'fill-rule': 'evenodd',
			})
		]
	});
}

export function createZoomInIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M3.19 2c-.663 0-1.188.549-1.188 1.219v9.562c0 .67.525 1.22 1.188 1.22h9.625c.663 0 1.187-.55 1.187-1.22V3.22c0-.67-.524-1.219-1.187-1.219zm3.812 3h2v2h2v2h-2v2h-2V9h-2V7h2z')
		]
	});
}

export function createZoomOutIcon({
	size = 16,
	fill = 'currentColor',
	classList = [],
	part = [],
	slot,
	animation,
	...rest
} = {}) {
	return createSVG({
		viewBox: [0, 0, 16, 16],
		...rest, height: size, width: size, fill, classList, part, slot, animation,
		children: [
			createPath('M3.19 2c-.663 0-1.188.549-1.188 1.219v9.562c0 .67.525 1.22 1.188 1.22h9.625c.663 0 1.187-.55 1.187-1.22V3.22c0-.67-.524-1.219-1.187-1.219zm1.812 5h6v2h-6z')
		]
	});
}
