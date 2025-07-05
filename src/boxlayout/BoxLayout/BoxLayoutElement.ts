import { TabGroup } from "./TabGroup";
import { TabGroupEvent } from "./EventType";


export class BoxLayoutElement {


	public parentContainer = null;

	public x = 0;
	public y = 0;


	private _width = 0;
	get width() {
		return this._width;
	}

	set width(width) {
		this._width = width;
		this._explicitWidth = width;
	}

	private _height = 0;

	get height() {
		return this._height;
	}

	set height(height) {
		this._height = height;
		this._explicitHeight = height;
	}

	private _explicitWidth = 0;
	get explicitWidth() {
		return this._explicitWidth;
	}

	private _explicitHeight = 0;
	get explicitHeight() {
		return this._explicitHeight;
	}

	get minWidth() {
		return this.render.minWidth;
	}

	get minHeight() {
		return this.render.minHeight;
	}

	private _ownerLayout = null;
	get ownerLayout() {
		return this._ownerLayout;
	}

	set ownerLayout(v) {
		if (this._ownerLayout !== v && v) {
			this._ownerLayout = v;
			this.onOwnerLayoutChange();
		}
	}


	get priorityLevel() {
		let level = 0;
		const panels = this.render.panels;
		for (let i = 0; i < panels.length; i++) {
			level = Math.max(level, panels[i].priorityLevel);
		}
		return level;
	}

	set priorityLevel(v) {

	}


	protected _render = null;
	get render() {
		return this._render;
	}

	private _maximized = false;

	constructor() {
		this._render = new TabGroup();
		this._render.ownerElement = this;
		this._render.on(TabGroupEvent.PANEL_ADDED, this.panelHandler, this);
	}

	onOwnerLayoutChange() {
		if (this._ownerLayout) {
			this.render.titleRenderFactory = this._ownerLayout.config.titleRenderFactory;
		}
	}

	setMaxSize(maxSize) {
		this._maximized = maxSize;
		this.updateDisplayIndex();
	}

	panelHandler(e) {
		this.updateDisplayIndex();
	}

	updateDisplayIndex() {
		const tabBarZ = this._maximized ? 4 : 1;
		const panelZ = this._maximized ? 3 : 0;
		this.render.tabBar.root.style.zIndex = tabBarZ.toString();
		this.render.panels.forEach((panel) => {
			panel.root.style.zIndex = panelZ.toString();
		});
	}

	setLayoutSize(width, height) {
		this._width = width;
		this._height = height;
	}

	updateRenderDisplay() {
		this.render.setBounds(this.x, this.y, this.width, this.height);
	}
}
