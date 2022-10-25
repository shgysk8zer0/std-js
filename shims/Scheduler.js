import { Scheduler } from '../Scheduler.js';

if (! ('scheduler' in globalThis)) {
	globalThis.scheduler = new Scheduler();
}
