const pattern = /\d{2}-\d{2}-\d{1,4}/;

const Months = [
	{abbr: 'Jan', full: 'January'},
	{abbr: 'Feb', full: 'February'},
	{abbr: 'Mar', full: 'March'},
	{abbr: 'Apr', full: 'April'},
	{abbr: 'May', full: 'May'},
	{abbr: 'June', full: 'June'},
	{abbr: 'July', full: 'July'},
	{abbr: 'Aug', full: 'August'},
	{abbr: 'Sep', full: 'September'},
	{abbr: 'Oct', full: 'October'},
	{abbr: 'Nov', full: 'November'},
	{abbr: 'Dec', full: 'December'}
];

const Days = [
	{abbr: 'Sun', full: 'Sunday'},
	{abbr: 'Mon', full: 'Monday'},
	{abbr: 'Tue', full: 'Tuesday'},
	{abbr: 'Wed', full: 'Wednesday'},
	{abbr: 'Thu', full: 'Thursday'},
	{abbr: 'Fri', full: 'Friday'},
	{abbr: 'Sat', full: 'Saturday'}
];

function fillCalendar(calendar, table, input = false) {
	let cell = 0;
	let week = 0;

	table.querySelectorAll('tbody > tr').forEach(row => row.remove());
	table.insertRow();

	while (cell < calendar.getDay()) {
		cell++;
		table.rows.item(week).appendChild(document.createElement('td'));
	}

	for (const [n, day] of calendar.entries()) {
		const td = document.createElement('td');
		const time = document.createElement('time');

		if (n !== 1 && day.dow === 0) {
			table.insertRow();
			week++;
		}

		time.dateTime = day.dateTime;
		time.textContent = n;
		td.appendChild(time);
		table.rows.item(week).appendChild(td);
	}

	if (input) {
		table.querySelectorAll('time[datetime]').forEach(date => {
			date.addEventListener('click', click => {
				input.value = click.target.dateTime;
				table.closest('dialog').close();
			});
		});
	}
}

function datetime(date) {
	const y = date.getFullYear();
	const m = (date.getMonth() + 1).toString().padStart(2, '0');
	const d = date.getDate().toString().padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export default class Calendar extends Date {

	toString() {
		return `${this.year} ${this.fullMonth}`;
	}

	get length() {
		let date = new Date(this.getFullYear(), this.getMonth() + 1);
		date.setDate(0);
		return date.getDate();
	}

	get datetime() {
		return datetime(this);
	}

	get year() {
		return `${this.getFullYear()}`;
	}

	get month() {
		return Months[this.getMonth()].abbr;
	}

	get fullMonth() {
		return Months[this.getMonth()].full;
	}

	get monthNum() {
		return `${this.getMonth() + 1}`;
	}

	get table() {
		const table = document.createElement('table');

		table.createCaption();
		table.caption.textContent = `${this.month} ${this.year}`;
		table.createTHead();

		Days.forEach(day => {
			const cell = document.createElement('th');
			cell.textContent = day.abbr;
			table.tHead.append(cell);
		});

		fillCalendar(this, table);
		return table;
	}

	static set pickerFor(input) {
		const dialog = document.createElement('dialog');
		const month = document.createElement('select');
		const year = document.createElement('input');
		const next = document.createElement('button');
		const prev = document.createElement('button');
		const calendar = new Calendar(pattern.test(input.value) ? input.value : null);
		const cal = calendar.table;
		const table = document.createElement('table');

		input.pattern = pattern;
		input.type = 'text';

		table.createCaption();
		table.caption.textContent = `${this.month} ${this.year}`;
		table.createTHead();
		table.border = 1;

		Days.forEach(day => {
			const cell = document.createElement('th');
			cell.textContent = day.abbr;
			table.tHead.append(cell);
		});

		prev.textContent = '<';
		next.textContent = '>';
		next.type = 'button';
		prev.type = 'button';

		cal.caption.textContent = '';
		cal.caption.append(prev, ' ', month, ' ', year, ' ', next);

		year.value = calendar.getFullYear();
		year.type = 'number';
		year.min = 1;
		year.style.width = '5em';

		Months.forEach((m, i) => {
			const opt = document.createElement('option');
			opt.value = i;
			opt.textContent = Months[i].abbr;
			if (calendar.getMonth() === i) {
				opt.selected = true;
			}
			month.append(opt);
		});
		if (! [...month.children].find(opt => opt.selected)) {
			month.firstElementChild.selected = true;
		}

		fillCalendar(calendar, table, input);

		[month, year].forEach(input => {
			input.addEventListener('change', change => {
				switch(change.target) {
				case month:
					calendar.setMonth(parseInt(change.target.value));
					break;

				case year:
					calendar.setFullYear(change.target.valueAsNumber);
					break;
				}
				fillCalendar(calendar, cal, input);
			});
		});

		next.addEventListener('click', () => {
			if (month.value === '11') {
				month.value = 0;
				year.stepUp();
			} else {
				month.value++;
			}
			calendar.setMonth(parseInt(month.value));
			calendar.setFullYear(year.valueAsNumber);
			fillCalendar(calendar, cal, input);
		});

		prev.addEventListener('click', () => {
			if (month.value === '0') {
				month.value = 11;
				year.stepDown();
			} else {
				month.value--;
			}
			calendar.setMonth(parseInt(month.value));
			calendar.setFullYear(year.valueAsNumber);
			fillCalendar(calendar, cal, input);
		});

		dialog.append(cal);
		input.before(dialog);

		cal.querySelectorAll('time[datetime]').forEach(date => {
			date.addEventListener('click', click => {
				input.value = click.target.dateTime;
				dialog.close();
			});
		});

		input.addEventListener('focus', () => dialog.show());
		// input.addEventListener('blur', () => dialog.close());
	}

	appendTo(node) {
		node.append(this.table);
	}

	replace(node) {
		node.replaceWith(this.table);
	}

	*keys() {
		let n = 1;
		while(n <= this.length) {
			yield n++;
		}
	}

	*values() {
		const date = new Date(this.getFullYear(), this.getMonth());
		for (let day of this.keys()) {
			date.setDate(day);
			yield {
				dow: date.getDay(),
				day: Days[date.getDay()],
				dateTime: datetime(date),
			};
		}
	}

	*entries() {
		let n = 1;
		for (let day of this.values()) {
			yield [n++, day];
		}
	}
}
