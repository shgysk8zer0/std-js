import {default as copyWithinShim} from './copyWithin.es6';
import {default as everyShim} from './every.es6';
import {default as fillShim} from './fill.es6';
import {default as filterShim} from './filter.es6';
import {default as findShim} from './find.es6';
import {default as findIndexShim} from './findIndex.es6';
import {default as forEachShim} from './forEach.es6';
import {default as fromShim} from './from.es6';
import {default as includesShim} from './includes.es6';
import {default as indexOfShim} from './indexOf.es6';
import {default as lastIndexOfShim} from './lastIndexOf.es6';
import {default as mapShim} from './map.es6';
import {default as ofShim} from './of.es6';
import {default as reduceShim} from './reduce.es6';
import {default as reduceRightShim} from './reduceRight.es6';
import {default as someShim} from './some.es6';

export default () => {
	copyWithinShim();
	everyShim();
	fillShim();
	filterShim();
	findShim();
	findIndexShim();
	forEachShim();
	fromShim();
	includesShim();
	indexOfShim();
	lastIndexOfShim();
	mapShim();
	ofShim();
	reduceShim();
	reduceRightShim();
	someShim();
}
