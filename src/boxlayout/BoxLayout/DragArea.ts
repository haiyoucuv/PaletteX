export class DragArea {
	private _root: HTMLDivElement;
	private container: HTMLDivElement;
	private minHeight: number = 0;
	private minWidth: number = 0;

	constructor() {
		this.minHeight = 0;
		this.minWidth = 0;
		this._root = document.createElement('div');
		this._root.className = 'drag-element';
		this._root.style.position = "absolute";
		this._root.style.pointerEvents = "none";
		this._root.style.boxSizing = "border-box";
	}

	get root() {
		return this._root;
	}

	render(container) {
		this.container = container;
		this.container.appendChild(this.root);
	}

	removeFromParent() {
		if (
			this.container
			// && this.root.parentNode == this.container
		) {
			this.container.removeChild(this.root);
		}
	}

	setBounds(x, y, width, height) {
		this.root.style.width = width + 'px';
		this.root.style.height = height + 'px';
		this.root.style.left = x + 'px';
		this.root.style.top = y + 'px';
	}
}
