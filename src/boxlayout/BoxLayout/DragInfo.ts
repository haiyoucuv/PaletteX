import { Rectangle } from "./Rectangle";

export class DragInfo {
	otherData;
	private dragRange: Rectangle;

	constructor() {
		this.dragRange = new Rectangle();
		this.otherData = {};
	}
}
