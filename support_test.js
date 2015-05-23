
function supports(type) {
	/*Feature detection. Returns boolean value of suport for type*/
	/**
	* A series of tests to determine support for a given feature
	* Defaults to testing support for an element of tag (type)
	* Which works by testing if the browser considers it unknown element type
	*/
	if (typeof type !== 'string') {
		return false;
	}

	switch (type.toLowerCase()) {
		case 'queryselectorall':
			return ('querySelectorAll' in document);
			break;

		case 'svg':
			return (document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Shape', '1.1'));
			break;

		case 'dataset':
			return ('DOMStringMap' in window);
			break;

		case 'htmlimports':
			return ('import' in document.createElement('link'));
			break;

		case 'geolocation':
			return ('geolocation' in navigator);
			break;

		case 'connectivity':
			return ('onLine' in navigator);
			break;

		case 'visibility':
			return ('visibilityState' in document) || ('webkitVisibilityState' in document);
			break;

		case 'validity':
			return ('validity' in document.createElement('input'));
			break;

		case 'fonts':
			return ('CSSFontFaceRule' in window);
			break;

		case 'csssupports':
			return ('supports' in CSS);
			break;

		case 'listeners':
			return ('addEventListener' in window);
			break;

		case 'animations':
			return ((('supports' in CSS) && CSS.supports('animation', 'name') ||
				CSS.supports('-webkit-animation', 'name')) ||
				'animation' in document.body.style ||
				'webkitAnimation' in document.body.style
			);
			break;

		case 'transitions':
			return ((('supports' in CSS) && CSS.supports('transition', 'none') ||
				CSS.supports('-webkit-transition', 'none')) ||
				'transition' in document.body.style ||
				'webkitTransition' in documnt.body.style
			);
			break;

		case 'cssgradients':
			return (('supports' in CSS) && CSS.supports('background-image', 'linear-gradient(red,red)')) || (function() {
				var el = document.createElement('a');
				el.style.backgroundImage = 'linear-gradient(red, red)';
				return (!!el.style.backgroundImage);
			})();
			break;

		case 'notifications':
			return ('notifications' in window || 'Notification' in window);
			break;

		case 'applicationcache':
			return ('applicationCache' in window);
			break;

		case 'indexeddb':
			return ('indexedDB' in window);
			break;

		case 'fullscreen':
			return ('cancelFullScreen' in document);
			break;

		case 'workers':
			return ('Worker' in window);
			break;

		case 'promises':
			return ('Promise' in window);
			break;

		case 'cssmatches':
			return ('sessionStorage' in window && sessionStorage.hasOwnProperty('MatchesPre')) ||
			[':matches', ':any', ':-moz-any', ':-webkit-any'].some(function (pre) {
				try {
					if (document.querySelector(pre + '(body)') === document.body) {
						sessionStorage.setItem('MatchesPre', pre);
						return true;
					} else {
						return false;
					};
				} catch (e) {
					return false;
				}
			});
			break;

		case 'ajax':
			return ('XMLHttpRequest' in window);
			break;

		case 'cssvars':
			return (('supports' in CSS) && CSS.supports('--x','x'));
			break;

		case 'formdata':
			return ('FormData' in window);
			break;

		case 'classlist':
			return ('DOMTokenList' in window);
			break;

		case 'localstorage':
			return ('localStorage' in window);
			break;

		case 'sessionstorage':
			return ('sessionStorage' in window);
			break;

		default:
			return (document.createElement(type.toLowerCase()) .toString() !== document.createElement('DNE') .toString());
	}
}
