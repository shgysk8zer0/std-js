import {default as closeShim} from './close.es6';
import {default as closestShim} from './closest.es6';
import {default as datasetShim} from './dataset.es6';
import {default as matchesShim} from './matches.es6';
import {default as querySelectorAllShim} from './queryselectorall.es6';
import {default as removeShim} from './remove.es6';
import {default as showShim} from './show.es6';
import {default as showModalShim} from './showModal.es6';
export default () => {
	closeShim();
	closestShim();
	datasetShim();
	matchesShim();
	querySelectorAllShim();
	removeShim();
	showShim();
	showModalShim();
}
