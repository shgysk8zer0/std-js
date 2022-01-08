import { polyfill, trustPolicies } from '../TrustedTypes.js';
const polyfilled = polyfill();
export { trustPolicies, polyfilled };
console.info(import.meta.url);
