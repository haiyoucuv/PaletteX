import { BoxLayoutElement } from "./BoxLayoutElement";
import { DragInfo } from "./DragInfo";
import { MatrixUtil } from "./MatrixUtil";
import { Point } from "./Point";
import { Rectangle } from "./Rectangle";
import { TabBar } from "./TabBar";
import { TabBarEvent, TabGroupEvent, TabPanelEvent, BoxLayoutEvent, DragEvent } from "./EventType";
import { TabPanel } from "./TabPanel";
import { TabPanelFocusManager } from "./TabPanelFocusManager";

import { EventEmitter } from "@/Common/EventEmitter";

export class TabGroup extends EventEmitter {
	private _tabBarHeight: number;
	private _panels: any[];
	private _selectedIndex: number;
	private reDeployPanelTag: boolean;
	private currentPanles: any[];
	private selectedPath: any[];
	private container: any;
	private bx: number;
	private by: number;
	private bw: number;
	private bh: number;
	private _ownerElement: any;
	private _tabBar: TabBar;

	constructor() {
		super();
		this._panels = [];
		this._selectedIndex = NaN;
		this.reDeployPanelTag = false;
		this.currentPanles = [];
		//缓存的选中路径
		this.selectedPath = [];
		this._tabBar = new TabBar();
	}

	get minWidth() {
		let size = 0;
		this.panels.forEach((panel) => {
			size = Math.max(panel.minWidth, size);
		});
		return size;
	}

	set minWidth(v) {
	}

	get minHeight() {
		let size = 0;
		this.panels.forEach((panel) => {
			size = Math.max(panel.minHeight, size);
		});
		return size;
	}

	set minHeight(v) {
	}

	get titleRenderFactory() {
		return this._tabBar.titleRenderFactory;
	}

	set titleRenderFactory(v) {
		this._tabBar.titleRenderFactory = v;
	}

	get tabBar() {
		return this._tabBar;
	}

	get root() {
		return this.container;
	}

	get ownerLayout() {
		if (this.ownerElement)
			return this.ownerElement.ownerLayout;
		return null;
	}

	get ownerElement() {
		return this._ownerElement;
	}

	set ownerElement(v) {
		this._ownerElement = v;
	}

	get panels() {
		return this._panels;
	}

	set panels(v) {
		const _this = this;
		this._panels = v;
		this._panels.forEach((panel) => {
			panel.ownerGroup = _this;
		});
		this.tabBar.panels = v;
		this.reDeployPanels();
		this.commitSelected();
	}

	get selectedIndex() {
		return this._selectedIndex;
	}

	set selectedIndex(v) {
		this._selectedIndex = v;
		this.tabBar.selectedIndex = v;
		this.commitSelected();
	}

	get selectedPanel() {
		return this.panels[this.selectedIndex];
	}

	set selectedPanel(panel) {
		this.selectedIndex = this.panels.indexOf(panel);
	}


	removePanel(v) {
		let targetIndex = NaN;
		for (let i = 0; i < this.panels.length; i++) {
			if (this.panels[i] === v) {
				targetIndex = i;
				break;
			}
		}
		if (!isNaN(targetIndex)) {
			if (this.emit(TabGroupEvent.PANEL_REMOVING, {
				panel: v,
				tabGroup: this
			})) {
				this.panels.splice(targetIndex, 1);
				v.ownerGroup = null;
				this.tabBar.panels = this.panels;
				this.reDeployPanels();
				this.emit(TabGroupEvent.PANEL_REMOVED, {
					panel: v,
					tabGroup: this
				});
				//设置新的选中索引
				let find = false;
				while (this.selectedPath.length > 0) {
					const tmp = this.selectedPath.pop();
					const index = this.panels.indexOf(tmp);
					if (index !== -1) {
						this.selectedIndex = index;
						find = true;
						break;
					}
				}
				if (!find) {
					this.selectedIndex = this.panels.length - 1;
				}
			}
		}
	}

	/**
	 * @param v
	 */
	_removePanel(v) {
		let targetIndex = NaN;
		for (let i = 0; i < this.panels.length; i++) {
			if (this.panels[i] === v) {
				targetIndex = i;
				break;
			}
		}
		if (!isNaN(targetIndex)) {
			this.panels.splice(targetIndex, 1);
			v.ownerGroup = null;
			this.tabBar.panels = this.panels;
			this.reDeployPanels();
			//设置新的选中索引
			let find = false;
			while (this.selectedPath.length > 0) {
				var tmp = this.selectedPath.pop();
				var index = this.panels.indexOf(tmp);
				if (index !== -1) {
					this.selectedIndex = index;
					find = true;
					break;
				}
			}
			if (!find) {
				this.selectedIndex = this.panels.length - 1;
			}
		}
	}

	addPanel(v) {
		for (let i = 0; i < this.panels.length; i++) {
			if (this.panels[i] === v) {
				this.selectedIndex = (i);
				return;
			}
		}
		this.panels.push(v);
		v.ownerGroup = this;
		this.tabBar.panels = this.panels;
		this.reDeployPanels();
		this.emit(TabGroupEvent.PANEL_ADDED, {
			panel: v,
			tabGroup: this
		});
		//设置新的选中索引
		this.selectedIndex = this.panels.length - 1;
	}

	_addPanel(v) {
		for (let i = 0; i < this.panels.length; i++) {
			if (this.panels[i] === v) {
				this.selectedIndex = (i);
				return;
			}
		}
		this.panels.push(v);
		v.ownerGroup = this;
		this.tabBar.panels = this.panels;
		this.reDeployPanels();
		//设置新的选中索引
		this.selectedIndex = this.panels.length - 1;
	}

	addPanelTo(target, panel, dir = "right") {
		let index = this.panels.indexOf(panel);
		if (index !== -1) {
			if (target === panel) {
				return;
			}
			this.panels.splice(index, 1);
		}
		index = this.panels.indexOf(target);
		switch (dir) {
			case "right":
				this.panels.splice(index + 1, 0, panel);
				break;
			case "left":
				this.panels.splice(index, 0, panel);
				break;
		}
		panel.ownerGroup = this;
		this.tabBar.panels = this.panels;
		this.reDeployPanels();
		this.emit(TabGroupEvent.PANEL_ADDED, {
			panel: panel,
			tabGroup: this
		});
		//设置新的选中索引
		index = this.panels.indexOf(panel);
		this.selectedIndex = index;
	};

	_addPanelTo(target, panel, dir = "right") {
		let index = this.panels.indexOf(panel);
		if (index !== -1) {
			if (target === panel) {
				return;
			}
			this.panels.splice(index, 1);
		}
		index = this.panels.indexOf(target);
		switch (dir) {
			case "right":
				this.panels.splice(index + 1, 0, panel);
				break;
			case "left":
				this.panels.splice(index, 0, panel);
				break;
		}
		panel.ownerGroup = this;
		this.tabBar.panels = this.panels;
		this.reDeployPanels();
		//设置新的选中索引
		index = this.panels.indexOf(panel);
		this.selectedIndex = index;
	}

	reDeployPanels() {
		if (!this.container) {
			this.reDeployPanelTag = true;
			return;
		}
		this.currentPanles.forEach((panel: TabPanel) => {
			panel.removeFromParent();
			panel.on(TabPanelEvent.REFRESH, this.panelEventHandler, this);
			panel.on(TabPanelEvent.FOCUSIN, this.panelEventHandler, this);
			panel.on(TabPanelEvent.FOCUSOUT, this.panelEventHandler, this);
		});
		this.currentPanles = this.panels.concat();
		this.currentPanles.forEach((panel: TabPanel) => {
			panel.render(this.container);
			panel._visible = false;
			panel.on(TabPanelEvent.REFRESH, this.panelEventHandler, this);
			panel.on(TabPanelEvent.FOCUSIN, this.panelEventHandler, this);
			panel.on(TabPanelEvent.FOCUSOUT, this.panelEventHandler, this);
		});
	}

	commitSelected() {
		for (let i = 0; i < this.panels.length; i++) {
			if (i === this.selectedIndex) {
				this.panels[i]._visible = true;
				TabPanelFocusManager.focus(this.panels[i]);
				this.selectedPath.push(this.panels[i]);
			} else {
				this.panels[i]._visible = false;
			}
		}
		this.updatePanelDisplay();
	}

	panelEventHandler(e) {
		switch (e.type) {
			// @ts-ignore
			case TabPanelEvent.FOCUSIN:
				this.emit(TabGroupEvent.FOCUS_CHANGED, e.data);
			case TabPanelEvent.FOCUSOUT:
			case TabPanelEvent.REFRESH:
				this.tabBar.refresh();
				this.updatePanelDisplay();
				break;
		}
	};

	adjustDragInfo(e, info) {
		if (!this.adjustDragInfo_tabBox(e, info)) {
			this.adjustDragInfo_tabGroup(e, info);
		}
		return true;
	}

	adjustDragInfo_tabBox(e, info) {
		let itemBound;
		let p;
		let globalP = MatrixUtil.localToGlobal(this.tabBar.root, new Point());
		let bounds = this.tabBar.getBounds();
		const globalRange = new Rectangle(globalP.x, globalP.y, bounds.width, bounds.height);
		if (globalRange.containsPoint(new Point(e.clientX, e.clientY))) {
			let targetItem = void 0;
			for (let i = 0; i < this.tabBar.currentItems.length; i++) {
				const item = this.tabBar.currentItems[i];
				globalP = MatrixUtil.localToGlobal(item.root, new Point());
				bounds = item.getBounds();
				globalRange.x = globalP.x;
				globalRange.y = globalP.y;
				globalRange.width = bounds.width;
				globalRange.height = bounds.height;
				if (globalRange.containsPoint(new Point(e.clientX, e.clientY))) {
					targetItem = item;
					break;
				}
			}
			let dir = void 0;
			if (info.otherData["startElement"] === this.ownerElement) {
				if (!targetItem) {
					targetItem = this.tabBar.currentItems[this.tabBar.currentItems.length - 1];
				}
				if (this.panels.indexOf(targetItem.panel) <= this.panels.indexOf(info.otherData["startPanel"])) {
					dir = "left";
				} else {
					dir = "right";
				}
				p = MatrixUtil.localToGlobal(targetItem.root, new Point());
				itemBound = targetItem.getBounds();
				info.dragRange.x = p.x;
				info.dragRange.y = p.y;
				info.dragRange.width = itemBound.width;
				info.dragRange.height = itemBound.height;
			} else {
				if (targetItem) {
					dir = "left";
					p = MatrixUtil.localToGlobal(targetItem.root, new Point());
					itemBound = targetItem.getBounds();
					info.dragRange.x = p.x;
					info.dragRange.y = p.y;
					info.dragRange.width = itemBound.width;
					info.dragRange.height = itemBound.height;
				} else {
					targetItem = this.tabBar.currentItems[this.tabBar.currentItems.length - 1];
					dir = "right";
					p = MatrixUtil.localToGlobal(targetItem.root, new Point());
					itemBound = targetItem.getBounds();
					info.dragRange.x = p.x + bounds.width;
					info.dragRange.y = p.y;
					info.dragRange.width = info.dragRange.height = itemBound.height;
				}
			}
			info.otherData["type"] = "panel";
			info.otherData["dir"] = dir;
			info.otherData["targetElement"] = this.ownerElement;
			info.otherData["targetPanel"] = targetItem.panel;
			return true;
		}
		return false;
	}

	adjustDragInfo_tabGroup(e, info) {
		const p = MatrixUtil.globalToLocal(this.container, new Point(e.clientX, e.clientY));
		p.x -= this.bx;
		p.y -= this.by;
		const marginHor = this.bw / 3;
		const marignVer = this.bh / 3;
		let dir;
		const obj = {};
		obj['left'] = p.x < marginHor;
		obj['right'] = p.x > this.bw - marginHor;
		obj['top'] = p.y < marignVer;
		obj['bottom'] = p.y > this.bh - marignVer;
		obj['center'] = (!obj['left'] && !obj['right'] && !obj['bottom'] && !obj['top']);
		const globalP = MatrixUtil.localToGlobal(this.container, new Point(this.bx, this.by));
		if (obj['center']) {
			dir = 'center';
		} else if (obj['left'] && obj['top']) {
			if (p.x < p.y)
				dir = 'left';
			else
				dir = 'top';
		} else if (obj['left'] && obj['bottom']) {
			if (p.x < this.bh - p.y)
				dir = 'left';
			else
				dir = 'bottom';
		} else if (obj['right'] && obj['top']) {
			if (this.bw - p.x < p.y)
				dir = 'right';
			else
				dir = 'top';
		} else if (obj['right'] && obj['bottom']) {
			if (this.bw - p.x < this.bh - p.y)
				dir = 'right';
			else
				dir = 'bottom';
		} else {
			for (var key in obj) {
				if (obj[key]) {
					dir = key;
					break;
				}
			}
		}
		switch (dir) {
			case 'center':
				info.dragRange.width = this.bw;
				info.dragRange.height = this.bh;
				info.dragRange.x = globalP.x;
				info.dragRange.y = globalP.y;
				break;
			case 'left':
				info.dragRange.width = this.bw / 2;
				info.dragRange.height = this.bh;
				info.dragRange.x = globalP.x;
				info.dragRange.y = globalP.y;
				break;
			case 'right':
				info.dragRange.width = this.bw / 2;
				info.dragRange.height = this.bh;
				info.dragRange.x = globalP.x + this.bw / 2;
				info.dragRange.y = globalP.y;
				break;
			case 'top':
				info.dragRange.width = this.bw;
				info.dragRange.height = this.bh / 2;
				info.dragRange.x = globalP.x;
				info.dragRange.y = globalP.y;
				break;
			case 'bottom':
				info.dragRange.width = this.bw;
				info.dragRange.height = this.bh / 2;
				info.dragRange.x = globalP.x;
				info.dragRange.y = globalP.y + this.bh / 2;
				break;
		}
		//
		info.otherData["type"] = "box";
		info.otherData["dir"] = dir;
		info.otherData["targetElement"] = this.ownerElement;
	}

	acceptDragInfo(v) {
		const startElement = v.otherData["startElement"];
		const startPanel = v.otherData["startPanel"];
		const targetElement = v.otherData["targetElement"];
		const dir = v.otherData["dir"];

		switch (v.otherData["type"]) {
			case "box":
				this.setHoldValue([startElement.render, targetElement.render], true);
				if (dir === "center") {
					if (startElement === targetElement) {
						return;
					}
					startElement.render._removePanel(startPanel);
					if (startElement.render.panels.length === 0) {
						startElement.ownerLayout.removeBoxElement(startElement);
					}
					targetElement.render._addPanel(startPanel);
					this.emit(TabGroupEvent.PANEL_DRAG, startPanel);
				} else {
					if (startElement === targetElement && startElement.render.panels.length === 1) {
						return;
					}
					startElement.render._removePanel(startPanel);
					if (startElement.render.panels.length === 0) {
						startElement.ownerLayout.removeBoxElement(startElement);
					}
					const newElement = new BoxLayoutElement();
					targetElement.ownerLayout.addBoxElement(targetElement, newElement, dir);
					newElement.render._addPanel(startPanel);
					this.setHoldValue([newElement.render], false);
					this.emit(TabGroupEvent.PANEL_DRAG, startPanel);
				}
				this.setHoldValue([startElement.render, targetElement.render], false);
				break;
			case "panel":
				this.setHoldValue([startElement.render, targetElement.render], true);
				const targetPanel = v.otherData["targetPanel"];
				if (startElement !== targetElement) {
					startElement.render._removePanel(startPanel);
					if (startElement.render.panels.length === 0) {
						startElement.ownerLayout.removeBoxElement(startElement);
					}
					targetElement.render._addPanelTo(targetPanel, startPanel, dir);
					this.emit(TabGroupEvent.PANEL_DRAG, startPanel);
				} else {
					targetElement.render._addPanelTo(targetPanel, startPanel, dir);
					this.emit(TabGroupEvent.PANEL_DRAG, startPanel);
				}
				this.setHoldValue([startElement.render, targetElement.render], false);
				break;
		}
	};

	setHoldValue(groups, value) {
		groups.forEach((group) => {
			group.panels.forEach((panel) => {
				panel._hold = value;
			});
		});
	}

	render(container) {
		this.container = container;
		this.tabBar.render(this.container);
		if (this.reDeployPanelTag) {
			this.reDeployPanelTag = false;
			this.reDeployPanels();
			this.commitSelected();
		}
		this.tabBar.on(TabBarEvent.CHANGE, this.tabBarEventHandle, this);
		this.tabBar.on(TabBarEvent.MENUSELECTED, this.tabBarEventHandle, this);
		this.tabBar.on(TabBarEvent.BEGINDRAG, this.tabBarEventHandle, this);
		this.tabBar.on(TabBarEvent.ITEMDOUBLECLICK, this.tabBarEventHandle, this);
		this.tabBar.showOptionContainer = this.ownerElement.ownerLayout.config.useTabMenu;
		this.ownerElement.ownerLayout.config.on(BoxLayoutEvent.CONFIG_CHANGED, this.configHandle, this);
	}

	removeFromParent() {
		if (this.container) {
			this.tabBar.removeFromParent();
			this.currentPanles.forEach((panel) => panel.removeFromParent());
			this.tabBar.off(TabBarEvent.CHANGE, this.tabBarEventHandle, this);
			this.tabBar.off(TabBarEvent.MENUSELECTED, this.tabBarEventHandle, this);
			this.tabBar.off(TabBarEvent.BEGINDRAG, this.tabBarEventHandle, this);
			this.tabBar.off(TabBarEvent.ITEMDOUBLECLICK, this.tabBarEventHandle, this);
			this.ownerElement.ownerLayout.config.off(BoxLayoutEvent.CONFIG_CHANGED, this.configHandle, this);
		}
	}

	configHandle(e) {
		if (this.tabBar.showOptionContainer !== this.ownerElement.ownerLayout.config.useTabMenu) {
			this.tabBar.showOptionContainer = this.ownerElement.ownerLayout.config.useTabMenu;
		}
	}

	tabBarEventHandle(e) {
		switch (e.type) {
			case TabBarEvent.CHANGE:
				this._selectedIndex = this.tabBar.selectedIndex;
				this.commitSelected();
				break;
			case TabBarEvent.BEGINDRAG:
				if (!this.ownerElement.ownerLayout.maxSizeElement) {
					const info = new DragInfo();
					info.otherData["startElement"] = this.ownerElement;
					info.otherData["startPanel"] = e.data;
					this.emit(DragEvent.STARTDRAG, info);
				}
				break;
			case TabBarEvent.MENUSELECTED:
				this.doForTabbarMenu(e.data);
				break;
			case TabBarEvent.ITEMDOUBLECLICK:
				if (this.ownerElement.ownerLayout.maxSizeElement === this.ownerElement) {
					this.ownerElement.ownerLayout.setMaxSize(null);
				} else {
					this.ownerElement.ownerLayout.setMaxSize(this.ownerElement);
				}
				break;
		}
	}

	doForTabbarMenu(id) {
		switch (id) {
			case 'close':
				// if (this.ownerElement.ownerLayout.rootLayoutElement === this.ownerElement && this.panels.length === 1) {
				//     return;
				// }
				const targetPanel = this.panels[this.selectedIndex];
				this.setHoldValue([this], true);
				targetPanel._hold = false;
				this.removePanel(targetPanel);
				this.setHoldValue([this], false);
				if (this.panels.length === 0) {
					this.ownerElement.ownerLayout.removeBoxElement(this.ownerElement);
				}
				break;
			case 'closeall':
				for (var i = this.panels.length - 1; i >= 0; i--) {
					this.removePanel(this.panels[i]);
				}
				this.ownerElement.ownerLayout.removeBoxElement(this.ownerElement);
				break;
		}
	}

	get tabBarHeight() {
		return this._tabBarHeight;
	}

	set tabBarHeight(v) {
		this._tabBarHeight = v;
	}

	setBounds(x, y, width, height) {
		this.bx = x;
		this.by = y;
		this.bw = width;
		this.bh = height;
		this.tabBar.setBounds(x, y, width, TabGroup._tabBarHeight);
		this.updatePanelDisplay();
	}

	updatePanelDisplay() {
		for (let i = 0; i < this.panels.length; i++) {
			if (i === this.selectedIndex) {
				this.panels[i].setBounds(this.bx, this.by + TabGroup._tabBarHeight, this.bw, this.bh - TabGroup._tabBarHeight);
				break;
			}
		}
	}

	// private tabBarHeight: number = 25;//选项卡区域的高度
	static _tabBarHeight = 25;
	static asd = 0;
}
