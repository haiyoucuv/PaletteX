import React, { useState } from "react";
import styles from "./PresetLibrary.module.less";

interface Preset {
    id: string;
    name: string;
    category: string;
    thumbnail?: string;
    isFavorite: boolean;
}

const PresetLibrary: React.FC = () => {
    const [activeTab, setActiveTab] = useState('presets');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // 模拟预设数据
    const mockPresets: Preset[] = [
        { id: '1', name: '温暖日落', category: '风景', isFavorite: true },
        { id: '2', name: '冷色调', category: '人像', isFavorite: false },
        { id: '3', name: '黑白经典', category: '黑白', isFavorite: true },
        { id: '4', name: '复古胶片', category: '复古', isFavorite: false },
        { id: '5', name: '清新自然', category: '风景', isFavorite: false },
        { id: '6', name: '电影色调', category: '电影', isFavorite: true },
        { id: '7', name: '高对比度', category: '人像', isFavorite: false },
        { id: '8', name: '柔和光线', category: '人像', isFavorite: true },
    ];

    const categories = ['all', '风景', '人像', '黑白', '复古', '电影'];

    const filteredPresets = mockPresets.filter(preset => {
        const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderPresets = () => (
        <div className={styles.presetsSection}>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="搜索预设..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.categoryFilter}>
                {categories.map(category => (
                    <button
                        key={category}
                        className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category === 'all' ? '全部' : category}
                    </button>
                ))}
            </div>
            <div className={styles.presetGrid}>
                {filteredPresets.map(preset => (
                    <div key={preset.id} className={styles.presetItem}>
                        <div className={styles.presetThumbnail}>
                            <div className={styles.thumbnailPlaceholder}>
                                {preset.name.charAt(0)}
                            </div>
                            <button 
                                className={`${styles.favoriteBtn} ${preset.isFavorite ? styles.favorited : ''}`}
                                onClick={() => {/* 切换收藏状态 */}}
                            >
                                ★
                            </button>
                        </div>
                        <div className={styles.presetInfo}>
                            <div className={styles.presetName}>{preset.name}</div>
                            <div className={styles.presetCategory}>{preset.category}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className={styles.historySection}>
            <div className={styles.historyHeader}>
                <h3>历史记录</h3>
                <button className={styles.clearBtn}>清空历史</button>
            </div>
            <div className={styles.historyList}>
                <div className={styles.historyItem}>
                    <div className={styles.historyThumbnail}>
                        <div className={styles.thumbnailPlaceholder}>图</div>
                    </div>
                    <div className={styles.historyInfo}>
                        <div className={styles.historyName}>风景照片_001</div>
                        <div className={styles.historyTime}>2024-01-15 14:30</div>
                    </div>
                </div>
                <div className={styles.historyItem}>
                    <div className={styles.historyThumbnail}>
                        <div className={styles.thumbnailPlaceholder}>图</div>
                    </div>
                    <div className={styles.historyInfo}>
                        <div className={styles.historyName}>人像照片_002</div>
                        <div className={styles.historyTime}>2024-01-14 16:20</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFavorites = () => (
        <div className={styles.favoritesSection}>
            <div className={styles.favoritesHeader}>
                <h3>收藏夹</h3>
            </div>
            <div className={styles.presetGrid}>
                {mockPresets.filter(preset => preset.isFavorite).map(preset => (
                    <div key={preset.id} className={styles.presetItem}>
                        <div className={styles.presetThumbnail}>
                            <div className={styles.thumbnailPlaceholder}>
                                {preset.name.charAt(0)}
                            </div>
                            <button 
                                className={`${styles.favoriteBtn} ${styles.favorited}`}
                                onClick={() => {/* 取消收藏 */}}
                            >
                                ★
                            </button>
                        </div>
                        <div className={styles.presetInfo}>
                            <div className={styles.presetName}>{preset.name}</div>
                            <div className={styles.presetCategory}>{preset.category}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderImportExport = () => (
        <div className={styles.importExportSection}>
            <div className={styles.importSection}>
                <h3>导入预设</h3>
                <div className={styles.importArea}>
                    <div className={styles.importPlaceholder}>
                        <div className={styles.importIcon}>📁</div>
                        <div className={styles.importText}>拖拽预设文件到此处</div>
                        <button className={styles.importBtn}>选择文件</button>
                    </div>
                </div>
            </div>
            <div className={styles.exportSection}>
                <h3>导出预设</h3>
                <div className={styles.exportOptions}>
                    <button className={styles.exportBtn}>导出当前预设</button>
                    <button className={styles.exportBtn}>导出收藏夹</button>
                    <button className={styles.exportBtn}>导出所有预设</button>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'presets':
                return renderPresets();
            case 'history':
                return renderHistory();
            case 'favorites':
                return renderFavorites();
            case 'import':
                return renderImportExport();
            default:
                return renderPresets();
        }
    };

    return <div className={styles.presetLibrary}>
        <div className={styles.tabs}>
            <div 
                className={`${styles.tab} ${activeTab === 'presets' ? styles.active : ''}`}
                onClick={() => setActiveTab('presets')}
            >
                预设库
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                onClick={() => setActiveTab('history')}
            >
                历史记录
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
                onClick={() => setActiveTab('favorites')}
            >
                收藏夹
            </div>
            <div 
                className={`${styles.tab} ${activeTab === 'import' ? styles.active : ''}`}
                onClick={() => setActiveTab('import')}
            >
                导入/导出
            </div>
        </div>
        <div className={styles.content}>
            {renderTabContent()}
        </div>
    </div>;
};

export default PresetLibrary; 