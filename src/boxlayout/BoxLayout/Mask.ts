export class Mask {
	private _root: HTMLDivElement;
	private container: HTMLDivElement;
	private minHeight: number = 0;
	private minWidth: number = 0;

	constructor() {
		this.minHeight = 0;
		this.minWidth = 0;
		this._root = document.createElement('div');
		this._root.className = "mask";
		this._root.style.position = "absolute";
		this._root.style.background = 'rgba(0,0,0,0)';
		this._root.style.zIndex = '5';
	}

	get root() {
		return this._root;
	}

	render(container) {
		this.container = container;
		this.container.appendChild(this.root);
	}

	removeFromParent() {
		if (this.container) {
			this.container.removeChild(this.root);
		}
	};

	setBounds(x, y, width, height) {
		this.root.style.width = width + 'px';
		this.root.style.height = height + 'px';
		this.root.style.left = x + 'px';
		this.root.style.top = y + 'px';
	}
}
