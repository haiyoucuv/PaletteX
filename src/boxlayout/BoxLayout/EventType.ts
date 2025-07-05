import { Event } from "@/Common/EventEmitter";

export class TabBarEvent extends Event {
	static CHANGE = 'tabbarevent_change';
	static BEGINDRAG = 'tabbarevent_begindrag';
	static MENUSELECTED = 'tabbarevent_menuselected';
	static ITEMDOUBLECLICK = 'tabbarevent_itemdoubleclick';
}

export class TabGroupEvent extends Event {
	static PANEL_ADDED = "tabgroupevent_paneladded";
	static PANEL_REMOVING = "tabgroupevent_panelremoving";
	static PANEL_REMOVED = "tabgroupevent_panelremoved";
	static PANEL_DRAG = 'tabgroupevent_paneldrag';
	static FOCUS_CHANGED = 'focuschanged';
}


export class TabPanelEvent extends Event {

	/**
	 * 刷新
	 */
	static REFRESH = 'refresh';
	/**
	 * 焦点进入
	 */
	static FOCUSIN = 'focusIn';
	/**
	 * 焦点失去
	 */
	static FOCUSOUT = 'focusOut';
}

export class DragEvent extends Event {
	static STARTDRAG = 'dragevent_startdrag';
}

export class BoxLayoutEvent extends Event {

	/**
	 * 添加了一个Panel
	 * data:{panel:ITabPanel,tabGroup:TabGroup}
	 */
	static PANEL_ADDED = "tabgroupevent_paneladded";
	/**
	 * 正在移除Panel
	 * data:{panel:ITabPanel,tabGroup:TabGroup}
	 */
	static PANEL_REMOVING = "tabgroupevent_panelremoving";
	/**
	 * 移除了一个Panel
	 * data:{panel:ITabPanel,tabGroup:TabGroup}
	 */
	static PANEL_REMOVED = "tabgroupevent_panelremoved";
	/**
	 * 拖拽了一个Panel
	 * data:panel
	 */
	static PANEL_DRAG = 'tabgroupevent_paneldrag';
	/**
	 * 配置文件发生改变
	 */
	static CONFIG_CHANGED = "boxlayout_configchange";
	/**
	 * 焦点发生变化
	 * data:焦点panel
	 */
	static FOCUS_CHANGED = 'focuschanged';
}
