import React from "react";
import { useGlobalStore } from "../store/globalStore";
const ToolOptions: React.FC = () => {
  const tool = useGlobalStore(state => state.selectedTool);
  return <div style={{padding: 24, color: '#888'}}>当前工具：{tool}</div>;
};
export default ToolOptions; 