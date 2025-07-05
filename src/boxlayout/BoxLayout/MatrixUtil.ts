import { Matrix } from "./Matrix";

export class MatrixUtil {

	/**将一个标签的本地坐标转换为相对于body的坐标 */
	static localToGlobal(target, p) {
		const matrix = MatrixUtil.getMatrixToWindow(target);
		return matrix.transformPoint(p.x, p.y);
	};

	/**将相对于窗口的坐标转换为目标标签的本地坐标*/
	static globalToLocal(target, p) {
		const matrix = MatrixUtil.getMatrixToWindow(target);
		matrix.invert();
		return matrix.transformPoint(p.x, p.y);
	};

	/**获取一个标签相对于窗口的变换矩阵 */
	static getMatrixToWindow(target) {
		const matrix = MatrixUtil.getMatrix(target);
		while (target.parentElement) {
			if (target.parentElement.scrollTop !== 0 || target.parentElement.scrollLeft !== 0) {
				const appendMatrix = new Matrix(1, 0, 0, 1, -target.parentElement.scrollLeft, -target.parentElement.scrollTop);
				matrix.concat(appendMatrix);
			}
			if (target.parentElement === target.offsetParent) {
				matrix.concat(MatrixUtil.getMatrix(target.parentElement));
			}
			target = target.parentElement;
		}
		return matrix;
	};

	/** 获取一个标签的矩阵信息*/
	static getMatrix(target) {
		const targetMatrix = new Matrix();
		//提取样式里面的矩阵信息
		let cssMatrixList = [];
		if (MatrixUtil.cssMatrixCache[target.style.transform]) {
			cssMatrixList = MatrixUtil.cssMatrixCache[target.style.transform];
		} else {
			MatrixUtil.checkCssTransform(target, (tag, values) => {
				const tmpMatrix = MatrixUtil.makeMatrix(tag, values);
				cssMatrixList.push(tmpMatrix);
			});
			MatrixUtil.cssMatrixCache[target.style.transform] = cssMatrixList;
		}
		//连接样式矩阵矩阵
		for (let i = cssMatrixList.length - 1; i >= 0; i--) {
			targetMatrix.concat(cssMatrixList[i]);
		}
		//追加一个位移矩阵
		const translateMatrix = new Matrix(1, 0, 0, 1, target.offsetLeft, target.offsetTop);
		targetMatrix.concat(translateMatrix);
		return targetMatrix;
	};

	static checkCssTransform(target, callback) {
		//提取样式里面的矩阵信息
		let transformStr = target.style.transform;
		if (transformStr) {
			transformStr = transformStr.toLowerCase();
			let index = 0;
			let startIndex = -1;
			let tmpMatrixOperateTag = void 0;
			let serchMode = "key"; //key||value;
			while (index < transformStr.length) {
				const char = transformStr.charAt(index);
				if (char !== ' ') {
					switch (serchMode) {
						case "key":
							if (char === '(') {
								const matrixKey = transformStr.substring(startIndex, index);
								tmpMatrixOperateTag = MatrixUtil.keyToTag(matrixKey);
								serchMode = 'value';
								continue;
							} else if (startIndex === -1) {
								startIndex = index;
							}
							break;
						case "value":
							if (char === '(') {
								startIndex = index;
							} else if (char === ')') {
								const valueString = transformStr.substring(startIndex + 1, index);
								// valueString = valueString.substring(1, valueString.length - 1);
								const values = valueString.split(',');
								if (tmpMatrixOperateTag) {
									callback(tmpMatrixOperateTag, values);
								}
								tmpMatrixOperateTag = null;
								serchMode = 'key';
							}
							break;
					}
				}
				index++;
			}
		}
	};

	static keyToTag(key) {
		key = key.trim();
		//......
		return key;
	};

	static transformValues(args) {
		for (let i = 0; i < args.length; i++) {
			if (args[i].indexOf('px') !== -1) {
				args[i] = args[i].substring(0, args[i].indexOf('px') - 1);
			}
			if (args[i].indexOf('deg') !== -1) {
				args[i] = args[i].substring(0, args[i].indexOf('deg') - 1);
			}
			args[i] = Number(args[i].toString().trim());
		}
	};

	static makeMatrix(tag, args) {
		MatrixUtil.transformValues(args);
		const matrix = new Matrix();
		switch (tag) {
			case 'matrix':
				matrix.a = args[0];
				matrix.b = args[1];
				matrix.c = args[2];
				matrix.d = args[3];
				matrix.tx = args[4];
				matrix.ty = args[5];
				break;
			case 'translate':
				matrix.translate(args[0], args[1]);
				break;
			case 'translatex':
				matrix.translate(args[0], 0);
				break;
			case 'translatey':
				matrix.translate(0, args[0]);
				break;
			case 'scale':
				matrix.scale(args[0], args[1]);
				break;
			case 'scalex':
				matrix.scale(args[0], 1);
				break;
			case 'scaley':
				matrix.scale(1, args[0]);
				break;
			case 'rotate':
				matrix.rotate(args[0]);
				break;
		}
		return matrix;
	}

	//样式矩阵信息缓存
	static cssMatrixCache = {};
}


