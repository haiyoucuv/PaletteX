import { BoxLayout } from "./BoxLayout";
import { BoxLayoutElement } from "./BoxLayoutElement";
import { MatrixUtil } from "./MatrixUtil";
import { Point } from "./Point";

import { EventEmitter } from "@/Common/EventEmitter";

export class DocumentGroup extends EventEmitter {
	private bx: number;
	private by: number;
	private bh: number;
	private bw: number;
	private _hold: boolean;
	private _root: HTMLDivElement;
	private _layout: BoxLayout;
	private container: HTMLElement;
	private _ownerElement: any;

	constructor() {
		super();
		this._hold = false;
		this._root = document.createElement('div');
		this._root.className = "document-group";
		this._root.style.position = "absolute";
		this._root.style.boxSizing = 'border-box';
		this._root.style.overflow = 'hidden';
		this._root.style.zIndex = '0';
		this._layout = new BoxLayout();
		this._layout.init(this.root, { useTabMenu: false });
		this._layout.addBoxElementToRoot(new BoxLayoutElement());
	}

	get minWidth() {
		let size = 0;
		this.layout.getAllOpenPanels().forEach((panel) => {
			size = Math.max(panel.minWidth, size);
		});
		return size;
	}

	set minWidth(v) {
	}

	get minHeight() {
		let size = 0;
		this.layout.getAllOpenPanels().forEach((panel) => {
			size = Math.max(panel.minHeight, size);
		});
		return size;
	}

	set minHeight(v) {
	}

	get layout() {
		return this._layout;
	}

	get root() {
		return this._root;
	}

	get ownerElement() {
		return this._ownerElement;
	}

	set ownerElement(v) {
		this._ownerElement = v;
	}


	addPanel(panel) {
		this.layout.getActiveTabGroup().addPanel(panel);
	};

	getAllPanels() {
		return this.layout.getAllOpenPanels();
	};

	removePanel(panel) {
		panel.ownerGroup.removePanel(panel);
	};

	adjustDragInfo(e, info) {
		this.adjustDragInfo_tabGroup(e, info);
		return true;
	};

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
		const globalP = MatrixUtil.localToGlobal(this.container, new Point(this.bx, this.by));
		if (obj['left'] && obj['top']) {
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
			for (const key in obj) {
				if (obj[key]) {
					dir = key;
					break;
				}
			}
		}
		switch (dir) {
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
	};

	acceptDragInfo(v) {
		switch (v.otherData["type"]) {
			case "box":
				const startElement = v.otherData["startElement"];
				const startPanel = v.otherData["startPanel"];
				const targetElement = v.otherData["targetElement"];
				this.setHoldValue([startElement.render], true);
				targetElement.render.hold = true;
				const dir = v.otherData["dir"];
				if (startElement === targetElement && startElement.render.panels.length === 1) {
					return;
				}
				startElement.render.removePanel(startPanel);
				if (startElement.render.panels.length === 0) {
					startElement.ownerLayout.removeBoxElement(startElement);
				}
				const newElement = new BoxLayoutElement();
				targetElement.ownerLayout.addBoxElement(targetElement, newElement, dir);
				newElement.render.addPanel(startPanel);
				this.setHoldValue([newElement.render, startElement.render], false);
				targetElement.render.hold = false;
				break;
		}
	};

	setHoldValue(groups, value) {
		groups.forEach((group) => {
			group.panels.forEach((panel) => {
				panel._hold = value;
			});
		});
	};

	get hold() {
		return this._hold;
	}

	set hold(v) {
		this._hold = v;
	}

	render(container) {
		if (!this.hold) {
			this.container = container;
			this.container.appendChild(this.root);
		}
	}

	removeFromParent() {
		if (!this.hold) {
			this.root.remove();
		}
	};

	setBounds(x, y, width, height) {
		if (this.bw !== width || this.bh !== height) {
			this.root.style.width = width + 'px';
			this.root.style.height = height + 'px';
			this.bw = width;
			this.bh = height;
		}
		this.bx = x;
		this.by = y;
		this.root.style.left = x + 'px';
		this.root.style.top = y + 'px';
	};

}
