import PermissionStatus from './PermissionStatus.js';

if (! ('permissions' in navigator)) {
	navigator.permissions = {
		query: async function query({name/*, sysex = false, userVisibleOnly = false*/}) {
			switch(name) {
				case 'push':
				case 'notifications':
					if ('Notification' in window) {
						const state = Notification.permission;
						return state === 'default'
							? PermissionStatus.get(name, 'prompt')
							: PermissionStatus.get(name, state);

					} else {
						return Promise.resolve(PermissionStatus.get(name, 'denied'));
					}

				case 'geolocation':
					if ('geolocation' in navigator) {
						return Promise.resolve(PermissionStatus.get(name, 'prompt'));
					} else {
						return Promise.resolve(PermissionStatus.get(name, 'denied'));
					}

				case 'persistent-storage':
					if ('storage' in navigator && navigator.storage.persisted instanceof Function) {
						return navigator.storage.persisted().then(persist =>
							persist
								? PermissionStatus.get(name, 'granted')
								: PermissionStatus.get(name, 'prompt')
						);
					} else {
						return Promise.resolve(PermissionStatus.get(name, 'denied'));
					}

				default: throw new TypeError(`'${name}' (value of 'name' member of PermissionDescriptor) is not a valid value for enumeration PermissionName.`);
			}
		}
	};
}

if (! (navigator.permissions.request instanceof Function)) {
	navigator.permissions.request = function({ name/*, sysex = false, userVisibleOnly = false*/ }) {
		switch(name) {
			case 'push':
			case 'notifications':
				if ('Notification' in window) {
					return new Promise(resolve => {
						Notification.requestPermission(
							() => resolve(PermissionStatus.get(name, 'granted')),
							() => resolve(PermissionStatus.get(name, 'denied'))
						);
					});
				} else {
					return Promise.resolve(PermissionStatus.get(name, 'denied'));
				}

			case 'geolocation':
				if ('geolocation' in navigator) {
					return new Promise(resolve => {
						navigator.geolocation.getCurrentPosition(
							() => resolve(PermissionStatus.get(name, 'granted')),
							() => resolve(PermissionStatus.get(name, 'denied'))
						);
					});
				} else {
					return Promise.resolve(PermissionStatus.get(name, 'denied'));
				}

			case 'persistent-storage':
				if ('storage' in navigator && navigator.storage.persisted instanceof Function) {
					return navigator.storage.persist().then(persist =>
						persist
							? PermissionStatus.get(name, 'granted')
							: PermissionStatus.get(name, 'prompt')
					);
				} else {
					return Promise.resolve(PermissionStatus.get(name, 'denied'));
				}

			default: throw new TypeError(`'${name}' (value of 'name' member of PermissionDescriptor) is not a valid value for enumeration PermissionName.`);
		}
	};
}
