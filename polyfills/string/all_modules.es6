import {default as endsWithShim} from './endsWith.es6';
import {default as includesShim} from './includes.es6';
import {default as startsWithShim} from './startsWith.es6';
export default () => {
	endsWithShim();
	includesShim();
	startsWithShim();
}
