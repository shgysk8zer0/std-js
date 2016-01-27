import {default as escapeShim} from './escape.es6';
import {default as supportsShim} from './supports.es6';
export default () => {
	escapeShim();
	supportsShim();
}
