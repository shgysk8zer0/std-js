import {notify, query as $} from './functions.es6';

export default function handleJSON(json) {
	if(typeof json === 'string') {
		json = JSON.parse(json.trim());
	} else if(typeof json !== 'object') {
		return false;
	}
	if('text' in json) {
		Object.keys(json.text).forEach(key => {
			document.querySelector(key).textContent = json.text[key];
		});
	}
	if('html' in json) {
		Object.keys(json.html).forEach(key => {
			document.querySelector(key).innerHTML = json.html[key];
		});
	}
	if('after' in json) {
		Object.keys(json.after).forEach(key => {
			document.querySelector(key).insertAdjacentHTML('afterend', json.after[key]);
		});
	}
	if('before' in json) {
		Object.keys(json.before).forEach(key => {
			document.querySelector(key).insertAdjacentHTML('beforebegin', json.before[key]);
		});
	}
	if('append' in json) {
		Object.keys(json.append).forEach(key => {
			document.querySelector(key).insertAdjacentHTML('beforeend', json.append[key]);
		});
	}
	if('prepend' in json) {
		Object.keys(json.prepend).forEach(key => {
			document.querySelector(key).insertAdjacentHTML('afterbegin', json.prepend[key]);
		});
	}
	if('addClass' in json) {
		Object.keys(json.addClass).forEach(selector => {
			$(selector).forEach(el => {
				json.addClass[selector].split(',').forEach(cname => {
					el.classList.add(cname);
				});
			});
		});
	}
	if('removeClass' in json) {
		Object.keys(json.removeClass).forEach(selector => {
			$(selector).forEach(el => {
				json.removeClass[selector].split(',').forEach(cname => {
					el.classList.remove(cname);
				});
			});
		});
	}
	if('attributes' in json) {
		Object.keys(json.attributes).forEach(selector => {
			$(selector).forEach(el => {
				Object.keys(json.attributes[selector]).forEach(attribute => {
					if(typeof json.attributes[selector][attribute] === 'boolean') {
						(json.attributes[selector][attribute])
							? el.setAttribute(attribute, '')
							: el.removeAttribute(attribute);
					} else {
						el.setAttribute(attribute, json.attributes[selector][attribute]);
					}
				});
			});
		});
	}
	if('increment' in json) {
		Object.keys(json.increment).forEach(selector => {
			let el = document.querySelector(selector);
			Object.keys(json.increment[selector]).forEach(attribute => {
				if(attribute in el) {
					el[attribute] += json.increment[selector][attribute];
				} else {
					el.setAttribute(attribute, parseFloat(el.getAttribute(attribute) + json.increment[selector][attribute]));
				}
			});
		});
	}
	if('stepUp' in json) {
		Object.keys(json.stepUp).forEach(selector => {
			$(selector).forEach(el => {
				el.stepUp(json.stepUp[selector]);
			});
		});
	}
	if('stepDown' in json) {
		Object.keys(json.stepDown).forEach(selector => {
			$(selector).forEach(el => {
				el.stepDown(json.stepDown[selector]);
			});
		});
	}
	if('style' in json) {
		Object.keys(json.style).forEach(sel => {
			$(sel).forEach(el => {
				Object.keys(json.style[sel]).forEach(prop => {
					el.style[prop.camelCase()] = json.style[sel][prop];
				});
			});
		});
	}
	if('dataset' in json) {
		Object.keys(json.dataset).forEach(sel => {
			$(sel).forEach(el => {
				Object.keys(json.dataset[sel]).forEach(prop => {
					el.dataset[prop] = json.dataset[sel][prop];
				});
			});
		});
	}
	if('sessionStorage' in json) {
		Object.keys(json.sessionStorage).forEach(key => {
			(json.sessionStorage[key] === '')
				? sessionStorage.removeItem(key)
				: sessionStorage.setItem(key, json.sessionStorage[key]);
		});
	}
	if('localStorage' in json) {
		Object.keys(json.localStorage).forEach(key => {
			(json.localStorage[key] === '')
				? sessionStorage.removeItem(key)
				: localStorage.setItem(key, json.localStorage[key]);
		});
	}
	if('script' in json) {
		eval(json.script);
	}
	if('log' in json) {
		console.log(json.log);
	}
	if('table' in json) {
		('table' in console) ? console.table(json.table) : console.log(json.table);
	}
	if('dir' in json) {
		('dir' in console) ? console.dir(json.dir) : console.log(json.dir);
	}
	if('info' in json) {
		console.info(json.info);
	}
	if('warn' in json) {
		console.log(json.warn);
	}
	if('error' in json) {
		console.error(json.error);
	}
	if('scrollTo' in json) {
		document.querySelectorAll(json.scrollTo.sel).item(json.scrollTo.nth).scrollIntoView();
	}
	if('focus' in json) {
		document.querySelector(json.focus).focus();
	}
	if('select' in json) {
		document.querySelector(json.select).select();
	}
	if('reload' in json) {
		window.location.reload();
	}
	if(('clear' in json) && (json.clear in document.forms)) {
		document.forms[json.clear].reset();
	}
	if('open' in json) {
		let specs = [];
		if(typeof json.open.specs !== 'object') {
			json.open.specs = {};
		}
		Object.keys(json.open.specs).forEach(spec => {
			specs.push(`${spec}=${json.open.specs[spec]}`);
		});
		window.open(json.open.url, '_blank', specs.join(','), json.open.replace);
	}
	if('show' in json) {
		$(json.show).forEach(el => {
			el.show();
		});
	}
	if('showModal' in json) {
		document.querySelector(json.showModal).showModal();
	}
	if (('animate' in json) && ('animate' in Element.prototype)) {
		Object.keys(json.animate).forEach(sel => {
			try {
				let els = Array.from(document.querySelectorAll(sel));
				els.forEach(el => {
					el.animate(json.animate[sel].keyframes, json.animate[sel].opts);
				});
			} catch (err) {
				console.error(err);
			}
		});
	}
	if('close' in json) {
		$(json.close).forEach(el => {
			el.close();
		});
	}
	if ('remove' in json) {
		$(json.remove).forEach(el => {
			el.remove();
		});
	}
	if('triggerEvent' in json) {
		Object.keys(json.triggerEvent).forEach(selector => {
			$(selector).forEach(target => {
				let event = json.triggerEvent[selector].toLowerCase();
				if(event === 'click') {
					target.dispatchEvent(new MouseEvent(event));
				} else {
					target.dispatchEvent(new Event(event));
				}
			});
		});
	}
	if('serverEvent' in json) {
		let serverEvent = new EventSource(json.serverEvent);
		serverEvent.addEventListener('ping', event => {
			handleJSON(JSON.parse(event.data));
		});
		serverEvent.addEventListener('close', event => {
			serverEvent.close();
			handleJSON(JSON.parse(event.data));
		});
		serverEvent.addEventListener('error', error => {
			console.error(new Error(error));
			console.error(error);
		});
	}
	if ('notify' in json) {
		notify(json.notify);
	}
}
