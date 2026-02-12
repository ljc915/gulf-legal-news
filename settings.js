// 全局变量
let sourcesData = { custom_sources: [], metadata: {} };

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadSources();
    setupEventListeners();
});

// 加载网站配置
async function loadSources() {
    try {
        const response = await fetch('custom_sources.json');
        sourcesData = await response.json();
        renderSourcesList();
    } catch (error) {
        console.error('加载配置失败:', error);
        document.getElementById('sources-list').innerHTML = '<div class="empty-state">加载配置失败，请刷新页面重试</div>';
    }
}

// 渲染网站列表
function renderSourcesList() {
    const listContainer = document.getElementById('sources-list');
    
    if (sourcesData.custom_sources.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2"/>
                </svg>
                <p>还没有添加任何网站，点击上方添加第一个吧！</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = sourcesData.custom_sources.map(source => createSourceCard(source)).join('');
    
    // 添加事件监听
    attachSourceCardListeners();
}

// 创建网站卡片
function createSourceCard(source) {
    const priorityClass = `badge-priority-${source.priority}`;
    const disabledClass = source.enabled ? '' : 'disabled';
    const toggleText = source.enabled ? '禁用' : '启用';
    const toggleClass = source.enabled ? '' : 'disabled';
    
    return `
        <div class="source-card ${disabledClass}" data-id="${source.id}">
            <div class="source-card-header">
                <div class="source-info">
                    <h4>${source.name}</h4>
                    <div class="source-meta">
                        <span class="source-badge badge-country">🌍 ${source.country}</span>
                        <span class="source-badge badge-language">🗣️ ${source.language}</span>
                        <span class="source-badge ${priorityClass}">⚡ ${getPriorityText(source.priority)}</span>
                    </div>
                    <div class="source-url">🔗 ${source.url}</div>
                    ${source.description ? `<div class="source-description">📝 ${source.description}</div>` : ''}
                </div>
                <div class="source-actions">
                    <button class="action-btn toggle ${toggleClass}" data-id="${source.id}">
                        ${toggleText}
                    </button>
                    <button class="action-btn delete" data-id="${source.id}">
                        删除
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 获取优先级文本
function getPriorityText(priority) {
    const map = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
    };
    return map[priority] || priority;
}

// 设置事件监听器
function setupEventListeners() {
    // 添加网站表单
    document.getElementById('add-source-form').addEventListener('submit', handleAddSource);
    
    // 导出配置
    document.getElementById('export-btn').addEventListener('click', handleExport);
    
    // 导入配置
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    
    document.getElementById('import-file').addEventListener('change', handleImport);
}

// 添加网站卡片事件监听
function attachSourceCardListeners() {
    // 切换启用/禁用
    document.querySelectorAll('.action-btn.toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            toggleSource(id);
        });
    });
    
    // 删除
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('确定要删除这个网站吗？')) {
                deleteSource(id);
            }
        });
    });
}

// 处理添加网站
function handleAddSource(e) {
    e.preventDefault();
    
    const newSource = {
        id: Date.now(),
        name: document.getElementById('source-name').value,
        url: document.getElementById('source-url').value,
        country: document.getElementById('source-country').value,
        language: document.getElementById('source-language').value,
        priority: document.getElementById('source-priority').value,
        description: document.getElementById('source-description').value,
        enabled: true
    };
    
    sourcesData.custom_sources.push(newSource);
    sourcesData.metadata.total_sources = sourcesData.custom_sources.length;
    sourcesData.metadata.last_updated = new Date().toISOString().split('T')[0];
    
    saveConfig();
    renderSourcesList();
    
    // 清空表单
    e.target.reset();
    
    // 显示成功消息
    alert('✅ 网站添加成功！');
}

// 切换启用状态
function toggleSource(id) {
    const source = sourcesData.custom_sources.find(s => s.id === id);
    if (source) {
        source.enabled = !source.enabled;
        sourcesData.metadata.last_updated = new Date().toISOString().split('T')[0];
        saveConfig();
        renderSourcesList();
    }
}

// 删除网站
function deleteSource(id) {
    sourcesData.custom_sources = sourcesData.custom_sources.filter(s => s.id !== id);
    sourcesData.metadata.total_sources = sourcesData.custom_sources.length;
    sourcesData.metadata.last_updated = new Date().toISOString().split('T')[0];
    saveConfig();
    renderSourcesList();
    alert('🗑️ 网站已删除');
}

// 保存配置（浏览器环境中保存到localStorage）
function saveConfig() {
    localStorage.setItem('custom_sources', JSON.stringify(sourcesData));
    console.log('配置已保存到本地存储');
}

// 导出配置
function handleExport() {
    const dataStr = JSON.stringify(sourcesData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom_sources_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('✅ 配置已导出！');
}

// 导入配置
function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // 验证数据格式
            if (!importedData.custom_sources || !Array.isArray(importedData.custom_sources)) {
                throw new Error('无效的配置文件格式');
            }
            
            if (confirm('导入配置会覆盖当前设置，确定要继续吗？')) {
                sourcesData = importedData;
                saveConfig();
                renderSourcesList();
                alert('✅ 配置导入成功！');
            }
        } catch (error) {
            console.error('导入失败:', error);
            alert('❌ 导入失败：' + error.message);
        }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // 清空文件选择
}

// 初始化时从localStorage加载（如果有的话）
function initializeFromLocalStorage() {
    const saved = localStorage.getItem('custom_sources');
    if (saved) {
        try {
            sourcesData = JSON.parse(saved);
        } catch (e) {
            console.error('加载本地配置失败:', e);
        }
    }
}