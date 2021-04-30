function update(slot) {
	slot.assignedElements().forEach(el => {
		if (el instanceof HTMLTemplateElement) {
			const frag = el.content;
			[...frag.children].forEach(el => el.slot = slot.name);
			el.replaceWith(frag);
		}
	});
}

function changeHandler() {
	update(this);
}

export function slotReplacementHandler(shadow) {
	shadow.querySelectorAll('slot[name]').forEach(slot => {
		update(slot);
		slot.addEventListener('slotchange', changeHandler);
	});
}


customElements.define('test-el', class HTMLTestEl extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'closed' });
		const slot = document.createElement('slot');
		slot.name = 'content';
		shadow.append(slot);
		slotReplacementHandler(shadow);
	}
});
