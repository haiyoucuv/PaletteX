import { DefaultTitleRenderFactory } from "./DefaultTitleRender";
import { Point } from "./Point";
import { PopupMenu } from "./PopupMenu";
import { TabBarEvent } from "./EventType";

import { EventEmitter } from "@/Common/EventEmitter";

export class TabBar extends EventEmitter {
	private bx: number;
	private by: number;
	private bw: number;
	private bh: number;

	private minHeight: number;
	private minWidth: number;
	private _panels: any[];
	private _showOptionContainer: boolean;
	private _selectedIndex: number;
	currentItems: any[];
	private _root: any;
	private startP: Point;
	cancelClick: boolean;
	itemContainer: HTMLDivElement;
	itemRemainContainer: HTMLDivElement;
	appendContainer: HTMLDivElement;
	optionContainer: any;
	private _titleRenderFactory: DefaultTitleRenderFactory;
	private container: any;
	private targetPanel: any;
	private currentHeaderRender: any;

	constructor() {
		super();
		this.minHeight = 0;
		this.minWidth = 0;
		this._panels = [];
		this._selectedIndex = NaN;
		this._showOptionContainer = true;
		this.currentItems = [];
		this.startP = new Point();
		this.cancelClick = false;

		this._root = document.createElement('div');
		this._root.className = 'tabbar';
		this._root.style.position = "absolute";
		this._root.style.display = "flex";
		this._root.style.alignContent = "flex-start";
		this._root.style.alignItems = "center";
		this._root.style.zIndex = '1';

		this.itemContainer = document.createElement('div');
		this.itemContainer.className = "tabbar-item-container";
		this.itemContainer.style.display = "flex";
		this.itemContainer.style.alignContent = "flex-start";
		this.itemContainer.style.overflow = "hidden";
		this._root.appendChild(this.itemContainer);

		this.itemRemainContainer = document.createElement('div');
		this.itemRemainContainer.className = "tabbar-item-remain-container";
		this.itemRemainContainer.style.flexGrow = "1";
		this._root.appendChild(this.itemRemainContainer);

		this.appendContainer = document.createElement('div');
		this.appendContainer.className = "tabbar-append-container";
		this._root.appendChild(this.appendContainer);

		this.optionContainer = document.createElement('img');
		this.optionContainer.className = "tabbar-option-container";
		this.optionContainer.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAYAAACzzX7wAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACpJREFUeNpi+P//f8N/3KCBAUgw4FAEEmOAKUBX1AATZ2FAgAZsbIAAAwCRBFexyGAHPAAAAABJRU5ErkJggg==";
		this.optionContainer.title = "选项卡菜单";
		this._root.appendChild(this.optionContainer);

		this.optionContainer.addEventListener("click", this.optionEventHandle);
	}

	get titleRenderFactory() {
		return this._titleRenderFactory;
	}

	set titleRenderFactory(v) {
		if (this._titleRenderFactory != v) {
			this._titleRenderFactory = v;
			this.reDeployItems();
			this.commitSelected();
		}
	}

	optionEventHandle = (e) => {
		PopupMenu.popup(this.optionContainer, [
			{ label: "关闭", id: "close" },
			{ label: "关闭组", id: "closeall" }
		], (id) => {
			this.emit(TabBarEvent.MENUSELECTED, id);
		});
	}

	get root() {
		return this._root;
	}

	get panels() {
		return this._panels;
	}

	set panels(v) {
		this._panels = v;
		this.reDeployItems();
		this.commitSelected();
	}

	get selectedIndex() {
		return this._selectedIndex;
	}

	set selectedIndex(v) {
		if (this._selectedIndex != v) {
			this._selectedIndex = v;
			this.commitSelected();
		}
	}

	setSelected(v) {
		this._selectedIndex = v;
		this.commitSelected();
		this.emit(TabBarEvent.CHANGE);
	}

	get showOptionContainer() {
		return this._showOptionContainer;
	}

	set showOptionContainer(v) {
		this._showOptionContainer = v;
		this.optionContainer.hidden = !v;
	}

	render(container) {
		this.container = container;
		this.container.appendChild(this.root);
	}

	removeFromParent() {
		this.root.remove();
	}

	getBounds() {
		return { x: this.bx, y: this.by, width: this.bw, height: this.bh };
	}

	setBounds(x, y, width, height) {
		this.root.style.width = width + 'px';
		this.root.style.height = height + 'px';
		this.root.style.left = x + 'px';
		this.root.style.top = y + 'px';
		this.bx = x;
		this.by = y;
		if (this.bw !== width || this.bh !== height) {
			this.bw = width;
			this.bh = height;
			this.updateItemDisplay();
		}
	}

	reDeployItems() {
		this.currentItems.forEach((item) => {
			item.removeFromParent();
			item.root.removeEventListener("mousedown", this.itemEventHandle);
			item.root.removeEventListener("click", this.itemEventHandle);
			item.root.removeEventListener("dblclick", this.itemEventHandle);
		});
		this.currentItems = [];
		if (this.titleRenderFactory) {
			for (let i = 0; i < this._panels.length; i++) {
				const item = this.titleRenderFactory.createTitleRender();
				item.render(this.itemContainer);
				item.panel = this._panels[i];
				item.root.addEventListener("mousedown", this.itemEventHandle);
				item.root.addEventListener("click", this.itemEventHandle);
				item.root.addEventListener("dblclick", this.itemEventHandle);
				this.currentItems.push(item);
			}
			this.updateItemDisplay();
		}
	}

	itemEventHandle = (e) => {
		switch (e.type) {
			case "mousedown":
				this.startP.x = e.clientX;
				this.startP.y = e.clientY;
				this.cancelClick = false;
				const currentElement = e.currentTarget;
				for (let i = 0; i < this.currentItems.length; i++) {
					if (this.currentItems[i].root === currentElement) {
						this.targetPanel = this.panels[i];
						break;
					}
				}
				window.addEventListener("mousemove", this.itemEventHandle);
				window.addEventListener("mouseup", this.itemEventHandle);
				break;
			case "mousemove":
				if (Math.abs(e.clientX - this.startP.x) > 3 || Math.abs(e.clientY - this.startP.y) > 3) {
					window.removeEventListener("mousemove", this.itemEventHandle);
					window.removeEventListener("mouseup", this.itemEventHandle);
					this.cancelClick = true;
					this.emit(TabBarEvent.BEGINDRAG, this.targetPanel);
				}
				break;
			case "mouseup":
				window.removeEventListener("mousemove", this.itemEventHandle);
				window.removeEventListener("mouseup", this.itemEventHandle);
				break;
			case "click":
				if (!this.cancelClick) {
					const currentElement_1 = e.currentTarget;
					for (let i = 0; i < this.currentItems.length; i++) {
						if (this.currentItems[i].root === currentElement_1) {
							if (this.selectedIndex !== i) {
								this.setSelected(i);
							} else {
								this.currentItems[i].panel.focus();
							}
						}
					}
				}
				break;
			case "dblclick":
				if (!this.cancelClick) {
					this.emit(TabBarEvent.ITEMDOUBLECLICK);
				}
				break;
		}
	}

	commitSelected() {
		if (this.currentHeaderRender) {
			this.currentHeaderRender.removeFromParent();
		}
		for (let i = 0; i < this.currentItems.length; i++) {
			if (i === this._selectedIndex) {
				this.currentItems[i].selected = true;
				this.currentHeaderRender = this.panels[i].getHeaderRender();
			} else {
				this.currentItems[i].selected = false;
			}
		}
		if (this.currentHeaderRender) {
			this.currentHeaderRender.render(this.appendContainer);
		}
	}

	refresh() {
		this.currentItems.forEach((item) => {
			item.updateDisplay();
		});
	}

	updateItemDisplay() {
		const size = Math.min(this.bw / this.currentItems.length, 100);
		for (let i = 0; i < this.currentItems.length; i++) {
			const item = this.currentItems[i];
			item.setBounds(i * size, 0, size, this.bh);
		}
	}
}

