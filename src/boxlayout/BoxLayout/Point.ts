export class Point {
	x: number = 0;
	y: number = 0;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	setTo(x, y) {
		this.x = x;
		this.y = y;
	};

	clone() {
		return new Point(this.x, this.y);
	};

	toString() {
		return '(x:' + this.x + ',y:' + this.y + ')';
	};
}
