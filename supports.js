export function supports(type) {
	/*Feature detection. Returns boolean value of suport for type*/
	/**
	* A series of tests to determine support for a given feature
	* Defaults to testing support for an element of tag (type)
	* Which works by testing if the browser considers it unknown element type
	*/
	if (typeof type !== 'string') {
		return false;
	}

	try {
		switch (type.toLowerCase()) {
		case 'js-animate':
			return HTMLElement.prototype.hasOwnProperty('animate');

		case 'queryselectorall':
			return ('querySelectorAll' in document);

		case 'svg':
			return (document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Shape', '1.1'));

		case 'dataset':
			return ('DOMStringMap' in window);

		case 'htmlimports':
			return ('import' in document.createElement('link'));

		case 'geolocation':
			return ('geolocation' in navigator);

		case 'connectivity':
			return ('onLine' in navigator);

		case 'visibility':
			return ('visibilityState' in document) || ('webkitVisibilityState' in document);

		case 'validity':
			return ('validity' in document.createElement('input'));

		case 'fonts':
			return ('CSSFontFaceRule' in window);

		case 'csssupports':
			return (('CSS' in window) && ('supports' in CSS));

		case 'listeners':
			return ('addEventListener' in window);

		case 'css-animations':
			return ((supports('csssupports')
					&& (CSS.supports('animation', 'name')
					|| CSS.supports('-webkit-animation', 'name'))
			)
					|| 'animation' in document.body.style
					|| 'webkitAnimation' in document.body.style
			);

		case 'transitions':
			return ((supports('csssupports')
				&& (CSS.supports('transition', 'none')
					|| CSS.supports('-webkit-transition', 'none'))
			)
				|| 'transition' in document.body.style
				|| 'webkitTransition' in document.body.style
			);

		case 'cssgradients':
			return (supports('csssupports')
					&& CSS.supports('background-image', 'linear-gradient(red,red)'))
					|| (function() {
						var el = document.createElement('a');
						el.style.backgroundImage = 'linear-gradient(red, red)';
						return (!!el.style.backgroundImage);
					})();

		case 'notifications':
			return ('notifications' in window || 'Notification' in window);

		case 'applicationcache':
			return ('applicationCache' in window);

		case 'indexeddb':
			return ('indexedDB' in window);

		case 'fullscreen':
			return ('cancelFullScreen' in document);

		case 'workers':
			return ('Worker' in window);

		case 'promises':
			return ('Promise' in window);

		case 'cssmatches':
			return ('sessionStorage' in window && sessionStorage.hasOwnProperty('MatchesPre')) ||
				[':matches', ':any', ':-moz-any', ':-webkit-any'].some(pre => {
					try {
						if (document.querySelector(`${pre}(body)`) === document.body) {
							sessionStorage.setItem('MatchesPre', pre);
							return true;
						} else {
							return false;
						}
					} catch (e) {
						return false;
					}
				});

		case 'ajax':
			return ('XMLHttpRequest' in window);

		case 'cssvars':
			return (supports('csssupports') && CSS.supports('--x', 'x'));

		case 'formdata':
			return ('FormData' in window);

		case 'classlist':
			return ('DOMTokenList' in window);

		case 'localstorage':
			return ('localStorage' in window);

		case 'sessionstorage':
			return ('sessionStorage' in window);

		default:
			return ! (document.createElement(type) instanceof HTMLUnknownElement);
		}
	} catch(e) {
		return false;
	}
}
export function supportsAsClasses(...feats) {
	if (feats instanceof Array) {
		feats.forEach(feat => {
			supports(feat)
				? document.documentElement.classList.add(feat)
				: document.documentElement.classList.add(`no-${feat}`);
		});
	}
}
