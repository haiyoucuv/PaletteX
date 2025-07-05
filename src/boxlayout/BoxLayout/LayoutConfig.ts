import { BoxLayoutEvent } from "./EventType";
import { DefaultPanelSerialize } from "./DefaultPanelSerialize";
import { DefaultTitleRenderFactory } from "./DefaultTitleRender";

import { EventEmitter } from "@/Common/EventEmitter";

/**
 * 布局配置文件
 */
export class LayoutConfig extends EventEmitter {
	private _useTabMenu: boolean;
	private _titleRenderFactory: DefaultTitleRenderFactory;
	private _documentTitleRenderFactory: DefaultTitleRenderFactory;
	private _panelSerialize: DefaultPanelSerialize;
	private _documentPanelSerialize: DefaultPanelSerialize;

	constructor() {
		super();
		this._titleRenderFactory = new DefaultTitleRenderFactory();
		this._documentTitleRenderFactory = new DefaultTitleRenderFactory();
		this._useTabMenu = true;
		this._panelSerialize = new DefaultPanelSerialize();
		this._documentPanelSerialize = new DefaultPanelSerialize();
	}


	/**标题呈现器*/
	get titleRenderFactory() {
		return this._titleRenderFactory;
	}

	set titleRenderFactory(v) {
		this._titleRenderFactory = v;
	}

	/**文档区标题呈现器*/
	get documentTitleRenderFactory() {
		return this._documentTitleRenderFactory;
	}

	set documentTitleRenderFactory(v) {
		this._documentTitleRenderFactory = v;
	}

	/**是否使用选项卡菜单 */
	get useTabMenu() {
		return this._useTabMenu;
	}

	set useTabMenu(v) {
		if (this._useTabMenu !== v) {
			this._useTabMenu = v;
			this.emit(BoxLayoutEvent.CONFIG_CHANGED);
		}
	}

	/**面板序列化 */
	get panelSerialize() {
		return this._panelSerialize;
	}

	set panelSerialize(v) {
		this._panelSerialize = v;
	}

	/**文档区面板序列化 */
	get documentPanelSerialize() {
		return this._documentPanelSerialize;
	}

	set documentPanelSerialize(v) {
		this._documentPanelSerialize = v;
	}
}
