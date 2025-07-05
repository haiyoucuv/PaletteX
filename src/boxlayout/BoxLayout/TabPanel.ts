import { BoxLayout } from "./BoxLayout";
import { IRender } from "./Interface";
import { TabGroup } from "./TabGroup";
import { TabPanelEvent } from "./EventType";
import { TabPanelFocusManager } from "./TabPanelFocusManager";

import { IEventEmitter, EventEmitter } from "@/Common/EventEmitter";

export interface ITabPanel extends IRender, IEventEmitter {
	ownerGroup: TabGroup;
	ownerLayout: BoxLayout;
	_visible: boolean;
	_hold: boolean;
	priorityLevel: number;

	getId(): string;

	getTitle(): string;

	getIcon(): string;

	isFocus(): boolean;

	focus(): void;
	_focusIn(): void;
	_focusOut(): void;
	getHeaderRender(): IRender;
}
export interface ITitleRender extends IRender {
	panel: ITabPanel;
	selected: boolean;
	getBounds(): {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	updateDisplay(): void;
}
export interface ITitleRenderFactory {
	createTitleRender(): ITitleRender;
}

export class TabPanel extends EventEmitter {
	private borderStyle_FocusIn: string;
	private borderStyle_FocusOut: string;
	private _minWidth: number;
	private _minHeight: number;
	private _icon: string;
	private __visible: boolean;
	private _priorityLevel: number;
	private __hold: boolean;
	private isFirst: boolean;
	private _root: HTMLDivElement;
	private bw: number;
	private bh: number;
	private _ownerGroup: any;
	private container: any;
	private _title: any;
	private _id: any;

	constructor() {
		super();
		this.borderStyle_FocusIn = '2px solid #313e4c';
		this.borderStyle_FocusOut = '2px solid #29323b';
		this._minWidth = 50;
		this._minHeight = 50;
		this._icon = "";
		this.__visible = false;
		this._priorityLevel = 0;
		this.__hold = false;
		this.isFirst = true;
		this._root = document.createElement('div');
		this._root.style.position = "absolute";
		this._root.style.overflow = 'hidden';
		this._root.style.outline = 'none';
		this._root.style.zIndex = '0';
		this._root.style.display = 'none';
		this._root.tabIndex = 0;
		this.updateClassName();
		TabPanelFocusManager.push(this);
	}

	get minWidth() {
		return this._minWidth;
	}

	set minWidth(v) {
		this._minWidth = v;
	}


	get minHeight() {
		return this._minHeight;
	}

	set minHeight(v) {
		this._minHeight = v;
	}

	get ownerGroup() {
		return this._ownerGroup;
	}

	set ownerGroup(v) {
		this._ownerGroup = v;
	}

	get ownerLayout() {
		if (this._ownerGroup)
			return this._ownerGroup.ownerLayout;
		return null;
	}

	get _visible() {
		return this.__visible;
	}

	set _visible(v) {
		if (this.__visible !== v) {
			this.doSetVisible(v);
		}
	}

	get priorityLevel() {
		return this._priorityLevel;
	}

	set priorityLevel(v) {
		this._priorityLevel = v;
	}

	get root() {
		return this._root;
	}

	getHeaderRender() {
		return null;
	}

	isFocus() {
		return TabPanelFocusManager.currentFocus === this;
	}

	focus() {
		this.ownerGroup.selectedPanel = this;
	}

	_focusIn() {
		this.updateClassName(true);
		this.emit(TabPanelEvent.FOCUSIN, this);
	}

	_focusOut() {
		this.updateClassName();
		this.emit(TabPanelEvent.FOCUSOUT, this);
	}

	/**视图保持
	 * (此值为了再对面板进行某些操作时不频繁的移除、添加UI，比如解决了Iframe面板移动时刷新的问题等等))
	 */
	get _hold() {
		return this.__hold;
	}

	set _hold(v) {
		this.__hold = v;
	}

	render(container) {
		if (!this._hold) {
			this.container = container;
			this.container.appendChild(this.root);
			if (this.isFirst) {
				this.isFirst = false;
				this.renderContent(this._root);
			}
		}
	}

	removeFromParent() {
		if (!this._hold) {
			this.root.remove();
		}
	}

	setBounds(x, y, width, height) {
		if (this.bw !== width || this.bh !== height) {
			this.root.style.width = width + 'px';
			this.root.style.height = height + 'px';
			this.bw = width;
			this.bh = height;
			this.resize(width, height);
		}
		this.root.style.left = x + 'px';
		this.root.style.top = y + 'px';
	}

	/**
	 * 刷新
	 */
	refresh() {
		this.emit(TabPanelEvent.REFRESH);
	}

	renderContent(container) {
		//子代重写实现自定义内容
	}

	resize(newWidth, newHeight) {
		//子代重写做相关处理
	}

	updateClassName(focus = false) {
		let name = "";
		if (this._id) {
			name = "tab-panel " + this._id;
		} else {
			name = "tab-panel";
		}
		if (focus) {
			name += " tab-panel-focus";
		}
		this._root.className = name;
	}

	getId() {
		return this._id;
	}

	setId(v) {
		this._id = v;
		this.updateClassName();
	}

	getTitle() {
		return this._title;
	}

	setTitle(v) {
		if (this._title !== v) {
			this._title = v;
			this.refresh();
		}
	}

	getIcon() {
		return this._icon;
	}

	setIcon(v) {
		if (this._icon !== v) {
			this._icon = v;
			this.refresh();
		}
	}

	doSetVisible(v) {
		this.__visible = v;
		this.root.style.display = v ? '' : 'none';
	}

}
