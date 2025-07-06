import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import ColorTools from './ColorTools';

export class ColorToolsPanel extends TabPanel {
    constructor() {
        super();
        this.setTitle('调色工具');
        this.setId("ColorToolsPanel");
    }

    renderContent(container: HTMLElement) {
        ReactDOM.createRoot(container).render(<ColorTools />);
    }
} 