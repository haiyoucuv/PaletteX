import React from "react";
import styles from "./App.module.less";
import Toolbar from "./components/Toolbar";
import CanvasArea from "./components/CanvasArea";
import LayerPanel from "./components/LayerPanel";

function App() {
    return (
        <div className={styles.app}>
            <CanvasArea />
            <Toolbar />
            <LayerPanel />
        </div>
    );
}

export default App;
