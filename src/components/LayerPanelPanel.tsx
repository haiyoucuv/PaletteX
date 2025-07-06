import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import PresetLibrary from './PresetLibrary.tsx';

export class PresetLibraryPanel extends TabPanel {
    constructor() {
        super();
        this.setTitle('预设库');
        this.setId("PresetLibraryPanel");
    }

    renderContent(container: HTMLElement) {
        ReactDOM.createRoot(container).render(<PresetLibrary />);
    }
}
