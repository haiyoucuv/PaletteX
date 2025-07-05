interface IEventDispatcher {
    addEventListener(type: string, fun: Function, thisObj: any): void;

    removeEventListener(type: string, fun: Function, thisObj: any): void;

    dispatchEvent(event: Event): void;
}

class EventDispatcher implements IEventDispatcher {
    __z_e_listeners: any;

    constructor();

    addEventListener(type: string, fun: Function, thisObj: any, level?: number): void;

    removeEventListener(type: string, fun: Function, thisObj: any): void;

    dispatchEvent(event: Event): boolean;
}

class Event {
    private _target;
    readonly target: any;
    $stopPropagation: boolean;

    stopPropagation(): void;

    type: string;
    data: any;

    constructor(type: string, data?: any);
}

type Position = "left" | "right" | "top" | "bottom";

/**
 * 盒式布局，此容器作为盒式布局的根，可将盒式布局应用在任意指定区域
 * @author yangning
 */
class BoxLayout extends EventDispatcher {
    private dragAreaElement;
    private maskElement;

    constructor();

    private _area;
    private _rootLayoutElement;
    readonly rootLayoutElement: IBoxLayoutElement;
    private _layoutConfig;
    /**配置 */
    readonly config: LayoutConfig;
    private _gap;
    gap: number;

    /**
     * 初始化盒式布局
     * @param container 布局区域
     */
    init(area: HTMLElement, config?: {
        /**是否启用选项卡菜单 */
        useTabMenu?: boolean;
        /**标题呈现器工厂*/
        titleRenderFactory?: ITitleRenderFactory;
        /**文档区标题呈现器工厂*/
        documentTitleRenderFactory?: ITitleRenderFactory;
        /**面板序列化 */
        panelSerialize?: IPanelSerialize;
        /**文档区面板序列化 */
        documentPanelSerialize?: IPanelSerialize;
    }): void;

    /**
     * 获取激活的选项卡组
     */
    getActiveTabGroup(): TabGroup;

    /**
     * 获取激活的面板
     */
    getActivePanel(): ITabPanel;

    /**
     * 添加一个元素到跟节点
     * @param element 要添加的元素
     * @param position 位置
     */
    addBoxElementToRoot(element: IBoxLayoutElement, position?: Position): void;

    /**
     * 添加一个元素到另一个元素的旁边
     * @param target 目标元素
     * @param element 要添加的元素
     * @param position 位置
     */
    addBoxElement(target: IBoxLayoutElement, element: IBoxLayoutElement, position?: Position): void;

    /**
     * 删除一个元素
     * @param element 要删除的元素
     */
    removeBoxElement(element: IBoxLayoutElement): void;

    private addToArea;
    private removeFromArae;
    private _maxSizeElement;
    private cacheWidth;
    private cacheHeight;
    readonly maxSizeElement: IBoxLayoutElement;

    /**设置最大化元素
     * 设置为null取消最大化
     */
    setMaxSize(v: IBoxLayoutElement): void;

    private _setMaxSize;

    /**
     * 获取文档元素
     */
    getDocumentElement(): DocumentElement;

    private updateBoxElement;
    private _updateBoxElement;
    private containerResizeHandle;
    private attachSeparatorOperateEvent;
    private detachSeparatorOperateEvent;
    private cursorLock;
    private startMouseP;
    private startSize;
    private targetContainer;
    private separatorHandle;
    private panelHandle;
    private closePanelInfoCache;
    private cachePanelInfo;
    private getOldSpace;
    private getDirLink;
    private getElementByLink;
    private dragInfo;
    private acceptTarget;
    private dragHandle;
    private attachDragEvent;
    private detachDragEvent;
    private dragEventHandle;
    private getOneDragRenderWithMouseEvent;
    private getAllChildElement;
    private panelDic;

    /**注册面板
     * 与面板ID相关的api会用到注册信息
     */
    registPanel(panel: ITabPanel): void;

    /**根据ID获取一个已注册的面板 */
    getRegistPanelById(id: string): ITabPanel;

    /**
     * 根据Id打开一个面板
     * @param panelId 面板ID
     * @param oldSpace 是否尝试在原来的区域打开，如果布局发生较大的变化可能出现原始位置寻找错误的情况，打开默认为false
     */
    openPanelById(panelId: string, oldSpace?: boolean): void;

    /**
     * 根据Id关闭一个面板
     * @param panelId 面板ID
     */
    closePanelById(panelId: string): void;

    /**获取所有已打开的面板 */
    getAllOpenPanels(): ITabPanel[];

    /**检查某个面板是否打开 */
    checkPanelOpenedById(panelId: string): boolean;

    /**获取所有的选项卡组 */
    getAllTabGroup(): TabGroup[];

    private getFirstElement;
    private getSecondElement;
    private setHoldValue;

    /**
     *  获取面板所在的布局元素
     * @param panelId 面板ID
     */
    getElementByPanelId(panelId: string): IBoxLayoutElement;

    /**
     * 根据布局配置立刻重新布局所有元素
     * @param config
     */
    applyLayoutConfig(config: any): void;

    private getAllPanel;

    /**
     * 获取当前布局信息
     */
    getLayoutConfig(): any;
}

class BoxLayoutElement implements IBoxLayoutElement {
    constructor();

    private _x;
    x: number;
    private _y;
    y: number;
    private _width;
    width: number;
    private _height;
    height: number;
    private _explicitWidth;
    readonly explicitWidth: number;
    private _explicitHeight;
    readonly explicitHeight: number;
    minWidth: number;
    minHeight: number;
    private _ownerLayout;
    ownerLayout: BoxLayout;

    protected onOwnerLayoutChange(): void;

    priorityLevel: number;
    private _parentContainer;
    parentContainer: IBoxLayoutContainer;
    protected _render: IDragRender;
    readonly render: IDragRender;
    private _maximized;

    setMaxSize(maxSize: boolean): void;

    private panelHandler;
    private updateDisplayIndex;

    setLayoutSize(width: number, height: number): void;

    updateRenderDisplay(): void;
}

class BoxLayoutContainer extends BoxLayoutElement implements IBoxLayoutContainer {
    private separatorSize;

    constructor();

    protected onOwnerLayoutChange(): void;

    private _isVertical;
    isVertical: boolean;
    private _firstElement;
    firstElement: IBoxLayoutElement;
    private _secondElement;
    secondElement: IBoxLayoutElement;
    private _separator;
    readonly separator: IRender;
    readonly minHeight: number;
    readonly minWidth: number;
    readonly render: IDragRender;
    readonly priorityLevel: number;
    readonly lockElement: IBoxLayoutElement;
    readonly stretchElement: IBoxLayoutElement;
    private _gap;
    gap: number;

    updateRenderDisplay(): void;
}

export class TabPanel extends EventDispatcher implements ITabPanel {
    private borderStyle_FocusIn;
    borderStyle_FocusOut: string;

    constructor();

    private _minWidth;
    minWidth: number;
    private _minHeight;
    minHeight: number;
    private _id;

    getId(): string;

    setId(v: string): void;

    private _title;

    getTitle(): string;

    setTitle(v: string): void;

    private _icon;

    getIcon(): string;

    setIcon(v: string): void;

    private _ownerGroup;
    ownerGroup: TabGroup;
    readonly ownerLayout: BoxLayout;
    private __visible;
    _visible: boolean;

    protected doSetVisible(v: boolean): void;

    private _priorityLevel;
    priorityLevel: number;
    private _root;
    readonly root: HTMLElement;

    getHeaderRender(): IRender;

    isFocus(): boolean;

    focus(): void;

    _focusIn(): void;

    _focusOut(): void;

    private __hold;
    /**视图保持
     * (此值为了再对面板进行某些操作时不频繁的移除、添加UI，比如解决了Iframe面板移动时刷新的问题等等))
     */
    _hold: boolean;
    private isFirst;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    private bw;
    private bh;

    setBounds(x: number, y: number, width: number, height: number): void;

    /**
     * 刷新
     */
    protected refresh(): void;

    protected renderContent(container: HTMLElement): void;

    protected resize(newWidth: number, newHeight: any): void;

    private updateClassName;
}

class DefaultPanelSerialize implements IPanelSerialize {
    serialize(ownerLayout: BoxLayout, panel: ITabPanel): string;

    unSerialize(ownerLayout: BoxLayout, panelInfo: string): ITabPanel;
}

class PlaceholderPanel extends TabPanel {
    constructor();
}

class DocumentElement extends BoxLayoutElement {
    constructor();

    readonly priorityLevel: number;

    onOwnerLayoutChange(): void;

    setMaxSize(maxSize: boolean): void;
}

interface IRender {
    root: HTMLElement;
    minHeight: number;
    minWidth: number;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    setBounds(x: number, y: number, width: number, height: number): void;
}

interface IDragRender extends IRender, IEventDispatcher {
    ownerElement: IBoxLayoutElement;

    adjustDragInfo(e: MouseEvent, info: DragInfo): boolean;

    acceptDragInfo(info: DragInfo): void;
}

interface IBoxLayoutElement {
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    explicitWidth: number;
    explicitHeight: number;
    ownerLayout: BoxLayout;
    priorityLevel: number;

    setLayoutSize(width: number, height: number): void;

    parentContainer: IBoxLayoutContainer;
    render: IDragRender;

    setMaxSize(maxSize: boolean): void;

    updateRenderDisplay(): void;
}

interface IBoxLayoutContainer extends IBoxLayoutElement {
    isVertical: boolean;
    firstElement: IBoxLayoutElement;
    secondElement: IBoxLayoutElement;
    lockElement: IBoxLayoutElement;
    stretchElement: IBoxLayoutElement;
    separator: IRender;
    gap: number;
}

interface IPanelSerialize {
    serialize(ownerLayout: BoxLayout, panel: ITabPanel): string;

    unSerialize(wnerLayout: BoxLayout, panelInfo: string): ITabPanel;
}

class BoxLayoutEvent extends Event {
    /**
     * 添加了一个Panel
     * data:{panel:ITabPanel,tabGroup:TabGroup}
     */
    static PANEL_ADDED: string;
    /**
     * 正在移除Panel
     * data:{panel:ITabPanel,tabGroup:TabGroup}
     */
    static PANEL_REMOVING: string;
    /**
     * 移除了一个Panel
     * data:{panel:ITabPanel,tabGroup:TabGroup}
     */
    static PANEL_REMOVED: string;
    /**
     * 拖拽了一个Panel
     * data:panel
     */
    static PANEL_DRAG: string;
    /**
     * 配置文件发生改变
     */
    static CONFIG_CHANGED: string;
    /**
     * 焦点发生变化
     * data:焦点panel
     */
    static FOCUS_CHANGED: string;

    constructor(type: string, data?: any);
}

class DragEvent extends Event {
    static STARTDRAG: string;

    constructor(type: string, data?: any);
}

class DragInfo {
    /**拖拽的区域 */
    dragRange: Rectangle;
    otherData: any;
}

/**
 * 布局配置文件
 */
class LayoutConfig extends EventDispatcher {
    constructor();

    private _titleRenderFactory;
    /**标题呈现器*/
    titleRenderFactory: ITitleRenderFactory;
    private _documentTitleRenderFactory;
    /**文档区标题呈现器*/
    documentTitleRenderFactory: ITitleRenderFactory;
    private _useTabMenu;
    /**是否使用选项卡菜单 */
    useTabMenu: boolean;
    private _panelSerialize;
    /**面板序列化 */
    panelSerialize: IPanelSerialize;
    private _documentPanelSerialize;
    /**文档区面板序列化 */
    documentPanelSerialize: IPanelSerialize;
}

class Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;

    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);

    clone(): Matrix;

    concat(target: Matrix): void;

    /**
     * @private
     */
    $preConcat(target: Matrix): void;

    copyFrom(target: Matrix): void;

    identity(): void;

    invert(): void;

    private $invertInto;

    rotate(angle: number): void;

    scale(sx: number, sy: number): void;

    setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void;

    transformPoint(pointX: number, pointY: number, resultPoint?: Point): Point;

    deltaTransformPoint(pointX: number, pointY: number, resultPoint?: Point): Point;

    translate(dx: number, dy: number): void;

    equals(target: Matrix): boolean;

    prepend(a: number, b: number, c: number, d: number, tx: number, ty: number): void;

    append(a: number, b: number, c: number, d: number, tx: number, ty: number): void;

    toString(): string;

    createBox(scaleX: number, scaleY: number, rotation?: number, tx?: number, ty?: number): void;

    createGradientBox(width: number, height: number, rotation?: number, tx?: number, ty?: number): void;

    /**
     * @private
     */
    $getDeterminant(): number;

    /**
     * @private
     */
    $getScaleX(): number;

    /**
     * @private
     */
    $getScaleY(): number;

    /**
     * @private
     */
    $getSkewX(): number;

    /**
     * @private
     */
    $getSkewY(): number;

    /**
     * @private
     */
    $getRotation(angle: number): number;
}

class Point {
    x: number;
    y: number;

    constructor(x?: number, y?: number);

    setTo(x: number, y: number): void;

    clone(): Point;

    toString(): string;
}

class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x?: number, y?: number, width?: number, height?: number);

    containsPoint(point: Point): boolean;

    containsRect(rect: any): boolean;

    clone(): Rectangle;
}

class TabBarEvent extends Event {
    static CHANGE: string;
    static BEGINDRAG: string;
    static MENUSELECTED: string;
    static ITEMDOUBLECLICK: string;

    constructor(type: string, data?: any);
}

class TabGroupEvent extends Event {
    static PANEL_ADDED: string;
    static PANEL_REMOVING: string;
    static PANEL_REMOVED: string;
    static PANEL_DRAG: string;
    static FOCUS_CHANGED: string;

    constructor(type: string, data?: any);
}

class TabPanelEvent extends Event {
    /**
     * 刷新
     */
    static REFRESH: string;
    /**
     * 焦点进入
     */
    static FOCUSIN: string;
    /**
     * 焦点失去
     */
    static FOCUSOUT: string;

    constructor(type: string, data?: any);
}

class DocumentGroup extends EventDispatcher implements IDragRender {
    constructor();

    minWidth: number;
    minHeight: number;
    private _layout;
    readonly layout: BoxLayout;
    private _root;
    readonly root: HTMLElement;
    private _ownerElement;
    ownerElement: IBoxLayoutElement;

    addPanel(panel: TabPanel): void;

    getAllPanels(): ITabPanel[];

    removePanel(panel: ITabPanel): void;

    adjustDragInfo(e: MouseEvent, info: DragInfo): boolean;

    private adjustDragInfo_tabGroup;

    acceptDragInfo(v: DragInfo): void;

    private setHoldValue;
    private _hold;
    hold: boolean;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    private bw;
    private bh;
    private bx;
    private by;

    setBounds(x: number, y: number, width: number, height: number): void;
}

class DragArea implements IRender {
    constructor();

    minHeight: number;
    minWidth: number;
    private _root;
    readonly root: HTMLElement;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    setBounds(x: number, y: number, width: number, height: number): void;
}

class Mask implements IRender {
    constructor();

    minHeight: number;
    minWidth: number;
    private _root;
    readonly root: HTMLElement;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    setBounds(x: number, y: number, width: number, height: number): void;
}

/**分割条 */
class Separator implements IRender {
    constructor();

    minHeight: number;
    minWidth: number;
    private _root;
    readonly root: HTMLElement;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    setBounds(x: number, y: number, width: number, height: number): void;
}

class TabBar extends EventDispatcher implements IRender {
    constructor();

    minHeight: number;
    minWidth: number;
    private _titleRenderFactory;
    titleRenderFactory: ITitleRenderFactory;
    private optionEventHandle;
    private itemContainer;
    private itemRemainContainer;
    private appendContainer;
    private optionContainer;
    private _root;
    readonly root: HTMLElement;
    _panels: ITabPanel[];
    panels: ITabPanel[];
    private _selectedIndex;
    selectedIndex: number;
    private setSelected;
    private _showOptionContainer;
    showOptionContainer: boolean;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    private bx;
    private by;
    private bw;
    private bh;

    getBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    setBounds(x: number, y: number, width: number, height: number): void;

    currentItems: ITitleRender[];
    private reDeployItems;
    private startP;
    private cancelClick;
    private targetPanel;
    private itemEventHandle;
    private currentHeaderRender;
    private commitSelected;

    refresh(): void;

    private updateItemDisplay;
}

class TabGroup extends EventDispatcher implements IDragRender {
    constructor();

    minWidth: number;
    minHeight: number;
    titleRenderFactory: ITitleRenderFactory;
    private _tabBar;
    readonly tabBar: TabBar;
    readonly root: HTMLElement;
    readonly ownerLayout: BoxLayout;
    private _ownerElement;
    ownerElement: IBoxLayoutElement;
    private _panels;
    panels: ITabPanel[];
    private _selectedIndex;
    selectedIndex: number;
    selectedPanel: ITabPanel;

    removePanel(v: ITabPanel): void;

    /**
     * @param v
     */
    _removePanel(v: ITabPanel): void;

    addPanel(v: ITabPanel): void;

    _addPanel(v: ITabPanel): void;

    addPanelTo(target: ITabPanel, panel: ITabPanel, dir?: string): void;

    _addPanelTo(target: ITabPanel, panel: ITabPanel, dir?: string): void;

    private reDeployPanelTag;
    private currentPanles;
    private reDeployPanels;
    private selectedPath;
    private commitSelected;
    private panelEventHandler;

    adjustDragInfo(e: MouseEvent, info: DragInfo): boolean;

    private adjustDragInfo_tabBox;
    private adjustDragInfo_tabGroup;

    acceptDragInfo(v: DragInfo): void;

    private setHoldValue;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    private configHandle;
    private tabBarEventHandle;
    private doForTabbarMenu;
    private static _tabBarHeight;
    static tabBarHeight: number;
    private bx;
    private by;
    private bw;
    private bh;

    setBounds(x: number, y: number, width: number, height: number): void;

    private updatePanelDisplay;
}

/**
 * TabPanel焦点管理器
 */
class TabPanelFocusManager {
    private static panels;

    static push(panel: ITabPanel): void;

    private static mouseEventHandle;
    private static _foucsPanel;
    static readonly currentFocus: ITabPanel;

    static focus(panel: ITabPanel): void;

    private static activeGroups;

    static getActiveGroup(layout: BoxLayout): TabGroup;

    private static addActiveGroup;

    static reSet(): void;
}

class DefaultTitleRender implements ITitleRender {
    private titleElement;
    private iconElement;

    constructor();

    minHeight: number;
    minWidth: number;
    private _root;
    readonly root: HTMLElement;
    private _panel;
    panel: ITabPanel;
    private _selected;
    selected: boolean;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    updateDisplay(): void;

    private bx;
    private by;
    private bw;
    private bh;

    getBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    setBounds(x: number, y: number, width: number, height: number): void;

    private updateClassName;
    private updateTitleElementClassName;
}

class DefaultTitleRenderFactory implements ITitleRenderFactory {
    createTitleRender(): ITitleRender;
}

interface ITabPanel extends IRender, IEventDispatcher {
    ownerGroup: TabGroup;
    ownerLayout: BoxLayout;
    _visible: boolean;
    _hold: boolean;
    priorityLevel: number;

    getId(): string;

    getTitle(): string;

    getIcon(): string;

    isFocus(): boolean;

    focus(): void;

    _focusIn(): void;

    _focusOut(): void;

    getHeaderRender(): IRender;
}

interface ITitleRender extends IRender {
    panel: ITabPanel;
    selected: boolean;

    getBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    updateDisplay(): void;
}

interface ITitleRenderFactory {
    createTitleRender(): ITitleRender;
}

class TestDragPanel extends EventDispatcher implements IDragRender {
    constructor();

    minHeight: number;
    minWidth: number;
    private _root;
    readonly root: HTMLElement;
    private _ownerElement;
    ownerElement: IBoxLayoutElement;

    adjustDragInfo(e: MouseEvent, info: DragInfo): boolean;

    acceptDragInfo(v: DragInfo): void;

    private container;

    render(container: HTMLElement): void;

    private mouseHandle;

    removeFromParent(): void;

    private bx;
    private by;
    private bw;
    private bh;

    setBounds(x: number, y: number, width: number, height: number): void;
}

/**测试TabPanel */
class TestTabPanel extends TabPanel {
    private headerRender;

    constructor();

    private element;

    protected renderContent(container: HTMLElement): void;

    getHeaderRender(): IRender;

    protected resize(newWidth: number, newHeight: number): void;
}

/**测试选项卡头部渲染器 */
class HeaderRender implements IRender {
    root: HTMLButtonElement;

    constructor();

    minHeight: number;
    minWidth: number;
    private container;

    render(container: HTMLElement): void;

    removeFromParent(): void;

    setBounds(x: number, y: number, width: number, height: number): void;
}

class HtmlElementResizeHelper {
    private static _watched;
    private static _UseNative;
    /**
     * 设置是否使用原生方法， 原生方法仅支持 >= chrome 64 或 >= electron 3.0
     */
    static UseNative: boolean;

    /**
     * 监视目标标签，如果尺寸发生变化目标标签将会抛出'resize'事件
     */
    static watch(target: HTMLElement): void;

    static unWatch(target: HTMLElement): void;
}

class MatrixUtil {
    /**将一个标签的本地坐标转换为相对于body的坐标 */
    static localToGlobal(target: HTMLElement, p: Point): Point;

    /**将相对于窗口的坐标转换为目标标签的本地坐标*/
    static globalToLocal(target: HTMLElement, p: Point): Point;

    /**获取一个标签相对于窗口的变换矩阵 */
    static getMatrixToWindow(target: HTMLElement): Matrix;

    private static cssMatrixCache;

    /** 获取一个标签的矩阵信息*/
    static getMatrix(target: HTMLElement): Matrix;

    private static checkCssTransform;
    private static keyToTag;
    private static transformValues;
    private static makeMatrix;
}

class NumberUtil {
    static sin(value: number): number;

    static sinInt(value: number): number;

    static cos(value: number): number;

    static cosInt(value: number): number;
}

class PopupMenu {
    constructor();

    private static instance;

    static popup(target: HTMLElement, menus: any[], callback: (id: string) => void): void;

    private menuContainer;
    private callback;

    /**
     * 弹出菜单
     * @param target 要弹出菜单的目标对象
     * @param menus 菜单数据
     * @param callback 回调
     */
    popup(target: HTMLElement, menus: any[], callback: (id: string) => void): void;

    private itemHandle;
    private removePopup;
    private mouseEventHandle;
}
