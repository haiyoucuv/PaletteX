export class HtmlElementResizeHelper {
	private static _UseNative: any;
	/**
	 * 设置是否使用原生方法， 原生方法仅支持 >= chrome 64 或 >= electron 3.0
	 */
	static get UseNative() {
		return this._UseNative;
	}

	static set UseNative(v) {
		if (HtmlElementResizeHelper._watched) {
			throw new Error("已经开始监视，禁止修改 UseNative 值");
		}
		this._UseNative = v;
	}

	/**
	 * 监视目标标签，如果尺寸发生变化目标标签将会抛出'resize'事件
	 */
	static watch(target) {
		HtmlElementResizeHelper._watched = true;
		if (HtmlElementResizeHelper.UseNative) {
			NativeResizeHelper.watch(target);
		} else {
			LegacyResizeHelper.watch(target);
		}
	};

	static unWatch(target) {
		if (HtmlElementResizeHelper.UseNative) {
			NativeResizeHelper.unWatch(target);
		} else {
			LegacyResizeHelper.unWatch(target);
		}
	};

	static _watched = false;
}

export class LegacyResizeHelper {
	static listenList = [];
	private static intervalTag: NodeJS.Timeout;

	/**
	 * 监视目标标签，如果尺寸发生变化目标标签将会抛出'resize'事件
	 */
	static watch(target) {
		this.listenList.push({ w: target.offsetWidth, h: target.offsetHeight, target: target });
		this.startListen();
	};

	static unWatch(target) {
		for (let i = this.listenList.length - 1; i >= 0; i--) {
			if (this.listenList[i]['target'] === target) {
				this.listenList.splice(i, 1);
			}
		}
		if (this.listenList.length === 0) {
			this.stopListen();
		}
	};

	static startListen() {
		const _this = this;
		this.stopListen();
		this.intervalTag = setInterval(() => this.checkSize(), 1);
	};

	static stopListen() {
		clearInterval(this.intervalTag);
	}

	static checkSize() {
		this.listenList.forEach((element) => {
			const target = element['target'];
			if (target.offsetWidth !== element['w'] || target.offsetHeight !== element['h']) {
				element['w'] = target.offsetWidth;
				element['h'] = target.offsetHeight;
				target.dispatchEvent(new Event('resize'));
			}
		});
	}
}

export class NativeResizeHelper {
	static watch(target) {
		if (!NativeResizeHelper.ro) {
			NativeResizeHelper.ro = new ResizeObserver(NativeResizeHelper.fireResize);
		}
		NativeResizeHelper.ro.observe(target);
	};

	static unWatch(target) {
		if (NativeResizeHelper.ro) {
			NativeResizeHelper.ro.unobserve(target);
		}
	};

	static fireResize(entries, observer) {
		entries.forEach((element) => {
			const target = element.target;
			target.dispatchEvent(new Event('resize'));
		});
	};

	static ro = null;
}
