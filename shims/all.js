import { trustPolicies as defaultPolicies } from './trustedTypes.js';
import { trustPolicies as sanitizerPolicies } from './sanitizer.js';
import './cookieStore.js';
import './locks.js';

export const trustPolicies = [...defaultPolicies, ...sanitizerPolicies];
