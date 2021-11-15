/* global SpeechSynthesis, SpeechSynthesisVoice, SpeechSynthesisUtterance */
import { getDeferred } from './promises.js';

export async function speak(text, { signal, pitch = 1, rate = 1, volume = 1, lang = navigator.language, voice } = {}) {
	if (! (globalThis.speechSynthesis instanceof SpeechSynthesis)) {
		return Promise.reject(new Error('Speech synthesis not supported'));
	} else {
		const speech = new SpeechSynthesisUtterance(text);
		const controller = new AbortController();
		const { resolve, reject, promise } = getDeferred();

		speech.rate = Math.max(0, Math.min(rate, 1));
		speech.pitch = Math.max(0, Math.min(pitch, 1));
		speech.volume = Math.max(0, Math.min(volume, 1));
		speech.lang = lang;

		if (voice instanceof SpeechSynthesisVoice) {
			speech.voice = voice;
		} else if (typeof voice === 'string') {
			speech.voice = globalThis.speechSynthesis.getVoices().find(({ name }) => name === voice);
		}

		speech.addEventListener('end', () => {
			resolve();
			controller.abort();
		}, { signal: controller.signal });

		speech.addEventListener('error', ev => {
			reject(ev);
			controller.abort();
		}, { signal: controller.signal });

		if (signal instanceof AbortSignal) {
			if (signal.aborted) {
				reject(new Error('Speech Aborted'));
				controller.abort();
			} else {
				globalThis.speechSynthesis.speak(speech);
				signal.addEventListener('abort', () => {
					reject(new Error('Signal aborted'));
					controller.abort();
					globalThis.speechSynthesis.cancel();
				}, { signal: controller.signal });
			}
		} else {
			globalThis.speechSynthesis.speak(speech);
		}

		return promise;
	}
}
