const REQUIRED = [
	'@type',
	'@context'
];

const TIMES = [
	'closes',
	'opens'
];

const DATES = [
	'birthDate',
	'commentTime',
	'dateCreated',
	'dateModified',
	'datePosted',
	'datePublished',
	'dateVehicleFirstRegistered',
	'deathDate',
	'dissolutionDate',
	'endDate',
	'expires',
	'foundingDate',
	'lastReviewed',
	'previousStartDate',
	'priceValidUntil',
	'productionDate',
	'purchaseDate',
	'releaseDate',
	'scheduledPaymentDate',
	'startDate',
	'uploadDate',
	'validUntil',
	'vehicleModelDate'
];

export default class SchemaData extends Map {
	constructor(data) {
		if (! (typeof data === 'object')) {
			throw new Error(`Expected an object but received a ${typeof data}`);
		} else if (! REQUIRED.every(key => data.hasOwnProperty(key))) {
			const missing = REQUIRED.filter(key => !data.hasOwnProperty(key));
			throw new Error('SchemaData argument object is missing required properties', missing);
		} else {
			super();
			Object.keys(data).forEach(key => {
				if (DATES.includes(key) || TIMES.includes(key)) {
					this.set(key, new Date(data[key]));
				} else {
					this.set(key, data[key]);
				}
			});
		}
	}

	toString() {
		return JSON.stringify(this);
	}

	get type() {
		return this.get('@type');
	}

	get context() {
		return this.get('@context');
	}

	get itemtype() {
		return new URL(this.type, this.context).toString();
	}
}
