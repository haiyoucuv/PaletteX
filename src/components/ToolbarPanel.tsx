import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import Toolbar from './Toolbar';

export class ToolbarPanel extends TabPanel {
    constructor() {
        super();
        this.setTitle('工具栏');
        this.setId("ToolbarPanel");
    }

    renderContent(container: HTMLElement) {
        ReactDOM.createRoot(container).render(<Toolbar />);
    }
} 