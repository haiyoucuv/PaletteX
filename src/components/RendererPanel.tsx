import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import CanvasArea from './CanvasArea';

export class RendererPanel extends TabPanel {
  constructor() {
    super();
    this.setTitle('渲染区');
    this.setId('RendererPanel');
  }
  renderContent(container: HTMLElement) {
    ReactDOM.createRoot(container).render(<CanvasArea />);
  }
} 