import { TabPanel } from "./TabPanel";

class DefaultTitleRender{
	private minHeight: number = 0;
	private minWidth: number = 0;
	private _selected: boolean = false;

	private _root: HTMLDivElement;
	private iconElement: HTMLImageElement;
	private titleElement: HTMLDivElement;
	private container: HTMLElement;
	private _panel: TabPanel;
	private bx: number = 0;
	private by: number = 0;
	private bw: number = 0;
	private bh: number = 0;

	constructor() {
		this._root = document.createElement('div');
		this._root.style.overflow = "hidden";
		this._root.style.display = "flex";
		this._root.style.padding = "0px 6px";
		this.iconElement = document.createElement('img');
		this.iconElement.className = "tabbar-item-icon";
		this.iconElement.style.marginRight = "6px";
		this.iconElement.style.flexGrow = "1";
		this.iconElement.style.pointerEvents = "none";
		this.iconElement.style.alignSelf = 'center';
		this._root.appendChild(this.iconElement);
		this.titleElement = document.createElement('div');
		this.titleElement.className = 'tabbar-item-title';
		this.titleElement.style.whiteSpace = "nowrap";
		this.titleElement.style.textOverflow = "ellipsis";
		this.titleElement.style.overflow = "hidden";
		this._root.appendChild(this.titleElement);
		this.updateClassName();
		this.updateTitleElementClassName();
	}

	get root(){
		return this._root;
	}


	get panel(){
		return this._panel;
	}

	set panel(v){
		this._panel = v;
		this.updateDisplay();
	}

	get selected(){
		return this._selected;
	}

	set selected(v){
		this._selected = v;
		this.updateDisplay();
	}
	render(container) {
		this.container = container;
		this.container.appendChild(this.root);
	}
	removeFromParent () {
		this.root.remove();
	}

	updateDisplay  () {
		this.titleElement.textContent = this._panel.getTitle();
		const iconSrc = this._panel.getIcon();
		this.iconElement.src = iconSrc;
		if (iconSrc) {
			this.iconElement.style.display = "block";
		} else {
			this.iconElement.style.display = "none";
		}
		this.updateClassName();
		this.updateTitleElementClassName();
	}

	getBounds () {
		return { x: this.bx, y: this.by, width: this.root.offsetWidth, height: this.root.offsetHeight };
	}

	setBounds (x, y, width, height) {
		this.bx = x;
		this.by = y;
		this.bw = width;
		this.bh = height;
		this.titleElement.style.lineHeight = height + "px";
	}

	updateClassName () {
		let className = "";
		if (this._panel && this._panel.getId()) {
			className = "tabbar-item " + this._panel.getId();
		} else {
			className = "tabbar-item";
		}
		if (this._selected) {
			className += " tabbar-item-selected";
		}
		if (this.panel && this._panel.isFocus()) {
			className += " tabbar-item-focus";
		}
		this._root.className = className;
	}

	updateTitleElementClassName () {
		let className = "tabbar-item-title";
		if (this._selected) {
			className += " tabbar-item-title-selected";
		}
		if (this.panel && this._panel.isFocus()) {
			className += " tabbar-item-title-focus";
		}
		this.titleElement.className = className;
	}
}

export class DefaultTitleRenderFactory {
	createTitleRender() {
		return new DefaultTitleRender();
	}
}
