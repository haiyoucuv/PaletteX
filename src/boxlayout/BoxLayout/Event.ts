export class Event {
	$stopPropagation = false;
	type;
	data;

	private _target = null;

	get target() {
		return this._target;
	}

	constructor(type, data = null) {
		this.$stopPropagation = false;
		this.type = type;
		this.data = data;
	}

	stopPropagation() {
		this.$stopPropagation = true;
	}
}
