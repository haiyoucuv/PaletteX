import { TabPanel } from '../boxlayout/boxlayout.js';
import ReactDOM from 'react-dom/client';
import React from 'react';
import Histogram from './Histogram';
import ToolMenu from './ToolMenu';
import ToolOptions from './ToolOptions';
import styles from './ToolsPanel.module.less';

const TOOL_LIST = [
  { key: 'basic', label: '基础', icon: '🛠️' },
  { key: 'color', label: '色彩', icon: '🎨' },
  { key: 'curve', label: '曲线', icon: '📈' },
  { key: 'detail', label: '细节', icon: '🔍' },
];

const ToolsPanelInner: React.FC = () => {
  return (
    <div className={styles.toolsPanelRoot}>
      <div className={styles.toolsMenu}><ToolMenu tools={TOOL_LIST} /></div>
      <div className={styles.toolsPanel}>
        <div className={styles.histogram}><Histogram /></div>
        <div className={styles.toolOptions}><ToolOptions /></div>
      </div>
    </div>
  );
};

export class ToolsPanel extends TabPanel {
  constructor() {
    super();
    this.setTitle('工具区');
    this.setId('ToolsPanel');
  }
  renderContent(container: HTMLElement) {
    ReactDOM.createRoot(container).render(<ToolsPanelInner />);
  }
} 