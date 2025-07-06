import React from "react";
import styles from "./ToolMenu.module.less";
import { useGlobalStore } from "../store/globalStore";

interface ToolMenuProps {
  tools: { key: string; label: string; icon?: string }[];
}

const ToolMenu: React.FC<ToolMenuProps> = ({ tools }) => {
  const selected = useGlobalStore(state => state.selectedTool);
  const setSelected = useGlobalStore(state => state.setSelectedTool);
  return <div className={styles.menu}>
    {tools.map(tool => (
      <div
        key={tool.key}
        className={tool.key === selected ? styles.menuItem + ' ' + styles.active : styles.menuItem}
        onClick={() => setSelected(tool.key)}
        title={tool.label}
      >
        <span className={styles.icon}>{tool.icon}</span>
        <span className={styles.label}>{tool.label}</span>
      </div>
    ))}
  </div>;
};
export default ToolMenu; 