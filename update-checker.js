// 更新检测和触发功能

// 全局变量
let isUpdating = false;

// 检测数据新鲜度
function checkDataFreshness() {
    const metadata = newsData?.metadata;
    if (!metadata || !metadata.collection_date) return;
    
    const lastUpdate = new Date(metadata.collection_date);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    // 如果超过24小时，显示更新提示
    if (hoursSinceUpdate > 24) {
        showUpdatePrompt(hoursSinceUpdate);
    }
}

// 显示更新提示
function showUpdatePrompt(hoursSinceUpdate) {
    const days = Math.floor(hoursSinceUpdate / 24);
    const hours = Math.floor(hoursSinceUpdate % 24);
    
    let timeText;
    if (days > 0) {
        timeText = `${days}天${hours}小时`;
    } else {
        timeText = `${hours}小时`;
    }
    
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
        <div class="update-banner-content">
            <div class="update-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 24px; height: 24px; color: #f59e0b;">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2"/>
                </svg>
                <div>
                    <strong>新闻数据已过期</strong>
                    <p>最后更新：${timeText}前</p>
                </div>
            </div>
            <button id="update-trigger-btn" class="update-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px;">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2"/>
                </svg>
                立即更新
            </button>
        </div>
    `;
    
    // 插入到页面顶部
    const header = document.querySelector('.header');
    if (header) {
        header.after(updateBanner);
        
        // 绑定更新按钮事件
        document.getElementById('update-trigger-btn').addEventListener('click', triggerUpdate);
    }
}

// 触发更新
async function triggerUpdate() {
    if (isUpdating) {
        alert('更新正在进行中，请稍候...');
        return;
    }
    
    isUpdating = true;
    const btn = document.getElementById('update-trigger-btn');
    const originalText = btn.innerHTML;
    
    // 显示加载状态
    btn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px;">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2"/>
        </svg>
        正在更新...
    `;
    btn.disabled = true;
    
    try {
        // 方法1：调用GitHub Actions API（需要配置）
        // 这里提供一个简化版本，实际需要后端支持
        
        // 方法2：使用Webhook触发（推荐）
        const webhookUrl = 'YOUR_WEBHOOK_URL'; // 需要配置
        
        // 方法3：显示手动触发指引（最简单）
        showManualTriggerGuide();
        
    } catch (error) {
        console.error('触发更新失败:', error);
        alert('自动触发失败，请查看手动更新指南');
        showManualTriggerGuide();
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        isUpdating = false;
    }
}

// 显示手动触发指南
function showManualTriggerGuide() {
    const modal = document.createElement('div');
    modal.className = 'update-modal';
    modal.innerHTML = `
        <div class="update-modal-content">
            <div class="modal-header">
                <h3>📱 手动触发更新</h3>
                <button class="modal-close" onclick="this.closest('.update-modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <p>由于浏览器限制，请按以下步骤手动触发更新：</p>
                
                <div class="step-guide">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <strong>访问GitHub仓库</strong>
                            <p>打开：<a href="https://github.com/YOUR_USERNAME/YOUR_REPO/actions" target="_blank">GitHub Actions页面</a></p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <strong>找到workflow</strong>
                            <p>点击"每日法律新闻更新"</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <strong>手动运行</strong>
                            <p>点击"Run workflow"按钮 → 点击绿色"Run workflow"确认</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <strong>等待完成</strong>
                            <p>通常需要3-5分钟，完成后刷新本页面</p>
                        </div>
                    </div>
                </div>
                
                <div class="alternative-method">
                    <h4>⚡ 更简单的方法</h4>
                    <p>保存这个链接到手机主屏幕，点击即可触发更新：</p>
                    <a href="https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/daily-update.yml" 
                       class="quick-link" target="_blank">
                        🔗 一键更新链接
                    </a>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="this.closest('.update-modal').remove()">知道了</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 在页面加载完成后检测
document.addEventListener('DOMContentLoaded', () => {
    // 等待新闻数据加载
    setTimeout(() => {
        if (newsData) {
            checkDataFreshness();
        }
    }, 1000);
});