import { Event } from "./Event";

export class EventEmitter {
	_listeners = {};

	constructor() {

	}

	on(type, fun: Function, thisObj?, level = 0) {

		let list = this._listeners[type];
		if (list === undefined) {
			list = [];
			this._listeners[type] = list;
		}
		const item = {
			func: fun,
			context: thisObj,
			level: level
		};
		list.push(item);
		list.sort((a, b) => b.level - a.level);
	}

	off(type, fun, thisObj?) {
		const list = this._listeners[type];
		if (list !== undefined) {
			const size = list.length;
			for (let i = 0; i < size; i++) {
				const obj = list[i];
				if (obj.func === fun && obj.context === thisObj) {
					list.splice(i, 1);
					return;
				}
			}
		}
	}

	emit(type: string, data?) {

		const event = new Event(type, data);

		const list = this._listeners[event.type];

		if (list !== undefined) {
			for (let i = 0; i < list.length; i++) {
				const ef = list[i];
				const fun = ef.func;
				const context = ef.context;
				// @ts-ignore
				event._target = this;
				if (context) {
					fun.call(context, event);
				} else {
					fun(event);
				}
				if (event.$stopPropagation) {
					return false;
				}
			}
		}
		return true;
	};
}
