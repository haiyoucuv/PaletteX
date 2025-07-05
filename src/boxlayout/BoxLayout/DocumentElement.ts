import { BoxLayoutElement } from "./BoxLayoutElement";
import { DocumentGroup } from "./DocumentGroup";

export class DocumentElement extends BoxLayoutElement {
	constructor() {
		super();
		this._render = new DocumentGroup();
		this._render.ownerElement = this;
		return this;

	}


	get priorityLevel() {
		return Number.MAX_VALUE;
	}

	onOwnerLayoutChange = function () {
		if (this.ownerLayout) {
			const layout = this._render.layout;
			layout.config.titleRenderFactory = this.ownerLayout.config.documentTitleRenderFactory;
			layout.getAllTabGroup().forEach((group) => {
				group.titleRenderFactory = layout.config.titleRenderFactory;
			});
		}
	}

	setMaxSize = function (maxSize) {
		const panelZ = maxSize ? 3 : 0;
		this.render.root.style.zIndex = panelZ.toString();
	}
}

