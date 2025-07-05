export class NumberUtil {
	static sin(value) {
		const valueFloor = Math.floor(value);
		const valueCeil = valueFloor + 1;
		const resultFloor = NumberUtil.sinInt(valueFloor);
		if (valueFloor == value) {
			return resultFloor;
		}
		const resultCeil = NumberUtil.sinInt(valueCeil);
		return (value - valueFloor) * resultCeil + (valueCeil - value) * resultFloor;
	}

	static sinInt(value) {
		value = value % 360;
		if (value < 0) {
			value += 360;
		}
		return Math.sin(value);
	};

	static cos(value) {
		const valueFloor = Math.floor(value);
		const valueCeil = valueFloor + 1;
		const resultFloor = NumberUtil.cosInt(valueFloor);
		if (valueFloor == value) {
			return resultFloor;
		}
		const resultCeil = NumberUtil.cosInt(valueCeil);
		return (value - valueFloor) * resultCeil + (valueCeil - value) * resultFloor;
	};

	static cosInt(value) {
		value = value % 360;
		if (value < 0) {
			value += 360;
		}
		return Math.cos(value);
	};
}
