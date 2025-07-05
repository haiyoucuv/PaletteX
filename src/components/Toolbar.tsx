import React from "react";
import styles from "./Toolbar.module.less";

const Toolbar: React.FC = () => {
    return (
        <div className={styles.toolbar}>
            {/* 工具按钮后续添加 */}
            <div className={styles.toolItem}>选择</div>
            <div className={styles.toolItem}>移动</div>
            <div className={styles.toolItem}>裁剪</div>
        </div>
    );
};

export default Toolbar; 