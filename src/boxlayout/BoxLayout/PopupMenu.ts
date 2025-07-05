import { MatrixUtil } from "./MatrixUtil";
import { Point } from "./Point";

export class PopupMenu {

	private static instance: PopupMenu;

	static popup(target, menus, callback) {
		if (!PopupMenu.instance) {
			PopupMenu.instance = new PopupMenu();
		}
		PopupMenu.instance.popup(target, menus, callback);
	}


	private menuContainer: HTMLDivElement;
	private callback: Function;

	constructor() {
		this.mouseEventHandle = this.mouseEventHandle.bind(this);
		this.itemHandle = this.itemHandle.bind(this);
	}

	/**
	 * 弹出菜单
	 * @param target 要弹出菜单的目标对象
	 * @param menus 菜单数据
	 * @param callback 回调
	 */
	popup(target, menus, callback) {
		this.removePopup();
		if (menus && menus.length > 0) {
			this.callback = callback;
			this.menuContainer = document.createElement('div');
			this.menuContainer.style.position = 'absolute';
			this.menuContainer.style.minWidth = '80px';
			this.menuContainer.style.padding = '3px 0px';
			this.menuContainer.style.borderRadius = '5px';
			this.menuContainer.style.background = '#f3f3f3';
			this.menuContainer.style.boxShadow = '2px 2px 10px #111111';
			window.addEventListener('mousedown', this.mouseEventHandle, true);
			document.body.appendChild(this.menuContainer);
			for (let i = 0; i < menus.length; i++) {
				const item = document.createElement('div');
				item.innerText = menus[i]['label'];
				item.style.fontSize = '13px';
				item.style.padding = '0px 8px';
				item.style.color = '#000000';
				item['__popupid'] = menus[i]['id'];
				this.menuContainer.appendChild(item);
				item.addEventListener('mouseenter', this.itemHandle, true);
				item.addEventListener('mouseleave', this.itemHandle, true);
				item.addEventListener('click', this.itemHandle, true);
				if (i !== menus.length - 1) {
					const separator = document.createElement('div');
					separator.style.height = '1px';
					separator.style.margin = '3px 0px';
					separator.style.background = 'rgb(216, 216, 216)';
					this.menuContainer.appendChild(separator);
				}
			}
			const globalP = MatrixUtil.localToGlobal(target, new Point(target.offsetWidth / 2 / target.offsetHeight / 2));
			const offset = 10;
			const w = this.menuContainer.offsetWidth;
			const h = this.menuContainer.offsetHeight;
			const outW = document.body.offsetWidth;
			const outH = document.body.offsetHeight;
			let x = globalP.x + offset;
			let y = globalP.y + offset;
			if (w + globalP.x + offset > outW) {
				x = globalP.x - offset - w;
			}
			if (h + globalP.y + offset > outH) {
				y = globalP.y - offset - h;
			}
			this.menuContainer.style.left = x + 'px';
			this.menuContainer.style.top = y + 'px';
		}
	}

	itemHandle(e) {
		switch (e.type) {
			case 'mouseenter':
				e.currentTarget.style.background = '#4698fb';
				break;
			case 'mouseleave':
				e.currentTarget.style.background = null;
				break;
			case 'click':
				this.removePopup();
				this.callback(e.currentTarget['__popupid']);
				break;
		}
	}

	removePopup() {
		if (this.menuContainer && this.menuContainer.parentElement) {
			window.removeEventListener('mousedown', this.mouseEventHandle, true);
			document.body.removeChild(this.menuContainer);
		}
	}

	mouseEventHandle(e) {
		switch (e.type) {
			case 'mousedown':
				const p = MatrixUtil.globalToLocal(this.menuContainer, new Point(e.clientX, e.clientY));
				if (p.x < 0 || p.y < 0 || p.x > this.menuContainer.offsetWidth || p.y > this.menuContainer.offsetHeight) {
					this.removePopup();
				}
				break;
		}
	}
}

