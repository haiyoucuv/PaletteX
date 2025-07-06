import React, { useEffect, useRef } from "react";
import styles from "./App.module.less";
import { BoxLayout } from './boxlayout/boxlayout.js';
import { RendererPanel } from './components/RendererPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { defaultLayoutConfig } from './defaultLayoutConfig';
import classNames from "classnames";
import "./boxlayout/boxlayout.less";

function App() {
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layoutRef.current) return;
    layoutRef.current.innerHTML = "";
    
    const layout = new BoxLayout();
    layout.init(layoutRef.current, { useTabMenu: true });
    const renderer = new RendererPanel();
    layout.registPanel(renderer);

    const tools = new ToolsPanel();
    layout.registPanel(tools);

    layout.applyLayoutConfig(defaultLayoutConfig);


    window['printConfig'] = () => {
      console.log(JSON.stringify(layout.getLayoutConfig(), null, 2));
    }

    return () => {
      // window.removeEventListener('resize', handleResize);
      layout.closePanelById("RendererPanel");
      layout.closePanelById("ToolsPanel");
    };
  }, []);

  return <div ref={layoutRef} className={classNames(styles.app, "boxlayout")}/>;
}

export default App;
