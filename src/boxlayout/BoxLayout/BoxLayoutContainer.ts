
import { BoxLayoutElement } from "./BoxLayoutElement";
import { Separator } from "./Separator";

export class BoxLayoutContainer extends BoxLayoutElement {

	_isVertical: boolean = false;
	separatorSize: number = 6;
	private _separator: any;

	get isVertical() {
		return this._isVertical;
	}

	set isVertical(v) {
		this._isVertical = v;
	}

	_firstElement;
	get firstElement() {
		return this._firstElement;
	}

	set firstElement(v) {
		this._firstElement = v;
	}

	_secondElement;
	get secondElement() {
		return this._secondElement;
	}

	set secondElement(v) {
		this._secondElement = v;
	}

	get separator() {
		return this._separator;
	}

	get minHeight() {
		if (this.isVertical) {
			return this.firstElement.minHeight + this.secondElement.minHeight + this.gap;
		} else {
			return Math.max(this.firstElement.minHeight, this.secondElement.minHeight);
		}
	}

	get minWidth() {
		if (this.isVertical) {
			return Math.max(this.firstElement.minWidth, this.secondElement.minWidth);
		} else {
			return this.firstElement.minWidth + this.secondElement.minWidth + this.gap;
		}
	}

	get render() {
		return null;
	}

	get priorityLevel() {
		return Math.max(this.firstElement.priorityLevel || this.secondElement.priorityLevel);
	}

	get lockElement() {
		if (this.firstElement.priorityLevel > this.secondElement.priorityLevel) {
			return this.secondElement;
		}
		return this.firstElement;
	}

	get stretchElement() {
		if (this.firstElement.priorityLevel > this.secondElement.priorityLevel) {
			return this.firstElement;
		}
		return this.secondElement;
	}

	private _gap = 1;
	get gap() {
		return this._gap;
	}

	set gap(v) {
		this._gap = v;
	}

	constructor() {
		super();
		this._gap = 1;
		this._separator = new Separator();
		this._separator.root['__owner'] = this;
	}


	onOwnerLayoutChange = () => {

	}

	//重写
	updateRenderDisplay() {
		//如果初始化时为根节点则两个子节点都不存在
		if (!this.firstElement || !this.secondElement) {
			return;
		}
		//保持lockElement的尺寸，伸缩stretchElement的尺寸
		//纵向排列firstElement处于上方，横向排列firstElement处于左方
		const lockElement = this.lockElement;
		const stretchElement = this.stretchElement;
		if (this.isVertical) {
			lockElement.setLayoutSize(this.width, Math.max(lockElement.minHeight, Math.min(this.height - stretchElement.minHeight, lockElement.explicitHeight)));
			stretchElement.setLayoutSize(this.width, Math.max(stretchElement.minHeight - this.gap, this.height - lockElement.height - this.gap));
			this.firstElement.x = this.x;
			this.firstElement.y = this.y;
			this.secondElement.x = this.x;
			this.secondElement.y = this.y + this.firstElement.height + this.gap;
			this.separator.setBounds(this.x, this.firstElement.y + this.firstElement.height - this.separatorSize / 2, this.width, this.separatorSize);
		} else {
			lockElement.setLayoutSize(Math.max(lockElement.minWidth, Math.min(this.width - stretchElement.minWidth, lockElement.explicitWidth)), this.height);
			stretchElement.setLayoutSize(Math.max(stretchElement.minWidth - this.gap, this.width - lockElement.width - this.gap), this.height);
			this.firstElement.x = this.x;
			this.firstElement.y = this.y;
			this.secondElement.y = this.y;
			this.secondElement.x = this.x + this.firstElement.width + this.gap;
			this.separator.setBounds(this.firstElement.x + this.firstElement.width - this.separatorSize / 2, this.y, this.separatorSize, this.height);
		}
		this.firstElement.updateRenderDisplay();
		this.secondElement.updateRenderDisplay();
	}
}
