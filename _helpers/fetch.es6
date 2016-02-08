export function normalizeName(name) {
  if (typeof name !== 'string') {
	name = String(name);
  }
  if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	throw new TypeError('Invalid character in header field name');
  }
  return name.toLowerCase();
}
export function decode(body) {
  var form = new FormData();
  body.trim().split('&').forEach(function(bytes) {
	if (bytes) {
	  var split = bytes.split('=');
	  var name = split.shift().replace(/\+/g, ' ');
	  var value = split.join('=').replace(/\+/g, ' ');
	  form.append(decodeURIComponent(name), decodeURIComponent(value));
	}
});

export function normalizeValue(value) {
  if (typeof value !== 'string') {
	value = String(value);
  }
  return value;
}
