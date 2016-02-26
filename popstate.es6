import {handleJSON} from './json_response.es6';
import {parseResponse, reportError} from './functions.es6';

function popStateHandler(event) {
	fetch(location).then(parseResponse).then(handleJSON).catch(reportError);
}

export default function popState() {
	window.addEventListener('popstate', popStateHandler);
}
