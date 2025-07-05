export class DefaultPanelSerialize {
	serialize(ownerLayout, panel) {
		return panel.getId();
	};

	unSerialize(ownerLayout, panelInfo) {
		const panel = ownerLayout.getRegistPanelById(panelInfo);
		if (!panel) {
			throw new Error("ID为 " + panelInfo + " 的面板未注册");
		}
		return panel;
	};
}
