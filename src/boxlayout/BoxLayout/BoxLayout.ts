import { BoxLayoutContainer } from "./BoxLayoutContainer";
import { BoxLayoutElement } from "./BoxLayoutElement";
import { BoxLayoutEvent, DragEvent, TabGroupEvent } from "./EventType";
import { DocumentElement } from "./DocumentElement";
import { DragArea } from "./DragArea";
import { HtmlElementResizeHelper } from "./Helper";
import { LayoutConfig } from "./LayoutConfig";
import { Mask } from "./Mask";
import { MatrixUtil } from "./MatrixUtil";
import { PlaceholderPanel } from "./PlaceholderPanel";
import { Point } from "./Point";
import { Rectangle } from "./Rectangle";
import { TabPanel } from "./TabPanel";
import { TabPanelFocusManager } from "./TabPanelFocusManager";

import { EventEmitter } from "./EventEmitter";

export class BoxLayout extends EventEmitter {
	private cursorLock: boolean;
	private startMouseP: Point;
	private startSize: Point;
	private closePanelInfoCache;
	private panelDic;
	private dragAreaElement: DragArea;
	private maskElement: Mask;
	private _area: HTMLDivElement;


	private _rootLayoutElement: any;
	private cacheWidth: number;
	private cacheHeight: number;
	private targetContainer: any;
	private acceptTarget: any;
	private dragInfo: any;

	get rootLayoutElement() {
		return this._rootLayoutElement;
	}


	private _layoutConfig: any;

	get config() {
		return this._layoutConfig;
	}

	private _gap;

	get gap() {
		return this._gap;
	}

	set gap(v) {
		this._gap = v;
	}


	private _maxSizeElement: any;
	get maxSizeElement() {
		return this._maxSizeElement;
	}

	constructor() {
		super();

		this._gap = 1;
		this.cursorLock = false;
		this.startMouseP = new Point();
		this.startSize = new Point();

		// 面板信息缓存相关
		this.closePanelInfoCache = {};

		this.panelDic = {};
		this.dragAreaElement = new DragArea();
		this.maskElement = new Mask();
	}


	/**
	 * 初始化盒式布局
	 */
	init(area, config?) {
		this._area = document.createElement('div');
		area.appendChild(this._area);
		this._area.className = 'split-line';
		this._area.style.position = 'relative';
		this._area.style.zIndex = '0';
		this._area.style.overflow = 'hidden';
		this._area.style.width = '100%';
		this._area.style.height = '100%';
		HtmlElementResizeHelper.watch(this._area);
		this._area.addEventListener("resize", this.containerResizeHandle);
		this._layoutConfig = new LayoutConfig();
		if (config) {
			for (const key in config) {
				this._layoutConfig[key] = config[key];
			}
		}
	}

	/**
	 * 获取激活的选项卡组
	 */
	getActiveTabGroup() {
		let activeTabGroup = TabPanelFocusManager.getActiveGroup(this);
		if (!activeTabGroup || !activeTabGroup.ownerLayout) {
			activeTabGroup = this.getFirstElement(this.rootLayoutElement).render;
		}
		return activeTabGroup;
	}


	/**
	 * 获取激活的面板
	 */
	getActivePanel() {
		const panel = TabPanelFocusManager.currentFocus;
		if (panel && panel.ownerLayout) {
			return panel;
		}
		return null;
	}

	/**
	 * 添加一个元素到跟节点
	 * @param element 要添加的元素
	 * @param position 位置
	 */
	addBoxElementToRoot(element, position = "right") {
		if (!this.rootLayoutElement) {
			this._setMaxSize(null);
			this._rootLayoutElement = element;
			this.addToArea(this.rootLayoutElement);
			this.updateBoxElement();
			return;
		}
		this.addBoxElement(this.rootLayoutElement, element, position);
	}


	/**
	 * 添加一个元素到另一个元素的旁边
	 * @param target 目标元素
	 * @param element 要添加的元素
	 * @param position 位置
	 */
	addBoxElement(target, element, position) {
		let panels;
		if (position === void 0) {
			position = "right";
		}
		if (target === element || element === this.rootLayoutElement) {
			return;
		}
		this._setMaxSize(null);
		//如果target为element的父级，那么在删除element的时候target的另一个子元素将占据target的位置，这里需要重新指定target
		if (element.parentContainer === target) {
			if (element === element.parentContainer.firstElement) {
				target = element.parentContainer.secondElement;
			} else {
				target = element.parentContainer.firstElement;
			}
		}
		//
		if (element.ownerLayout === target.ownerLayout) {
			panels = [];
			this.getAllPanel(element, panels);
			panels.forEach((panel) => {
				panel._hold = true;
			});
		}
		//
		this.removeBoxElement(element);
		const newBox = new BoxLayoutContainer();
		newBox.gap = this.gap;
		switch (position) {
			// @ts-ignore
			case "bottom":
				newBox.isVertical = true;
			case "right":
				newBox.secondElement = element;
				break;

			// @ts-ignore
			case "top":
				newBox.isVertical = true;
			case "left":
				newBox.firstElement = element;
				break;
		}
		element.parentContainer = newBox;
		this.addToArea(newBox); //这里只添加新创建的元素，此刻target并没有链接到newBox中
		//
		if (element.ownerLayout === target.ownerLayout) {
			panels = [];
			this.getAllPanel(element, panels);
			panels.forEach((panel) => {
				panel._hold = false;
			});
		}
		//
		if (target === this.rootLayoutElement) {
			this._rootLayoutElement = newBox;
		} else {
			if (target === target.parentContainer.firstElement) {
				target.parentContainer.firstElement = newBox;
			} else {
				target.parentContainer.secondElement = newBox;
			}
			newBox.parentContainer = target.parentContainer;
		}
		////-----此段代码为了矫正尺寸增强交互体验，但不应该放在这里，应该融入布局机制中，暂时写在这
		newBox.width = target.width;
		newBox.height = target.height;
		element.width = target.width / 2;
		element.height = target.height / 2;
		target.width = target.width / 2;
		target.height = target.height / 2;
		////-----
		target.parentContainer = newBox;
		switch (position) {
			case "bottom":
			case "right":
				newBox.firstElement = target;
				break;
			case "top":
			case "left":
				newBox.secondElement = target;
				break;
		}
		this.updateBoxElement();
	}

	/**
	 * 删除一个元素
	 * @param element 要删除的元素
	 */
	removeBoxElement(element) {
		if (!element.ownerLayout || element === this.rootLayoutElement) {
			return;
		}
		this._setMaxSize(null);
		//获取平级的另一个节点
		const parent = element.parentContainer;
		let anotherElement; //此节点会被挂接到新的节点上面
		let needUpdateElement;
		if (element === parent.firstElement) {
			anotherElement = parent.secondElement;
			parent.secondElement = null; //断开与anotherElement的链接
		} else {
			anotherElement = parent.firstElement;
			parent.firstElement = null; //断开与anotherElement的链接
		}
		if (parent === this.rootLayoutElement) {
			this._rootLayoutElement = anotherElement;
			anotherElement.parentContainer = null;
			needUpdateElement = anotherElement;
			this.rootLayoutElement.x = 0;
			this.rootLayoutElement.y = 0;
		} else {
			if (parent === parent.parentContainer.firstElement) {
				parent.parentContainer.firstElement = anotherElement;
			} else {
				parent.parentContainer.secondElement = anotherElement;
			}
			anotherElement.parentContainer = parent.parentContainer;
			needUpdateElement = anotherElement.parentContainer;
		}
		////-----此段代码为了矫正尺寸增强交互体验，但不应该放在这里，应该融入布局机制中，暂时写在这
		anotherElement.width = parent.width;
		anotherElement.height = parent.height;
		////----
		this.removeFromArae(parent); //此刻已断开与anotherElement的链接，所以anotherElement的render并没有被移除
		this._updateBoxElement(needUpdateElement);
	}

	addToArea(element) {
		if (element) {
			element.ownerLayout = this;
			if (element instanceof BoxLayoutContainer) {
				element.separator.render(this._area);
				this.attachSeparatorOperateEvent(element.separator.root);
				this.addToArea(element.firstElement);
				this.addToArea(element.secondElement);
			} else {
				element.render.render(this._area);
				element.render.on(DragEvent.STARTDRAG, this.dragHandle, this);
				element.render.on(TabGroupEvent.FOCUS_CHANGED, this.panelHandle, this);
				element.render.on(TabGroupEvent.PANEL_REMOVING, this.panelHandle, this);
				element.render.on(TabGroupEvent.PANEL_ADDED, this.panelHandle, this);
				element.render.on(TabGroupEvent.PANEL_REMOVED, this.panelHandle, this);
				element.render.on(TabGroupEvent.PANEL_DRAG, this.panelHandle, this);
			}
		}
	}

	removeFromArae(element) {
		if (element) {
			if (element instanceof BoxLayoutContainer) {
				element.separator.removeFromParent();
				this.detachSeparatorOperateEvent(element.separator.root);
				this.removeFromArae(element.firstElement);
				this.removeFromArae(element.secondElement);
			} else {
				element.render.removeFromParent();
				element.render.off(DragEvent.STARTDRAG, this.dragHandle, this);
				element.render.off(TabGroupEvent.FOCUS_CHANGED, this.panelHandle, this);
				element.render.off(TabGroupEvent.PANEL_REMOVING, this.panelHandle, this);
				element.render.off(TabGroupEvent.PANEL_ADDED, this.panelHandle, this);
				element.render.off(TabGroupEvent.PANEL_REMOVED, this.panelHandle, this);
				element.render.off(TabGroupEvent.PANEL_DRAG, this.panelHandle, this);
			}
			element.ownerLayout = null;
		}
	}

	/**设置最大化元素
	 * 设置为null取消最大化
	 */
	setMaxSize(v) {
		this._setMaxSize(v);
		this.updateBoxElement();
	}

	_setMaxSize(v) {
		if (this._maxSizeElement) {
			this._maxSizeElement.setMaxSize(false);
			this._maxSizeElement.width = this.cacheWidth;
			this._maxSizeElement.height = this.cacheHeight;
		}
		this._maxSizeElement = v;
		if (this._maxSizeElement) {
			this._maxSizeElement.setMaxSize(true);
			this.cacheWidth = this._maxSizeElement.width;
			this.cacheHeight = this._maxSizeElement.height;
		}
	}

	/**
	 * 获取文档元素
	 */
	getDocumentElement() {
		const all = [];
		this.getAllChildElement(this.rootLayoutElement, all);
		for (let i = 0; i < all.length; i++) {
			if (all[i] instanceof DocumentElement) {
				return all[i];
			}
		}
		return null;
	}

	updateBoxElement() {
		const element = this.maxSizeElement ? this.maxSizeElement : this.rootLayoutElement;
		element.x = 0;
		element.y = 0;
		element.width = this._area.offsetWidth;
		element.height = this._area.offsetHeight;
		this._updateBoxElement(element);
	}

	_updateBoxElement(element) {
		element.updateRenderDisplay();
	}

	containerResizeHandle = (e) => {
		if (this.rootLayoutElement) {
			this.updateBoxElement();
		}
	}

	attachSeparatorOperateEvent(element) {
		element.addEventListener("mouseenter", this.separatorHandle);
		element.addEventListener("mouseleave", this.separatorHandle);
		element.addEventListener("mousedown", this.separatorHandle);
	}

	detachSeparatorOperateEvent(element) {
		element.removeEventListener("mouseenter", this.separatorHandle);
		element.removeEventListener("mouseleave", this.separatorHandle);
		element.removeEventListener("mousedown", this.separatorHandle);
	}

	separatorHandle = (e) => {
		const container = e.currentTarget["__owner"];
		switch (e.type) {
			case "mouseenter":
				if (!this.cursorLock) {
					if (container.isVertical) {
						this._area.style.cursor = "row-resize";
					} else {
						this._area.style.cursor = "col-resize";
					}
				}
				break;
			case "mouseleave":
				if (!this.cursorLock) {
					this._area.style.cursor = "default";
				}
				break;
			case "mousedown":
				this.cursorLock = true;
				this.startMouseP.x = e.clientX;
				this.startMouseP.y = e.clientY;
				this.startSize.x = container.lockElement.width;
				this.startSize.y = container.lockElement.height;
				this.targetContainer = container;
				window.addEventListener("mouseup", this.separatorHandle, true);
				window.addEventListener("mousemove", this.separatorHandle, true);
				break;
			case "mousemove":
				e.stopPropagation();
				e.preventDefault();
				const vx = e.clientX - this.startMouseP.x;
				const vy = e.clientY - this.startMouseP.y;
				if (this.targetContainer.isVertical) {
					if (this.targetContainer.lockElement === this.targetContainer.firstElement) {
						this.targetContainer.lockElement.height = this.startSize.y + vy;
					} else {
						this.targetContainer.lockElement.height = this.startSize.y - vy;
					}
					this._updateBoxElement(this.targetContainer);
					this.targetContainer.lockElement.height = this.targetContainer.lockElement.height;
				} else {
					if (this.targetContainer.lockElement === this.targetContainer.firstElement) {
						this.targetContainer.lockElement.width = this.startSize.x + vx;
					} else {
						this.targetContainer.lockElement.width = this.startSize.x - vx;
					}
					this._updateBoxElement(this.targetContainer);
					this.targetContainer.lockElement.width = this.targetContainer.lockElement.width;
				}
				break;
			case "mouseup":
				e.stopPropagation();
				e.preventDefault();
				this.cursorLock = false;
				this._area.style.cursor = "default";
				window.removeEventListener("mousemove", this.separatorHandle, true);
				window.removeEventListener("mouseup", this.separatorHandle, true);
				break;
		}
	}

	panelHandle(e) {
		switch (e.type) {
			case TabGroupEvent.FOCUS_CHANGED:
				this.emit(BoxLayoutEvent.FOCUS_CHANGED, e.data);
				break;
			case TabGroupEvent.PANEL_REMOVING:
				if (this.emit(BoxLayoutEvent.PANEL_REMOVING, e.data)) {
					this.cachePanelInfo(e.data['panel'], e.data['tabGroup']);
				} else {
					e.stopPropagation();
				}
				break;
			case TabGroupEvent.PANEL_REMOVED:
				this.emit(BoxLayoutEvent.PANEL_REMOVED, e.data);
				//当一个布局的所有panel都移除后清除焦点panel
				const panels = [];
				this.getAllPanel(this.rootLayoutElement, panels);
				if (panels.length === 0) {
					TabPanelFocusManager.focus(null);
					this.emit(BoxLayoutEvent.FOCUS_CHANGED);
				}
				break;
			case TabGroupEvent.PANEL_ADDED:
				this.emit(BoxLayoutEvent.PANEL_ADDED, e.data);
				break;
			case TabGroupEvent.PANEL_DRAG:
				this.emit(BoxLayoutEvent.PANEL_DRAG, e.data);
				break;
		}
	}

	cachePanelInfo(panel, group) {
		const link = [];
		this.getDirLink(group.ownerElement, link);
		this.closePanelInfoCache[panel.getId()] = link;
	}

	getOldSpace(panelId) {
		const link = this.closePanelInfoCache[panelId];
		if (link) {
			let element = this.getElementByLink(link);
			if (element && !(element instanceof DocumentElement)) {
				return element.render;
			}
			const dir = link.pop();
			element = this.getElementByLink(link);
			if (!element && link.length === 0) {
				element = this.rootLayoutElement;
			}
			if (element) {
				const newElement = new BoxLayoutElement();
				this.addBoxElement(element, newElement, dir);
				return newElement.render;
			}
		}
		return null;
	}

	getDirLink(element, result) {
		const parent = element.parentContainer;
		if (parent) {
			const isFirst = parent.firstElement === element;
			const isVertical = parent.isVertical;
			if (isFirst && isVertical) {
				result.splice(0, 0, "top");
			} else if (!isFirst && isVertical) {
				result.splice(0, 0, "bottom");
			} else if (isFirst && !isVertical) {
				result.splice(0, 0, "left");
			} else if (!isFirst && !isVertical) {
				result.splice(0, 0, "right");
			}
			this.getDirLink(parent, result);
		}
	}

	getElementByLink(link) {
		if (link.length === 0)
			return null;
		let currentElement = this.rootLayoutElement;
		for (let i = 0; i < link.length; i++) {
			switch (link[i]) {
				case "top":
					if (currentElement instanceof BoxLayoutContainer && currentElement.isVertical === true) {
						currentElement = currentElement.firstElement;
					} else {
						return null;
					}
					break;
				case "bottom":
					if (currentElement instanceof BoxLayoutContainer && currentElement.isVertical === true) {
						currentElement = currentElement.secondElement;
					} else {
						return null;
					}
					break;
				case "left":
					if (currentElement instanceof BoxLayoutContainer && currentElement.isVertical === false) {
						currentElement = currentElement.firstElement;
					} else {
						return null;
					}
					break;
				case "right":
					if (currentElement instanceof BoxLayoutContainer && currentElement.isVertical === false) {
						currentElement = currentElement.secondElement;
					} else {
						return null;
					}
					break;
			}
		}
		if (currentElement === this.rootLayoutElement) {
			return null;
		}
		return currentElement;
	}

	dragHandle(e) {
		switch (e.type) {
			case DragEvent.STARTDRAG:
				this.dragInfo = e.data;
				this.acceptTarget = null;
				this.attachDragEvent();
				this.maskElement.render(this._area);
				this.maskElement.setBounds(this.rootLayoutElement.x, this.rootLayoutElement.y, this.rootLayoutElement.width, this.rootLayoutElement.height);
				break;
		}
	}

	attachDragEvent() {
		window.addEventListener("mousemove", this.dragEventHandle, false);
		window.addEventListener("mouseup", this.dragEventHandle, true);
	}

	detachDragEvent() {
		window.removeEventListener("mousemove", this.dragEventHandle, false);
		window.removeEventListener("mouseup", this.dragEventHandle, true);
	}

	dragEventHandle = (e) => {
		e.stopPropagation();
		e.preventDefault();
		switch (e.type) {
			case "mousemove":
				if (!this.dragAreaElement.root.parentElement) {
					this.dragAreaElement.render(document.body);
				}
				const dragRender = this.getOneDragRenderWithMouseEvent(e);
				if (dragRender) {
					this.acceptTarget = dragRender.adjustDragInfo(e, this.dragInfo) ? dragRender : null;
				} else {
					//如果没有dragRender则可能鼠标超出布局范围
				}
				this.dragAreaElement.setBounds(this.dragInfo.dragRange.x, this.dragInfo.dragRange.y, this.dragInfo.dragRange.width, this.dragInfo.dragRange.height);
				break;
			case "mouseup":
				this.detachDragEvent();
				this.dragAreaElement.removeFromParent();
				this.maskElement.removeFromParent();
				if (this.acceptTarget) {
					this.acceptTarget.acceptDragInfo(this.dragInfo);
				}
				break;
		}
	}

	getOneDragRenderWithMouseEvent(e) {
		function getAllElementRange(element, result) {
			if (element) {
				if (element instanceof BoxLayoutContainer) {
					getAllElementRange(element.firstElement, result);
					getAllElementRange(element.secondElement, result);
				} else {
					result.push({
						range: new Rectangle(element.x, element.y, element.width, element.height),
						target: element
					});
				}
			}
		}

		const localP = MatrixUtil.globalToLocal(this._area, new Point(e.clientX, e.clientY));
		const allRange = [];
		getAllElementRange(this.rootLayoutElement, allRange);
		for (let i = 0; i < allRange.length; i++) {
			if (allRange[i].range.containsPoint(localP)) {
				return allRange[i].target.render;
			}
		}
		return null;
	}


	/**
	 * 分割条操作逻辑
	 */
	getAllChildElement(element, result) {
		if (element) {
			if (element instanceof BoxLayoutContainer) {
				this.getAllChildElement(element.firstElement, result);
				this.getAllChildElement(element.secondElement, result);
			} else {
				result.push(element);
			}
		}
	}

	/**注册面板
	 * 与面板ID相关的api会用到注册信息
	 */
	registPanel(panel) {
		this.panelDic[panel.getId()] = panel;
	}

	/**根据ID获取一个已注册的面板 */
	getRegistPanelById(id) {
		return this.panelDic[id];
	}

	/**
	 * 根据Id打开一个面板
	 * @param panelId 面板ID
	 * @param oldSpace 是否尝试在原来的区域打开，如果布局发生较大的变化可能出现原始位置寻找错误的情况，打开默认为false
	 */
	openPanelById(panelId, oldSpace = false) {
		const panel = this.getRegistPanelById(panelId);
		if (!panel) {
			throw new Error("ID为 " + panelId + " 的面板未注册");
		}
		if (!this.rootLayoutElement) {
			this.addBoxElementToRoot(new BoxLayoutElement());
		}
		const all = [];
		this.getAllChildElement(this.rootLayoutElement, all);
		for (let i = 0; i < all.length; i++) {
			if (!(all[i] instanceof DocumentElement)) {
				const group = all[i].render;
				for (let k = 0; k < group.panels.length; k++) {
					if (group.panels[k].getId() === panelId) {
						group.selectedIndex = k;
						return;
					}
				}
			}
		}
		if (oldSpace) {
			//寻找原始位置添加面板
			const oldSpaceGroup = this.getOldSpace(panel.getId());
			if (oldSpaceGroup) {
				this.setHoldValue([oldSpaceGroup], true);
				oldSpaceGroup.addPanel(panel);
				this.setHoldValue([oldSpaceGroup], false);
				if (oldSpaceGroup.ownerElement !== this.maxSizeElement) {
					this.setMaxSize(null);
				}
				return;
			}
		}
		//未发现原始位置则在当前激活组打开
		const activeTabGroup = this.getActiveTabGroup();
		if (activeTabGroup) {
			this.setHoldValue([activeTabGroup], true);
			activeTabGroup.addPanel(panel);
			this.setHoldValue([activeTabGroup], false);
			return;
		}
		//未发现原始位置则选择一个合适的元素添加面板
		if (this.rootLayoutElement instanceof DocumentElement) {
			this.addBoxElementToRoot(new BoxLayoutElement());
		}
		let element = this.getFirstElement(this.rootLayoutElement);
		if (!element || element instanceof DocumentElement) {
			element = this.getSecondElement(this.rootLayoutElement);
		}
		if (element) {
			this.setHoldValue([element.render], true);
			element.render.addPanel(panel);
			this.setHoldValue([element.render], true);
		}
	}

	/**
	 * 根据Id关闭一个面板
	 * @param panelId 面板ID
	 */
	closePanelById(panelId) {
		const panel = this.getRegistPanelById(panelId);
		if (!panel) {
			throw new Error("ID为 " + panelId + " 的面板未注册");
		}
		const all = [];
		this.getAllChildElement(this.rootLayoutElement, all);
		for (let i = 0; i < all.length; i++) {
			if (!(all[i] instanceof DocumentElement)) {
				const group = all[i].render;
				this.setHoldValue([group], true);
				let targetPanel = void 0;
				for (let k = 0; k < group.panels.length; k++) {
					if (group.panels[k].getId() === panelId) {
						targetPanel = group.panels[k];
						group.panels[k]._hold = false;
						group.removePanel(group.panels[k]);
						break;
					}
				}
				this.setHoldValue([group], false);
				if (group.panels.length === 0) {
					group.ownerElement.ownerLayout.removeBoxElement(group.ownerElement);
				}
			}
		}
	}

	/**获取所有已打开的面板 */
	getAllOpenPanels() {
		const result = [];
		this.getAllChildElement(this.rootLayoutElement, result);
		let panels = [];
		result.forEach((element) => {
			if (!(element instanceof DocumentElement)) {
				panels = panels.concat(element.render.panels);
			}
		});
		return panels;
	}

	/**检查某个面板是否打开 */
	checkPanelOpenedById(panelId) {
		const panels = this.getAllOpenPanels();
		for (let i = 0; i < panels.length; i++) {
			if (panels[i].getId() === panelId) {
				return true;
			}
		}
		return false;
	}

	/**获取所有的选项卡组 */
	getAllTabGroup() {
		const all = [];
		this.getAllChildElement(this.rootLayoutElement, all);
		const result = [];
		for (let i = 0; i < all.length; i++) {
			if (!(all[i] instanceof DocumentElement)) {
				result.push(all[i].render);
			}
		}
		return result;
	}

	getFirstElement(element) {
		if (element instanceof BoxLayoutContainer) {
			return this.getFirstElement(element.firstElement);
		}
		return element;
	}

	getSecondElement(element) {
		if (element instanceof BoxLayoutContainer) {
			return this.getFirstElement(element.secondElement);
		}
		return element;
	}

	setHoldValue(groups, value) {
		groups.forEach((group) => {
			group.panels.forEach((panel) => {
				panel._hold = value;
			});
		});
	}


	/**
	 *  获取面板所在的布局元素
	 * @param panelId 面板ID
	 */
	getElementByPanelId(panelId) {
		if (!this.rootLayoutElement) {
			return null;
		}
		const all = [];
		this.getAllChildElement(this.rootLayoutElement, all);
		for (let i = 0; i < all.length; i++) {
			const group = all[i].render;
			for (let k = 0; k < group.panels.length; k++) {
				if (group.panels[k].getId() === panelId) {
					return all[i];
				}
			}
		}
		return null;
	}


	/**
	 * 根据布局配置立刻重新布局所有元素
	 * @param config
	 */
	applyLayoutConfig(config) {
		const needRemoveList = [];
		const praseConfig = (node) => {

			const {
				type, isVertical, layoutInfo,
				render, firstElement, secondElement,
				bounds: { x, y, width, height },
			} = node;

			let element;

			switch (type) {
				case "BoxLayoutContainer":
					element = new BoxLayoutContainer();
					element.gap = this.gap;
					element.isVertical = isVertical;
					element.x = x;
					element.y = y;
					element.width = width;
					element.height = height;
					element.firstElement = praseConfig(firstElement);
					element.firstElement.parentContainer = element;
					element.secondElement = praseConfig(secondElement);
					element.secondElement.parentContainer = element;
					break;
				case 'DocumentElement':
					element = new DocumentElement();
					element.x = x;
					element.y = y;
					element.width = width;
					element.height = height;
					const documentLayout = element.render.layout;
					//将外部布局配置的documentPanelSerialize赋值给文档布局的panelSerialize，完成文档区域面板的反序列化
					documentLayout.config.panelSerialize = this.config.documentPanelSerialize;
					documentLayout.applyLayoutConfig(layoutInfo);
					break;
				case "BoxLayoutElement":
					element = new BoxLayoutElement();
					element.x = x;
					element.y = y;
					element.width = width;
					element.height = height;
					const panels = [];
					for (let i = 0; i < render.panels.length; i++) {
						const panelInfo = render.panels[i];
						let panel: TabPanel = this.config.panelSerialize.unSerialize(this, panelInfo);
						//如果没有panel则用占位面板填充原来的位置，稍后删除
						if (!panel) {
							panel = new PlaceholderPanel();
							needRemoveList.push(panel);
						}
						panels.push(panel);
					}
					element.render.panels = panels;
					element.render.selectedIndex = render.selectedIndex;
					break;
			}
			return element;
		};
		//重置焦点管理
		TabPanelFocusManager.reSet();
		const element = praseConfig(config);
		const newPanels = [];
		this.getAllPanel(element, newPanels);
		const oldPanels = [];
		if (this.rootLayoutElement)
			this.getAllPanel(this.rootLayoutElement, oldPanels);
		const samePanels = [];
		for (let i = 0; i < newPanels.length; i++) {
			for (let k = 0; k < oldPanels.length; k++) {
				if (newPanels[i] === oldPanels[k]) {
					samePanels.push(newPanels[i]);
					newPanels[i]._hold = true;
				}
			}
		}
		if (this.rootLayoutElement) {
			this.removeFromArae(this.rootLayoutElement);
			this._rootLayoutElement = null;
		}
		this.addBoxElementToRoot(element);
		samePanels.forEach((panel) => {
			panel._hold = false;
		});
		//删除丢失的panel
		needRemoveList.forEach((panel) => {
			panel.ownerGroup.removePanel(panel);
		});
	}

	getAllPanel(element, result) {
		if (element instanceof BoxLayoutContainer) {
			this.getAllPanel(element.firstElement, result);
			this.getAllPanel(element.secondElement, result);
		} else if (!(element instanceof DocumentElement)) {
			const panels = element.render.panels;
			panels.forEach((panel) => {
				result.push(panel);
			});
		}
	}

	/**
	 * 获取当前布局信息
	 */
	getLayoutConfig() {
		const getConfig = (element) => {
			const config = {};
			if (element instanceof BoxLayoutContainer) {
				config["type"] = "BoxLayoutContainer";
				config["isVertical"] = element.isVertical;
				config["bounds"] = { x: element.x, y: element.y, width: element.width, height: element.height };
				config["firstElement"] = getConfig(element.firstElement);
				config["secondElement"] = getConfig(element.secondElement);
			} else if (element instanceof DocumentElement) {
				config["type"] = "DocumentElement";
				config["bounds"] = { x: element.x, y: element.y, width: element.width, height: element.height };
				const documentLayout = element.render.layout;
				//将外部布局配置的documentPanelSerialize赋值给文档布局的panelSerialize，完成文档区域面板的序列化
				documentLayout.config.panelSerialize = this.config.documentPanelSerialize;
				config['layoutInfo'] = documentLayout.getLayoutConfig();
			} else {
				config["type"] = "BoxLayoutElement";
				config["bounds"] = { x: element.x, y: element.y, width: element.width, height: element.height };
				const renderConfig = {};
				const group = element.render;
				renderConfig["selectedIndex"] = group.selectedIndex;
				renderConfig["panels"] = [];
				for (let i = 0; i < group.panels.length; i++) {
					const panelInfo = this.config.panelSerialize.serialize(this, group.panels[i]);
					renderConfig["panels"].push(panelInfo);
				}
				config["render"] = renderConfig;
			}
			return config;
		};
		if (this.rootLayoutElement) {
			return getConfig(this.rootLayoutElement);
		}
		return null;
	}
}
