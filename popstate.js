import handleJSON from './json_response.js';
import {parseResponse, reportError} from './functions.js';

function popStateHandler() {
	fetch(location).then(parseResponse).then(handleJSON).catch(reportError);
}

export default function popState() {
	window.addEventListener('popstate', popStateHandler);
}
