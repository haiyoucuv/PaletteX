import { DragEvent } from "./EventType";
import { DragInfo } from "./DragInfo";
import { MatrixUtil } from "./MatrixUtil";
import { Point } from "./Point";
import { TabPanel } from "./TabPanel";

import { EventEmitter } from "@/Common/EventEmitter";

import icon from "@/Assests/FygeIcon.svg";

/**测试TabPanel */
export class TestTabPanel extends TabPanel {
	private headerRender: HeaderRender;
	private element: HTMLElement;

	constructor() {
		super();
		this.setId('testPanel');
		this.setTitle('TEST');
		this.setIcon(icon);
		this.headerRender = new HeaderRender();
		this.headerRender.root.addEventListener('click', () => {
			this.element.innerText = this.element.innerText + "\nclick!";
		});
	}


	//重写 以实现自定义面板
	renderContent(container) {
		this.element = document.createElement('div');
		this.element.style.background = "#666666"
		this.element.style.color = "#ffffff";
		container.appendChild(this.element);
	};

	//重写 以实现选项卡头部自定义内容
	getHeaderRender() {
		return this.headerRender;
	};

	//重写 做相关处理
	resize(newWidth, newHeight) {
		if (this.element) {
			this.element.style.width = newWidth + 'px';
			this.element.style.height = newHeight + 'px';
		}
	};
}

class HeaderRender {
	private minHeight: number = 0;
	private minWidth: number = 0;
	root: HTMLButtonElement;
	private container: HTMLElement;

	constructor() {
		this.root = document.createElement('button');
		this.root.textContent = "click me";
	}

	render(container) {
		this.container = container;
		this.container.appendChild(this.root);
	}

	removeFromParent() {
		if (this.container) {
			this.container.removeChild(this.root);
		}
	}

	setBounds(x, y, width, height) {
		//选项卡头部渲染器不需要处理此函数
	}
}


/**
 * 测试拖拽面板
 */

export class TestDragPanel extends EventEmitter {
	private container: HTMLElement;
	private _ownerElement: any;
	private _root: HTMLElement;
	private minWidth: number = 0;
	private minHeight: number = 0;
	private bx: number;
	private by: number;
	private bw: number;
	private bh: number;

	constructor() {
		super();
		this._root = document.createElement('div');
		this._root.style.position = 'absolute';
		this._root.style.border = '2px solid rgb(41, 50, 59)';
		this._root.style.background = '#232a32';
		this._root.innerText = Math.random().toString();
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

	adjustDragInfo(e, info) {
		const p = MatrixUtil.globalToLocal(this._root, new Point(e.clientX, e.clientY));
		const margin = 50;
		let dir;
		const obj = {};
		obj['left'] = p.x < margin;
		obj['right'] = p.x > this.bw - margin;
		obj['top'] = p.y < margin;
		obj['bottom'] = p.y > this.bh - margin;
		obj['center'] = (!obj['left'] && !obj['right'] && !obj['bottom'] && !obj['top']);
		const globalP = MatrixUtil.localToGlobal(this.root, new Point());
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
			for (const key in obj) {
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
		info.otherData["dir"] = dir;
		info.otherData["target"] = this.ownerElement;
		return true;
	}

	acceptDragInfo(v) {
		if (v.otherData["dir"] !== "center") {
			this.ownerElement.ownerLayout.addBoxElement(v.otherData["target"], v.otherData["start"], v.otherData["dir"]);
		}
	}

	render(container) {
		this.container = container;
		this.container.appendChild(this.root);
		this.root.addEventListener("mousedown", this.mouseHandle);
	}

	mouseHandle = (e) => {
		if (e.button === 0) {
			const info = new DragInfo();
			info.otherData["start"] = this.ownerElement;
			this.emit(DragEvent.STARTDRAG, info);
		}
	}

	removeFromParent() {
		if (this.container) {
			this.container.removeChild(this.root);
			this.root.removeEventListener("mousedown", this.mouseHandle);
		}
	}

	setBounds(x, y, width, height) {
		this.bx = x;
		this.by = y;
		this.bw = width;
		this.bh = height;
		this.root.style.left = x + 'px';
		this.root.style.top = y + 'px';
		this.root.style.width = (width - 4) + 'px';
		this.root.style.height = (height - 4) + 'px';
	}
}
