import React, { useEffect, useRef } from "react";
import styles from "./App.module.less";
import { BoxLayout } from './boxlayout/boxlayout.js';
import { ToolbarPanel } from './components/ToolbarPanel';
import { CanvasPanel } from './components/CanvasPanel';
import { LayerPanelPanel } from './components/LayerPanelPanel';

import classNames from "classnames";

import "./boxlayout/boxlayout.less";
import { defaultLayoutConfig } from "./defaultLayoutConfig";

function App() {
    const layoutRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!layoutRef.current) return;

        layoutRef.current.innerHTML = "";

        const layout = new BoxLayout();
        layout.init(layoutRef.current, {
            useTabMenu: true,
        });

        const left = new ToolbarPanel();
        const canvas = new CanvasPanel();
        const right = new LayerPanelPanel();

        layout.registPanel(canvas); // 中间
        layout.registPanel(left); // 左
        layout.registPanel(right); // 右

        layout.applyLayoutConfig(defaultLayoutConfig);

        window['printConfig'] = () => {
            console.log(JSON.stringify(layout.getLayoutConfig(), null, 2));
        }

        return () => {
            layout.closePanelById("CanvasPanel");
            layout.closePanelById("ToolbarPanel");
            layout.closePanelById("LayerPanelPanel");
        }
    }, []);

    return <div ref={layoutRef} className={classNames(styles.app, "boxlayout")}/>;
}

export default App;
