import React, { useState } from "react";
import styles from "./ColorTools.module.less";

interface AdjustmentValue {
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
    tint: number;
}

const ColorTools: React.FC = () => {
    const [activeTab, setActiveTab] = useState('basic');
    const [adjustments, setAdjustments] = useState<AdjustmentValue>({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0
    });

    const handleAdjustmentChange = (key: keyof AdjustmentValue, value: number) => {
        setAdjustments(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const renderBasicAdjustments = () => (
        <div className={styles.adjustmentSection}>
            <div className={styles.adjustmentItem}>
                <label>亮度</label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.brightness}
                    onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
                />
                <span>{adjustments.brightness}</span>
            </div>
            <div className={styles.adjustmentItem}>
                <label>对比度</label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.contrast}
                    onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
                />
                <span>{adjustments.contrast}</span>
            </div>
            <div className={styles.adjustmentItem}>
                <label>饱和度</label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.saturation}
                    onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
                />
                <span>{adjustments.saturation}</span>
            </div>
            <div className={styles.adjustmentItem}>
                <label>色温</label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.temperature}
                    onChange={(e) => handleAdjustmentChange('temperature', Number(e.target.value))}
                />
                <span>{adjustments.temperature}</span>
            </div>
            <div className={styles.adjustmentItem}>
                <label>色调</label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.tint}
                    onChange={(e) => handleAdjustmentChange('tint', Number(e.target.value))}
                />
                <span>{adjustments.tint}</span>
            </div>
        </div>
    );

    const renderCurves = () => (
        <div className={styles.adjustmentSection}>
            <div className={styles.curveContainer}>
                <div className={styles.curveTitle}>RGB曲线</div>
                <div className={styles.curveCanvas}>
                    {/* 曲线编辑器将在这里实现 */}
                    <div className={styles.curvePlaceholder}>曲线编辑器</div>
                </div>
            </div>
            <div className={styles.curveContainer}>
                <div className={styles.curveTitle}>亮度曲线</div>
                <div className={styles.curveCanvas}>
                    <div className={styles.curvePlaceholder}>曲线编辑器</div>
                </div>
            </div>
        </div>
    );

    const renderColorBalance = () => (
        <div className={styles.adjustmentSection}>
            <div className={styles.balanceSection}>
                <h4>阴影</h4>
                <div className={styles.colorSliders}>
                    <div className={styles.colorSlider}>
                        <span>红</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                    <div className={styles.colorSlider}>
                        <span>绿</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                    <div className={styles.colorSlider}>
                        <span>蓝</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                </div>
            </div>
            <div className={styles.balanceSection}>
                <h4>中间调</h4>
                <div className={styles.colorSliders}>
                    <div className={styles.colorSlider}>
                        <span>红</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                    <div className={styles.colorSlider}>
                        <span>绿</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                    <div className={styles.colorSlider}>
                        <span>蓝</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                </div>
            </div>
            <div className={styles.balanceSection}>
                <h4>高光</h4>
                <div className={styles.colorSliders}>
                    <div className={styles.colorSlider}>
                        <span>红</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                    <div className={styles.colorSlider}>
                        <span>绿</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                    <div className={styles.colorSlider}>
                        <span>蓝</span>
                        <input type="range" min="-100" max="100" defaultValue="0" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHueSaturation = () => (
        <div className={styles.adjustmentSection}>
            <div className={styles.hueSection}>
                <h4>色相/饱和度</h4>
                <div className={styles.hueSliders}>
                    {['红', '橙', '黄', '绿', '青', '蓝', '紫', '洋红'].map((color, index) => (
                        <div key={color} className={styles.hueSlider}>
                            <span>{color}</span>
                            <input type="range" min="-100" max="100" defaultValue="0" />
                            <input type="range" min="-100" max="100" defaultValue="0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSplitToning = () => (
        <div className={styles.adjustmentSection}>
            <div className={styles.splitSection}>
                <h4>高光</h4>
                <div className={styles.splitControls}>
                    <div className={styles.colorPicker}>
                        <span>色相</span>
                        <input type="range" min="0" max="360" defaultValue="0" />
                    </div>
                    <div className={styles.colorPicker}>
                        <span>饱和度</span>
                        <input type="range" min="0" max="100" defaultValue="0" />
                    </div>
                </div>
            </div>
            <div className={styles.splitSection}>
                <h4>阴影</h4>
                <div className={styles.splitControls}>
                    <div className={styles.colorPicker}>
                        <span>色相</span>
                        <input type="range" min="0" max="360" defaultValue="0" />
                    </div>
                    <div className={styles.colorPicker}>
                        <span>饱和度</span>
                        <input type="range" min="0" max="100" defaultValue="0" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetail = () => (
        <div className={styles.adjustmentSection}>
            <div className={styles.adjustmentItem}>
                <label>锐化</label>
                <input type="range" min="0" max="100" defaultValue="0" />
                <span>0</span>
            </div>
            <div className={styles.adjustmentItem}>
                <label>降噪</label>
                <input type="range" min="0" max="100" defaultValue="0" />
                <span>0</span>
            </div>
            <div className={styles.adjustmentItem}>
                <label>清晰度</label>
                <input type="range" min="-100" max="100" defaultValue="0" />
                <span>0</span>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return renderBasicAdjustments();
            case 'curves':
                return renderCurves();
            case 'balance':
                return renderColorBalance();
            case 'hue':
                return renderHueSaturation();
            case 'split':
                return renderSplitToning();
            case 'detail':
                return renderDetail();
            default:
                return renderBasicAdjustments();
        }
    };

    return <div className={styles.colorTools}>
        <div className={styles.tabs}>
            <div 
                className={`${styles.tab} ${activeTab === 'basic' ? styles.active : ''}`}
                onClick={() => setActiveTab('basic')}
            >
                基础
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'curves' ? styles.active : ''}`}
                onClick={() => setActiveTab('curves')}
            >
                曲线
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'balance' ? styles.active : ''}`}
                onClick={() => setActiveTab('balance')}
            >
                色彩平衡
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'hue' ? styles.active : ''}`}
                onClick={() => setActiveTab('hue')}
            >
                色相/饱和度
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'split' ? styles.active : ''}`}
                onClick={() => setActiveTab('split')}
            >
                分离色调
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'detail' ? styles.active : ''}`}
                onClick={() => setActiveTab('detail')}
            >
                细节
            </div>
        </div>
        <div className={styles.content}>
            {renderTabContent()}
        </div>
    </div>;
};

export default ColorTools; 