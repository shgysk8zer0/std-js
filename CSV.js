export function parse(str, {
	nl = '\n',
	depth = Number.MAX_SAFE_INTEGER,
	// delimeter = ',',
	// enclosure = '"',
} = {}) {
	if (typeof str !== 'string' || str.length === 0) {
		throw new TypeError('Parsing CSV requires a non-empty string');
	} else if (typeof nl !== 'string' || nl.length == 0) {
		throw new TypeError('Newline character must be a string');
	}

	return str.split(nl, depth)
		.map(row => row.trim().split(',')
			.map(c => {
				c = c.trim();
				if (c.startsWith('"') && c.endsWith('"')) {
					c = c.substr(1, c.length - 2);
				}
				return c.replaceAll('\\"', '"');
			}));
}

export function toTable(rows) {
	if (! Array.isArray(rows)) {
		throw new TypeError('rows must be an array');
	}

	return rows.reduce((table, row) => {
		if (! Array.isArray(row)) {
			throw new TypeError('row must be an array');
		}
		const tBody = table.tBodies.item(0) || table.createTBody();
		const tr = document.createElement('tr');
		tr.append(...row.map(cell => {
			const td = document.createElement('td');
			td.textContent = cell;
			return td;
		}));
		tBody.append(tr);
		return table;
	}, document.createElement('table'));
}

export function stringify(data) {
	if (! Array.isArray(data)) {
		throw new TypeError('CSV.stringify only accepts arrays');
	}
	return data.map(row => {
		return row.map(cell => `"${cell.replace(/"/, '\\"')}"`).join(',');
	}).join('\n');
}
