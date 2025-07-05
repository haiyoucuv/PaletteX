import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import CanvasArea from './CanvasArea';

export class CanvasPanel extends TabPanel {

    constructor() {
        super();
        this.setTitle('画布');
        this.setId("CanvasPanel");
    }

    renderContent(container: HTMLElement) {
        ReactDOM.createRoot(container).render(<CanvasArea />);
    }
}
