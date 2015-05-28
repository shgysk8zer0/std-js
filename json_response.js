function handleJSON(json) {
	if(typeof json === 'string') {
		json = JSON.parse(json.trim());
	} else if(typeof json !== 'object') {
		return false;
	}
	if ('remove' in json) {
		document.querySelectorAll(json.remove).forEach(function(el)
		{
			el.parentElement.removeChild(el);
		});
	}
	if('text' in json) {
		Object.keys(json.text).forEach(function(key)
		{
			document.querySelector(key).textContent = json.text[key];
		});
	}
	if('html' in json) {
		Object.keys(json.html).forEach(function(key)
		{
			document.querySelector(key).innerHTML = json.html[key];
		});
	}
	if('after' in json) {
		Object.keys(json.after).forEach(function(key)
		{
			document.querySelector(key).insertAdjacentHTML('afterend', json.after[key]);
		});
	}
	if('before' in json) {
		Object.keys(json.before).forEach(function(key)
		{
			document.querySelector(key).insertAdjacentHTML('beforebegin', json.before[key]);
		});
	}
	if('append' in json) {
		Object.keys(json.append).forEach(function(key)
		{
			document.querySelector(key).insertAdjacentHTML('beforeend', json.append[key]);
		});
	}
	if('prepend' in json) {
		Object.keys(json.prepend).forEach(function(key)
		{
			document.querySelector(key).insertAdjacentHTML('afterbegin', json.prepend[key]);
		});
	}
	if('addClass' in json) {
		Object.keys(json.addClass).forEach(function(selector)
		{
			document.querySelectorAll(selector).forEach(function(el)
			{
				json.addClass[selector].split(',').forEach(function(cname)
				{
					el.classList.add(cname);
				});
			});
		});
	}
	if('removeClass' in json) {
		Object.keys(json.removeClass).forEach(function(selector)
		{
			document.querySelectorAll(selector).forEach(function(el)
			{
				json.removeClass[selector].split(',').forEach(function(cname)
				{
					el.classList.remove(cname);
				});
			});
		});
	}
	if('attributes' in json) {
		Object.keys(json.attributes).forEach(function(selector)
		{
			document.querySelectorAll(selector).forEach(function(el)
			{
				Object.keys(json.attributes[selector]).forEach(function(attribute)
				{
					if(typeof json.attributes[selector][attribute] === 'boolean') {
						(json.attributes[selector][attribute]) ? el.setAttribute(attribute, '') : el.removeAttribute(attribute);
					}
					else {
						(attribute in el) ? el[attribute] = json.attributes[selector][attribute] : el.setAttribute(attribute, json.attributes[selector][attribute]);
					}
				});
			});
		});
	}
	if('increment' in json) {
		Object.keys(json.increment).forEach(function(selector)
		{
			var el = document.querySelector(selector);
			Object.keys(json.increment[selector]).forEach(function(attribute)
			{
				if(attribute in el) {
					el[attribute] += json.increment[selector][attribute]
				}
				else {
					el.setAttribute(attribute, parseFloat(el.getAttribute(attribute) + json.increment[selector][attribute]));
				}
			});
		})
	}
	if('stepUp' in json) {
		Object.keys(json.stepUp).forEach(function(selector)
		{
			document.querySelectorAll(selector).forEach(function(el)
			{
				el.stepUp(json.stepUp[selector]);
			});
		});
	}
	if('stepDown' in json) {
		Object.keys(json.stepDown).forEach(function(selector)
		{
			document.querySelectorAll(selector).forEach(function(el)
			{
				el.stepDown(json.stepDown[selector]);
			});
		});
	}
	if('style' in json) {
		Object.keys(json.style).forEach(function(sel)
		{
			document.querySelectorAll(sel).forEach(function(el)
			{
				Object.keys(json.style[sel]).forEach(function(prop)
				{
					el.style[prop.camelCase()] = json.style[sel][prop];
				});
			});
		});
	}
	if('dataset' in json) {
		Object.keys(json.dataset).forEach(function(sel)
		{
			document.querySelectorAll(sel).forEach(function(el)
			{
				Object.keys(json.dataset[sel]).forEach(function(prop)
				{
					el.data(prop, json.dataset[sel][prop]);
				});
			});
		});
	}
	if('sessionStorage' in json) {
		Object.keys(json.sessionStorage).forEach(function(key)
		{
			(json.sessionStorage[key] === '') ? sessionStorage.removeItem(key) : sessionStorage.setItem(key, json.sessionStorage[key]);
		});
	}
	if('localStorage' in json) {
		Object.keys(json.localStorage).forEach(function(key)
		{
			(json.localStorage[key] === '') ? sessionStorage.removeItem(key) : localStorage.setItem(key, json.localStorage[key]);
		});
	}
	if ('notify' in json) {
		notify(json.notify);
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
	if('clear' in json) {
		document.forms[json.clear].reset();
	}
	if('open' in json) {
		var specs = [];
		json.open.specs.keys().forEach(function(spec)
		{
			specs.push(spec + '=' + json.open.specs[spec]);
		});
		window.open(json.open.url, '_blank', specs.join(','), json.open.replace);
	}
	if('show' in json) {
		document.querySelectorAll(json.show).forEach(function(el)
		 {
			el.show();
		});
	}
	if('showModal' in json) {
		document.querySelector(json.showModal).showModal();
	}
	if('close' in json) {
		document.querySelectorAll(json.close).forEach(function(el)
		{
			el.close();
		});
	}
	if('triggerEvent' in json) {
		Object.keys(json.triggerEvent).forEach(function(selector)
		{
			document.querySelectorAll(selector).forEach(function(target)
			{
				var event = json.triggerEvent[selector].toLowerCase();
				if(event === 'click') {
					target.dispatchEvent(new MouseEvent(event));
				} else {
					target.dispatchEvent(new Event(event));
				}
			});
		});
	}
	if('serverEvent' in json) {
		var serverEvent = new EventSource(json.serverEvent);
		serverEvent.addEventListener('ping', function(event)
		{
			handleJSON(JSON.parse(event.data));
		});
		serverEvent.addEventListener('close', function(event)
		{
			serverEvent.close();
			handleJSON(JSON.parse(event.data));
		});
		serverEvent.addEventListener('error', function(error)
		{
			console.error(new Error(error));
			console.error(error);
		});
	}
}
