import { BoxLayout } from "./BoxLayout";
import { DragInfo } from "./DragInfo";
import { ITabPanel } from "./TabPanel";
import { IEventEmitter } from "@/Common/EventEmitter";

export interface IRender {
	root: HTMLElement;
	minHeight: number;
	minWidth: number;

	render(container: HTMLElement): void;

	removeFromParent(): void;

	setBounds(x: number, y: number, width: number, height: number): void;
}

export interface IDragRender extends IRender, IEventEmitter {
	ownerElement: IBoxLayoutElement;

	adjustDragInfo(e: MouseEvent, info: DragInfo): boolean;

	acceptDragInfo(info: DragInfo): void;
}

export interface IBoxLayoutElement {
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

export interface IBoxLayoutContainer extends IBoxLayoutElement {
	isVertical: boolean;
	firstElement: IBoxLayoutElement;
	secondElement: IBoxLayoutElement;
	lockElement: IBoxLayoutElement;
	stretchElement: IBoxLayoutElement;
	separator: IRender;
	gap: number;
}

export interface IPanelSerialize {
	serialize(ownerLayout: BoxLayout, panel: ITabPanel): string;

	unSerialize(ownerLayout: BoxLayout, panelInfo: string): ITabPanel;
}
