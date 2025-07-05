export class TabPanelFocusManager {
	private static _foucsPanel: any;

	static panels = [];
	static activeGroups = [];

	static push(panel) {
		if (this.panels.indexOf(panel) === -1) {
			this.panels.push(panel);
			panel.root.addEventListener('mousedown', TabPanelFocusManager.mouseEventHandle, true);
		}
	};

	static mouseEventHandle(e) {
		for (let i = 0; i < TabPanelFocusManager.panels.length; i++) {
			if (TabPanelFocusManager.panels[i].root === e.currentTarget) {
				TabPanelFocusManager.focus(TabPanelFocusManager.panels[i]);
				break;
			}
		}
	};

	static get currentFocus() {
		return TabPanelFocusManager._foucsPanel;
	}

	static focus(panel) {
		if (TabPanelFocusManager._foucsPanel === panel) {
			return;
		}
		const oldFocusPanel = TabPanelFocusManager._foucsPanel;
		TabPanelFocusManager._foucsPanel = panel;
		if (oldFocusPanel) {
			oldFocusPanel._focusOut();
		}
		if (TabPanelFocusManager._foucsPanel) {
			TabPanelFocusManager._foucsPanel.root.focus();
			TabPanelFocusManager._foucsPanel._focusIn();
			TabPanelFocusManager.addActiveGroup(TabPanelFocusManager._foucsPanel);
		}
	};

	static getActiveGroup(layout) {
		for (let i = 0; i < TabPanelFocusManager.activeGroups.length; i++) {
			if (TabPanelFocusManager.activeGroups[i].layout === layout) {
				return TabPanelFocusManager.activeGroups[i].group;
			}
		}
		return null;
	};

	static addActiveGroup(panel) {
		for (let i = 0; i < TabPanelFocusManager.activeGroups.length; i++) {
			if (TabPanelFocusManager.activeGroups[i].layout === panel.ownerGroup.ownerElement.ownerLayout) {
				TabPanelFocusManager.activeGroups[i].group = panel.ownerGroup;
				return;
			}
		}
		TabPanelFocusManager.activeGroups.push({
			layout: panel.ownerGroup.ownerElement.ownerLayout, group: panel.ownerGroup
		});
	};

	static reSet() {
		TabPanelFocusManager._foucsPanel = null;
		TabPanelFocusManager.activeGroups = [];
	};

}
