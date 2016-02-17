import {handleJSON} from './json_response.es6';
import {parseResponse, reportError} from './functions.es6';

export default function popState() {
	window.addEventListener('popstate', event => {
		fetch(location).then(parseResponse).then(handleJSON).catch(reportError);
	});
}
