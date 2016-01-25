import {default as $} from './zq.es6';
import {handleJSON} from './json_response.es6';
import {parseResponse, reportError} from './functions.es6';
export default function popState() {
	$(self).popstate(() => {
		'use strict';
		fetch(location).then(parseResponse).then(handleJSON).catch(reportError);
	});
}
