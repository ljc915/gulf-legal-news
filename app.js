// 全局数据存储
let newsData = null;
let filteredNews = [];
let favorites = [];
let currentView = 'all'; // 'all' 或 'favorites'

// 国家名称映射
const countryNames = {
    'UAE': '🇦🇪 阿联酋',
    'Saudi Arabia': '🇸🇦 沙特阿拉伯',
    'Qatar': '🇶🇦 卡塔尔',
    'Kuwait': '🇰🇼 科威特',
    'Oman': '🇴🇲 阿曼',
    'Bahrain': '🇧🇭 巴林',
    'GCC': '🌍 海合会'
};

// 类别名称映射
const categoryNames = {
    'regulatory_compliance': '监管合规',
    'judicial_reform': '司法改革',
    'legislative_reform': '立法改革',
    'economic_regulation': '经济监管',
    'employment_law': '劳动法',
    'nationality_law': '国籍法',
    'judiciary': '司法',
    'dispute_resolution': '争议解决',
    'administrative_law': '行政法'
};

// 新闻类型映射
const newsTypeNames = {
    'new_regulation': '新规出台',
    'strategic_initiative': '战略倡议',
    'law_amendment': '法律修订',
    'policy_statement': '政策声明',
    'draft_legislation': '法律草案',
    'regional_harmonization': '区域统一',
    'administrative_decision': '行政决定',
    'regulatory_amendment': '监管修订',
    'new_legislation': '新立法',
    'procedural_regulation': '程序规定',
    'executive_decisions': '行政决定'
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    loadFavorites();
    await loadNewsData();
    setupEventListeners();
    updateFavoritesCount();
});

// 加载收藏列表
function loadFavorites() {
    const saved = localStorage.getItem('news_favorites');
    if (saved) {
        try {
            favorites = JSON.parse(saved);
        } catch (e) {
            console.error('加载收藏失败:', e);
            favorites = [];
        }
    }
}

// 保存收藏列表
function saveFavorites() {
    localStorage.setItem('news_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// 检查是否已收藏
function isFavorite(newsId) {
    return favorites.includes(newsId);
}

// 切换收藏状态
function toggleFavorite(newsId) {
    if (isFavorite(newsId)) {
        favorites = favorites.filter(id => id !== newsId);
    } else {
        favorites.push(newsId);
    }
    saveFavorites();
    
    // 如果当前在收藏视图，重新渲染
    if (currentView === 'favorites') {
        showFavorites();
    } else {
        renderNews();
    }
}

// 更新收藏计数
function updateFavoritesCount() {
    const countElement = document.getElementById('favorites-count');
    if (countElement) {
        countElement.textContent = favorites.length;
    }
}

// 加载新闻数据
async function loadNewsData() {
    try {
        const response = await fetch('gulf_legal_news_20260212.json');
        newsData = await response.json();
        
        // 更新统计面板
        updateStatsPanel();
        
        // 显示所有新闻
        filteredNews = newsData.legal_news;
        renderNews();
    } catch (error) {
        console.error('加载新闻数据失败:', error);
        document.getElementById('news-grid').innerHTML = '<div class="loading">加载数据失败，请刷新页面重试</div>';
    }
}

// 更新统计面板
function updateStatsPanel() {
    const metadata = newsData.metadata;
    
    document.getElementById('total-news').textContent = metadata.total_news;
    document.getElementById('countries-count').textContent = metadata.countries_covered.length;
    document.getElementById('sources-count').textContent = metadata.data_sources.length;
    document.getElementById('update-time').textContent = `最后更新：${metadata.collection_date}`;
    
    // 计算时间范围
    const dates = metadata.time_range.split(' to ');
    document.getElementById('time-range').textContent = `${dates[1].slice(5)}`;
}

// 渲染新闻列表
function renderNews() {
    const newsGrid = document.getElementById('news-grid');
    
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = '<div class="loading">没有符合条件的新闻</div>';
        return;
    }
    
    newsGrid.innerHTML = filteredNews.map(news => createNewsCard(news)).join('');
    attachFavoriteListeners();
}

// 显示收藏的新闻
function showFavorites() {
    const newsGrid = document.getElementById('news-grid');
    
    if (favorites.length === 0) {
        newsGrid.innerHTML = `
            <div class="empty-favorites">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 64px; height: 64px; margin-bottom: 1rem; opacity: 0.5;">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke-width="2"/>
                </svg>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">还没有收藏任何新闻</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">点击新闻卡片上的 ❤️ 图标来收藏</p>
            </div>
        `;
        return;
    }
    
    const favoriteNews = newsData.legal_news.filter(news => favorites.includes(news.id));
    newsGrid.innerHTML = favoriteNews.map(news => createNewsCard(news)).join('');
    attachFavoriteListeners();
}

// 将URL转换为Google翻译链接（自动翻译成中文）
function getTranslatedUrl(originalUrl) {
    if (!originalUrl) return '';
    return `https://translate.google.com/translate?sl=auto&tl=zh-CN&u=${encodeURIComponent(originalUrl)}`;
}

// 创建新闻卡片
function createNewsCard(news) {
    const countryDisplay = countryNames[news.country] || news.country;
    const categoryDisplay = categoryNames[news.category] || news.category;
    const newsTypeDisplay = newsTypeNames[news.news_type] || news.news_type;
    const isFav = isFavorite(news.id);
    const favIcon = isFav ? '❤️' : '🤍';
    const favClass = isFav ? 'favorited' : '';
    
    // 截取摘要的前150个字符
    const summary = news.summary.length > 150 ? news.summary.substring(0, 150) + '...' : news.summary;
    
    // 处理关键点（最多显示5个）
    const keyPoints = news.key_points ? news.key_points.slice(0, 5).map(point => 
        `<li>${translateKeyPoint(point)}</li>`
    ).join('') : '';
    
    // 生成翻译后的URL
    const translatedUrl = getTranslatedUrl(news.source_url);
    
    return `
        <div class="news-card ${favClass}" data-country="${news.country}" data-category="${news.category}" data-id="${news.id}">
            <button class="favorite-btn" data-id="${news.id}" title="${isFav ? '取消收藏' : '收藏'}">
                ${favIcon}
            </button>
            <div class="news-header">
                <span class="country-badge">${countryDisplay}</span>
                <span class="news-date">📅 ${news.publication_date}</span>
            </div>
            
            <h3 class="news-title">${translateTitle(news)}</h3>
            
            <div class="news-meta">
                <span class="meta-badge">📂 ${categoryDisplay}</span>
                <span class="meta-badge">🏷️ ${newsTypeDisplay}</span>
                ${news.effective_date ? `<span class="meta-badge">✅ 生效：${news.effective_date}</span>` : ''}
            </div>
            
            <p class="news-summary">${translateSummary(news)}</p>
            
            ${keyPoints ? `
            <div class="key-points">
                <h4>🔑 关键要点</h4>
                <ul>${keyPoints}</ul>
            </div>
            ` : ''}
            
            <div class="news-footer">
                <span style="font-size: 0.85rem; color: var(--text-secondary);">📰 ${news.source}</span>
                ${translatedUrl ? `<a href="${translatedUrl}" target="_blank" class="source-link" title="点击查看中文翻译版本">查看原文（中文翻译）→</a>` : ''}
            </div>
        </div>
    `;
}

// 附加收藏按钮监听器
function attachFavoriteListeners() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newsId = parseInt(e.target.dataset.id);
            toggleFavorite(newsId);
        });
    });
}

// 翻译标题
function translateTitle(news) {
    const translations = {
        'UAE Enforces Mandatory Advertiser Permit for Social Media Promotions': '阿联酋强制实施社交媒体推广广告商许可证',
        'Dubai Unveils 2026-2028 Strategy to Strengthen Rule of Law': '迪拜发布2026-2028年强化法治战略',
        'UAE Civil Code Removes Gambling Provisions in Major Legal Reform': '阿联酋民法典在重大法律改革中移除赌博条款',
        'Qatar Justice Minister Emphasizes Legal Reform for Sustainable Investment': '卡塔尔司法部长强调法律改革促进可持续投资',
        'Qatar Proposes New PPP Law to Modernize Public-Private Partnerships': '卡塔尔提议新公私合作伙伴法以现代化公私合作',
        'Saudi Arabia Approves Regulations for Four Special Economic Zones': '沙特阿拉伯批准四个经济特区法规',
        'GCC Countries Implement Unified Labor Law Reforms for 2026': '海合会国家实施2026年统一劳动法改革',
        'Kuwait Cabinet Withdraws Nationality Certificates from Certain Persons': '科威特内阁撤销特定人员国籍证书',
        'Kuwait Approves Judicial Transfers and Arab Monetary Fund Subscription': '科威特批准司法调动和阿拉伯货币基金认购',
        'Oman Amends Work Permits and Introduces Occupational Injuries Regulation': '阿曼修订工作许可并引入职业伤害条例',
        'Bahrain Enacts Three New Laws in Early 2026': '巴林2026年初颁布三项新法律',
        'Dubai Establishes Rules for Citizens\' Housing Dispute Settlement Committee': '迪拜建立公民住房纠纷解决委员会规则',
        'Qatar Issues Emiri Decisions on Aviation andOther Sectors': '卡塔尔发布航空及其他领域埃米尔决定'
    };
    
    return translations[news.title] || news.title;
}

// 翻译摘要
function translateSummary(news) {
    const summaries = {
        1: '自2026年2月1日起，所有在社交媒体平台从事广告活动的个人必须获得有效的广告商许可证。该规定适用于所有数字平台上的付费和非付费推广活动。',
        2: '迪拜政府法律事务部发布2026-2028年战略，重点关注法律流程现代化、人工智能技术整合以及提升机构绩效。',
        3: '阿联酋新民事交易法移除民法典中所有与赌博相关的条款（第1012-1021条），标志着向GCGRA专业博彩监管框架的过渡。',
        4: '卡塔尔司法部长在2026年多哈法律论坛上表示，明确的立法、独立的司法机构和高效的司法制度是吸引可持续投资的核心。',
        5: '卡塔尔正在起草更新的公私合作伙伴法，作为更广泛立法现代化的一部分，与外国投资法和破产法改革相协调。',
        6: '沙特阿拉伯批准吉赞、拉斯海尔、阿卜杜拉国王经济城和云计算区四个经济特区的专属法规，2026年4月生效。',
        7: '海合会成员国（巴林、科威特、阿曼、卡塔尔、沙特、阿联酋）实施协调的劳动法改革，这是该地区首次协调劳动实践。',
        8: '科威特内阁第23/2026号决定命令撤销特定人员的科威特国籍证书。',
        9: '科威特发布多项法令，包括司法调动（第10/2026号法令）和批准阿拉伯货币基金增资认购（第7/2026号法令）。',
        10: '阿曼发布两项关键部长决定：修订工作许可法规和新的职业伤害与疾病条例。',
        11: '巴林在2026年初通过三项新法律（第1/2026、2/2026、3/2026号法律），涵盖多个法律领域。',
        12: '迪拜发布第7/2025号决定，为公民住房建设纠纷解决委员会制定程序规则。',
        13: '卡塔尔发布第5/2026号埃米尔决定和第111/2025号法令，涵盖各种行政和监管事项。'
    };
    
    return summaries[news.id] || news.summary;
}

// 翻译关键点
function translateKeyPoint(point) {
    if (point.includes('Mandatory permit')) return '所有广告商必须持有强制许可证';
    if (point.includes('Covers social media')) return '覆盖社交媒体、网站、博客和数字平台';
    if (point.includes('Fines range')) return '违规罚款从5,000至1,000,000迪拉姆不等';
    if (point.includes('Integration of AI')) return '在部门运营和服务中整合人工智能';
    if (point.includes('Complete removal')) return '完全移除赌博条款（第1012-1021条）';
    if (point.includes('Foreign investors')) return '外国投资者可参与1400+商业活动';
    if (point.includes('Four SEZs')) return '四个经济特区：吉赞、拉斯海尔、阿卜杜拉国王经济城、云计算区';
    if (point.includes('Digital recordkeeping')) return '数字记录和电子合同强制执行';
    return point.substring(0, 50) + '...';
}

// 设置事件监听器
function setupEventListeners() {
    // 国家筛选
    document.getElementById('country-filter').addEventListener('change', filterNews);
    
    // 类别筛选
    document.getElementById('category-filter').addEventListener('change', filterNews);
    
    // 视图切换
    document.getElementById('view-all').addEventListener('click', () => switchView('all'));
    document.getElementById('view-favorites').addEventListener('click', () => switchView('favorites'));
}

// 切换视图
function switchView(view) {
    currentView = view;
    
    // 更新按钮状态
    document.getElementById('view-all').classList.toggle('active', view === 'all');
    document.getElementById('view-favorites').classList.toggle('active', view === 'favorites');
    
    // 更新筛选栏显示状态
    const filterSection = document.querySelector('.filter-section');
    filterSection.style.display = view === 'all' ? 'block' : 'none';
    
    // 渲染对应内容
    if (view === 'all') {
        filterNews();
    } else {
        showFavorites();
    }
}

// 筛选新闻
function filterNews() {
    const countryFilter = document.getElementById('country-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    filteredNews = newsData.legal_news.filter(news => {
        const matchCountry = countryFilter === 'all' || news.country === countryFilter;
        const matchCategory = categoryFilter === 'all' || news.category === categoryFilter;
        return matchCountry && matchCategory;
    });
    
    renderNews();
}