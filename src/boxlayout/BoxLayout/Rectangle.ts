export class Rectangle {
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;

	constructor(x = 0, y = 0, width = 0, height = 0) {

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	containsPoint(point) {
		return this.x <= point.x
			&& this.x + this.width > point.x
			&& this.y <= point.y
			&& this.y + this.height > point.y;

	}

	containsRect(rect) {
		const r1 = rect.x + rect.width;
		const b1 = rect.y + rect.height;
		const r2 = this.x + this.width;
		const b2 = this.y + this.height;
		return (rect.x >= this.x) && (rect.x < r2) && (rect.y >= this.y) && (rect.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
	}

	clone() {
		return new Rectangle(this.x, this.y, this.width, this.height);
	}
}
