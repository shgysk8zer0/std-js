import { getDeferred } from './promises.js';

export async function checkFrameRate({ signal } = {}) {
	const { resolve, promise } = getDeferred({ signal });
	
	if (! (signal instanceof AbortSignal && signal.aborted)) {
		requestIdleCallback(() => {
			requestAnimationFrame(start => {
				requestAnimationFrame(end => {
					resolve(parseInt(1000 / (end - start)));
				});
			});
		});
	}
	
	return promise;
}
