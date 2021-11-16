/* global SpeechSynthesisVoice */
import { getDeferred } from './promises.js';

export async function speak(text, { signal, rate = 1, pitch = 1, volume = 1, voice } = {}) {
	const { resolve, reject, promise } = getDeferred();

	if (! ('speechSynthesis' in globalThis)) {
		reject(new DOMException('SpeechSynthesis not supported'));
	} else {
		const utterance = new SpeechSynthesisUtterance(text);
		const controller = new AbortController();

		utterance.volume = Math.min(Math.max(0, volume), 1);
		utterance.pitch = Math.min(Math.max(0, pitch), 1);
		utterance.rate = Math.min(Math.max(0, rate), 1);

		if ('SpeechSynthesisVoice' in globalThis) {
			if (voice instanceof SpeechSynthesisVoice) {
				utterance.voice = voice;
			} else if (typeof voice === 'string') {
				const found = globalThis.speechSynthesis.getVoices().find(({ name }) => name === voice);
				if (found instanceof SpeechSynthesisVoice) {
					utterance.voice = found;
				}
			}
		}

		utterance.addEventListener('end', () => {
			resolve();
			controller.abort();
		}, { signal: controller.signal });

		utterance.addEventListener('error', () => {
			reject(new DOMException('Speech cancelled'));
			controller.abort();
		}, { signal: controller.signal });

		if (signal instanceof AbortSignal) {
			if (signal.aborted) {
				controller.abort();
			} else {
				globalThis.speechSynthesis.speak(utterance);

				signal.addEventListener('abort', () => {
					reject(new DOMException('Signal aborted'));
					controller.abort();
				}, { signal: controller.signal });
			}

			controller.signal.addEventListener('abort', () => {
				globalThis.speechSynthesis.cancel();
			}, { once: true });
		}
		else {
			globalThis.speechSynthesis.speak(utterance);
		}
	}

	return promise;
}
