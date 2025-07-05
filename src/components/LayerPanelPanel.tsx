import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import LayerPanel from './LayerPanel';

export class LayerPanelPanel extends TabPanel {
    constructor() {
        super();
        this.setTitle('图层');
        this.setId("LayerPanelPanel");
    }

    renderContent(container: HTMLElement) {
        ReactDOM.createRoot(container).render(<LayerPanel />);
    }
}
