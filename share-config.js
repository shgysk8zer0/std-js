const BASE = 'https://cdn.kernvalley.us';

export const facebook = {
	url: new URL('https://www.facebook.com/sharer/sharer.php?u&t'),
	icon: new URL('img/logos/facebook.svg', BASE),
	label: 'Facebook',
};

export const twitter = {
	url: new URL('https://twitter.com/intent/tweet/?text&url'),
	icon: new URL('img/logos/twitter.svg', BASE),
	label: 'Twitter',
};

export const googlePlus = {
	url: new URL('https://plus.google.com/share/?url'),
	icon: new URL('img/logos/google-plus.svg', BASE),
	label: 'Google+',
};

export const linkedIn = {
	url: new URL('https://www.linkedin.com/shareArticle/?title&summary&url'),
	icon: new URL('img/logos/linkedin.svg', BASE),
	label: 'LinkedIn',
};

export const reddit = {
	url: new URL('https://www.reddit.com/submit/?url&title'),
	icon: new URL('img/logos/reddit.svg', BASE),
	label: 'Reddit',
};

export const gmail = {
	url: new URL('https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&su&body'),
	icon: new URL('img/logos/gmail.svg', BASE),
	label: 'Gmail',
};

export const email = {
	url: new URL('mailto:?subject&body'),
	icon: new URL('img/adwaita-icons/actions/mail-send.svg', BASE),
	label: 'Email',
};
