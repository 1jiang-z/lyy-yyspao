/* 小红书解析功能 */
// 在renderMessages函数中，渲染完成后调用
function initXhsCardSliders() {
    document.querySelectorAll('.xhs-card-slider-container').forEach(container => {
        if (container.dataset.xhsInitialized) return;
        container.dataset.xhsInitialized = 'true';
        
        const slider = container.closest('.xhs-card-slider');
        const dots = slider?.querySelectorAll('.xhs-card-dot');
        const countSpan = slider?.querySelector('.xhs-card-image-count');
        const items = container.children;
        
        if (!items.length) return;
        
        const updateIndicator = () => {
            const scrollLeft = container.scrollLeft;
            const itemWidth = items[0].offsetWidth;
            const currentIndex = Math.round(scrollLeft / itemWidth);
            
            if (dots) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
            
            if (countSpan) {
                countSpan.innerHTML = `<i class="fas fa-image"></i> ${currentIndex + 1}/${items.length}`;
            }
        };
        
        container.addEventListener('scroll', updateIndicator);
        updateIndicator();
        
        // 触摸/拖动优化
        let isDown = false;
        let startX, scrollLeft;
        
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
        });
    });
}

// 小红书解析功能
let currentXhsData = null;

function initXhsParser() {
    const entryBtn = document.getElementById('xhs-parser-function');
    const modal = document.getElementById('xhs-parser-modal');
    const closeBtn = document.getElementById('close-xhs-parser');
    const parseBtn = document.getElementById('xhs-parse-btn');
    const linkInput = document.getElementById('xhs-link-input');
    const resultContainer = document.getElementById('xhs-result-container');
    const resultContent = document.getElementById('xhs-result-content');
    const loadingEl = document.getElementById('xhs-loading');
    
    if (!entryBtn || !modal) return;
    
    entryBtn.addEventListener('click', () => {
        hideModal(DOMElements.advancedModal.modal);
        resetXhsModal();
        showModal(modal);
    });
    
    closeBtn.addEventListener('click', () => hideModal(modal));
    
    // 支持回车解析
    linkInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') parseBtn.click();
    });
    
    parseBtn.addEventListener('click', async () => {
        const url = linkInput.value.trim();
        if (!url) {
            showNotification('请输入小红书分享链接', 'warning');
            return;
        }
        
        // 简单验证链接格式
        if (!url.includes('xhslink.com') && !url.includes('xiaohongshu.com')) {
            showNotification('请输入有效的小红书链接', 'warning');
            return;
        }
        
        resultContainer.style.display = 'block';
        loadingEl.style.display = 'block';
        resultContent.innerHTML = '';
        resultContent.appendChild(loadingEl);
        
        try {
            const data = await parseXhsLink(url);
            loadingEl.style.display = 'none';
            currentXhsData = data;
            renderXhsResult(data);
        } catch (error) {
            loadingEl.style.display = 'none';
            resultContent.innerHTML = `
                <div class="xhs-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>解析失败</p>
                    <p style="font-size:12px;opacity:0.7;">${error.message || '请检查链接是否正确'}</p>
                </div>
            `;
            showNotification('解析失败，请重试', 'error');
        }
    });
}

function resetXhsModal() {
    const resultContainer = document.getElementById('xhs-result-container');
    const linkInput = document.getElementById('xhs-link-input');
    if (resultContainer) resultContainer.style.display = 'none';
    if (linkInput) linkInput.value = '';
    currentXhsData = null;
}

async function parseXhsLink(url) {
    // 使用你的API接口
    const apiUrl = 'https://api.bugpk.com/api/xhsjx';
    
    try {
        const response = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 根据API返回格式调整
        if (data.code === 200 || data.success) {
            return {
                title: data.data?.title || data.title || '小红书笔记',
                desc: data.data?.desc || data.desc || '',
                author: {
                    name: data.data?.author?.name || data.author || '小红书用户',
                    avatar: data.data?.author?.avatar || data.avatar || ''
                },
                media: data.data?.images || data.images || [],
                video: data.data?.video || data.video || null,
                likes: data.data?.likes || data.likes || 0,
                comments: data.data?.comments || data.comments || 0,
                collects: data.data?.collects || data.collects || 0,
                time: data.data?.time || data.time || '',
                raw: data
            };
        } else {
            throw new Error(data.msg || '解析失败');
        }
    } catch (error) {
        console.error('小红书解析错误:', error);
        throw error;
    }
}

function renderXhsResult(data) {
    const resultContent = document.getElementById('xhs-result-content');
    
    // 作者信息
    const authorHtml = `
        <div class="xhs-author">
            ${data.author.avatar ? `
                <div class="xhs-author-avatar">
                    <img src="${data.author.avatar}" alt="${data.author.name}" style="width:100%;height:100%;object-fit:cover;">
                </div>
            ` : ''}
            <div class="xhs-author-info">
                <span class="xhs-author-name">${data.author.name}</span>
                ${data.time ? `<span class="xhs-time">${data.time}</span>` : ''}
            </div>
        </div>
    `;
    
    // 标题
    const titleHtml = data.title ? `<div class="xhs-title">${data.title}</div>` : '';
    
    // 媒体内容（图片/视频）
    let mediaHtml = '';
    if (data.video) {
        mediaHtml = `
            <div class="xhs-media-grid">
                <div class="xhs-media-item" onclick="viewImage('${data.video}')">
                    <video src="${data.video}" controls style="width:100%;height:100%;object-fit:cover;"></video>
                </div>
            </div>
        `;
    } else if (data.media && data.media.length > 0) {
        mediaHtml = `
            <div class="xhs-media-grid">
                ${data.media.map(img => `
                    <div class="xhs-media-item" onclick="viewImage('${img}')">
                        <img src="${img}" alt="图片" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 描述
    const descHtml = data.desc ? `<div class="xhs-desc">${data.desc}</div>` : '';
    
    // 统计数据
    const statsHtml = `
        <div class="xhs-stats">
            ${data.likes ? `<span><i class="fas fa-heart"></i> ${formatNumber(data.likes)}</span>` : ''}
            ${data.comments ? `<span><i class="fas fa-comment"></i> ${formatNumber(data.comments)}</span>` : ''}
            ${data.collects ? `<span><i class="fas fa-star"></i> ${formatNumber(data.collects)}</span>` : ''}
        </div>
    `;
    
    // 发送按钮
    const sendBtnHtml = `
        <button class="xhs-send-btn" onclick="sendXhsToChat()">
            <i class="fas fa-paper-plane"></i> 发送到聊天
        </button>
    `;
    
    resultContent.innerHTML = authorHtml + titleHtml + mediaHtml + descHtml + statsHtml + sendBtnHtml;
}

function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    return num.toString();
}

function sendXhsToChat() {
    if (!currentXhsData) return;
    
    const data = currentXhsData;
    
    // 构建小红书风格的卡片HTML
    const cardHtml = buildXhsCardHtml(data);
    
    // 发送卡片消息
    addMessage({
        id: Date.now(),
        sender: 'user',
        text: cardHtml,
        timestamp: new Date(),
        status: 'sent',
        type: 'normal',
        isHtml: true, // 标记为HTML内容
        xhsCard: true  // 标记为小红书卡片
    });
    
    playSound('send');
    
    // 关闭模态框
    hideModal(document.getElementById('xhs-parser-modal'));
    showNotification('已发送到聊天', 'success');
}

function buildXhsCardHtml(data) {
    // 构建图片轮播HTML
    const imagesHtml = data.media && data.media.length > 0 
        ? buildImageSlider(data.media) 
        : (data.video ? buildVideoPlayer(data.video) : '');
    
    return `
        <div class="xhs-share-card">
            <!-- 博主信息 -->
            <div class="xhs-card-header">
                <div class="xhs-card-avatar">
                    ${data.author.avatar 
                        ? `<img src="${data.author.avatar}" alt="${data.author.name}">` 
                        : `<i class="fas fa-user"></i>`
                    }
                </div>
                <div class="xhs-card-author-info">
                    <span class="xhs-card-author-name">${escapeHtml(data.author.name || '小红书用户')}</span>
                    <span class="xhs-card-badge">小红书</span>
                </div>
            </div>
            
            <!-- 图片/视频区域 -->
            ${imagesHtml}
            
            <!-- 标题 -->
            <div class="xhs-card-title">${escapeHtml(data.title || '')}</div>
            
            <!-- 内容描述 -->
            <div class="xhs-card-desc">${escapeHtml(data.desc || '').replace(/\n/g, '<br>')}</div>
            
            <!-- 底部来源标识 -->
            <div class="xhs-card-footer">
                <span class="xhs-card-source">🔗 来自小红书</span>
            </div>
        </div>
    `;
}

function buildImageSlider(images) {
    if (images.length === 0) return '';
    
    // 单张图片
    if (images.length === 1) {
        return `
            <div class="xhs-card-media xhs-card-single">
                <img src="${images[0]}" alt="笔记图片" onclick="viewImage('${images[0]}')">
                <div class="xhs-card-image-badge">
                    <i class="fas fa-image"></i>
                </div>
            </div>
        `;
    }
    
    // 多张图片 - 横向滑动
    const imageItems = images.map((img, index) => `
        <div class="xhs-card-slide-item" onclick="viewImage('${img}')">
            <img src="${img}" alt="图片${index + 1}" loading="lazy">
        </div>
    `).join('');
    
    return `
        <div class="xhs-card-media xhs-card-slider">
            <div class="xhs-card-slider-container">
                ${imageItems}
            </div>
            <div class="xhs-card-slider-indicator">
                <span class="xhs-card-image-count">
                    <i class="fas fa-image"></i> 1/${images.length}
                </span>
                <div class="xhs-card-slider-dots">
                    ${images.map((_, i) => `<span class="xhs-card-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function buildVideoPlayer(videoUrl) {
    return `
        <div class="xhs-card-media xhs-card-video">
            <video src="${videoUrl}" poster="" controls preload="metadata">
                您的浏览器不支持视频播放
            </video>
            <div class="xhs-card-video-badge">
                <i class="fas fa-play"></i>
            </div>
        </div>
    `;
}

// HTML转义函数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 在DOMContentLoaded中初始化
document.addEventListener('DOMContentLoaded', () => {
    initXhsParser();
});
