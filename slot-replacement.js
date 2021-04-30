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

export function slotReplacementHandler(shadow, ...slots) {
	if (slots.length === 0) {
		shadow.querySelectorAll('slot[name]').forEach(slot => {
			update(slot);
			slot.addEventListener('slotchange', changeHandler);
		});
	} else {
		slots.forEach(name => {
			const slot = shadow.querySelector(`slot[name="${name}"]`);

			if (slot instanceof HTMLSlotElement) {
				update(slot);
				slot.addEventListener('slotchange', changeHandler);
			}
		});
	}
}
