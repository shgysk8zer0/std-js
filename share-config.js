export const facebook = {
	url: new URL('https://www.facebook.com/sharer/sharer.php?u&t'),
	icon: new URL('img/logos/Facebook.svg', document.baseURI),
	label: 'Facebook',
};

export const twitter = {
	url: new URL('https://twitter.com/intent/tweet/?text&url'),
	icon: new URL('img/logos/twitter.svg', document.baseURI),
	label: 'Twitter',
};

export const googlePlus = {
	url: new URL('https://plus.google.com/share/?url'),
	icon: new URL('img/logos/Google_plus.svg', document.baseURI),
	label: 'Google+',
};

export const linkedIn = {
	url: new URL('https://www.linkedin.com/shareArticle/?title&summary&url'),
	icon: new URL('img/logos/linkedin.svg', document.baseURI),
	label: 'LinkedIn',
};

export const reddit = {
	url: new URL('https://www.reddit.com/submit/?url&title'),
	icon: new URL('img/logos/Reddit.svg', document.baseURI),
	label: 'Reddit',
};

export const gmail = {
	url: new URL('https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&su&body'),
	icon: new URL('img/logos/gmail.svg', document.baseURI),
	label: 'Gmail',
};

export const email = {
	url: new URL('mailto:?subject&body'),
	icon: new URL('img/adwaita-icons/actions/mail-send.svg', document.baseURI),
	label: 'Email',
};
