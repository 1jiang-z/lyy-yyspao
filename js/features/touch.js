/* ========================================
 * 戳戳梦角 - 亲密互动功能
 * 两边都有独立的身体部位+触摸方式字卡库
 * ======================================== */

(function() {
    'use strict';

    // ===== 默认身体部位字卡库（口语化，常用的）=====
    const DEFAULT_BODY_PARTS_HIM = [
        '脸', '头', '耳朵', '脸蛋', '头发', '眼睛', '鼻子', '嘴巴',
        '脖子', '肩膀', '后背', '手臂', '手', '手腕', '指尖',
        '胸口', '腹肌', '腰', '腰窝', '肚子',
        '大腿', '膝盖', '小腿',
        '喉结', '锁骨', '后颈', '睫毛', '鼻梁', '虎牙', '酒窝'
    ];

    const DEFAULT_BODY_PARTS_HER = [
        '脸', '头', '耳朵', '头发', '手',
        '腰', '肩膀', '脸蛋', '脖子', '后背'
    ];

    // ===== 默认触摸方式字卡库 =====
    const DEFAULT_TOUCH_TYPES_HIM = [
        '戳戳', '摸摸', '捏捏', '亲亲', '咬咬', '蹭蹭',
        '抱抱', '牵牵', '揉揉', '刮刮', '顺顺',
        '捏捏脸', '摸摸头', '牵牵手', '抱一抱',
        '晚安吻', '捏胸肌', '摸腹肌', '咬耳朵',
        '刮鼻子', '摸头发', '蹭蹭他', '挽胳膊'
    ];

    const DEFAULT_TOUCH_TYPES_HER = [
        '戳你脸', '摸你头', '牵你手', '抱抱你',
        '搂你腰', '亲你脸', '戳戳', '摸摸',
        '捏捏', '蹭蹭', '揉揉'
    ];

    // ===== 他可能添加的候选身体部位（戳他的）=====
    const CANDIDATE_BODY_PARTS_HIM = [
        '手背', '手掌', '手指', '指甲',
        '脚踝', '脚背', '脚趾',
        '眉毛', '眼皮', '脸颊', '下巴',
        '手肘', '腋下', '肋骨',
        '屁股', '尾巴骨',
        '腰侧', '侧腰', '后背心'
    ];

    // ===== 他可能添加的候选触摸方式（戳他的）=====
    const CANDIDATE_TOUCH_TYPES_HIM = [
        '拍拍', '打打', '戳戳腰',
        '摸摸耳朵', '捏捏胳膊',
        '扯衣角', '扯领带',
        '靠肩膀', '埋胸口',
        '摸喉结', '摸锁骨',
        '顺毛摸', '挠痒痒',
        '摸腰窝', '捏指尖',
        '碰膝盖', '摸虎牙',
        '摸睫毛', '摸鼻梁',
        '蹭脸蛋', '抱胳膊'
    ];

    // ===== 他可能添加的候选（他戳你的）=====
    const CANDIDATE_BODY_PARTS_HER = [
        '肚子', '大腿', '小腿', '脚踝',
        '眉毛', '睫毛', '鼻子',
        '手腕', '指尖', '手背'
    ];

    const CANDIDATE_TOUCH_TYPES_HER = [
        '捏捏脸', '摸摸头', '顺顺毛',
        '捏捏腰', '揉揉肩', '拍拍头',
        '挠痒痒', '刮鼻子', '咬耳朵',
        '亲额头', '抱一抱', '蹭蹭你'
    ];

    // ===== 数据结构 =====
    let touchData = {
        // 戳他的字卡库
        hisBodyParts: [],
        hisTouchTypes: [],
        // 他戳你的字卡库
        herBodyParts: [],
        herTouchTypes: [],
        // 按钮列表
        hisParts: [],
        herParts: [],
        // 记录
        records: [],
        // 时间戳
        lastAutoAddHim: 0,
        lastAutoAddHer: 0,
        lastShuffleHim: 0,
        lastShuffleHer: 0,
        lastHeTouchesYou: 0
    };

    // ===== 当前状态 =====
    let currentTab = 'him';
    let currentManageTab = 'bodyParts'; // bodyParts / touchTypes
    let currentManageSide = 'him'; // him / her 管理的是哪一边

    // ===== 图标映射 =====
    function getIconForName(name) {
        const iconMap = [
            { keywords: ['脸', '脸蛋', '脸颊', '下巴', '额头'], icon: 'fa-face-smile' },
            { keywords: ['头', '头发', '脑袋', '顺毛'], icon: 'fa-hand' },
            { keywords: ['耳朵', '耳'], icon: 'fa-ear-listen' },
            { keywords: ['眼睛', '睫毛', '眼皮', '眉毛'], icon: 'fa-eye' },
            { keywords: ['鼻子', '鼻梁'], icon: 'fa-face-smile-wink' },
            { keywords: ['嘴', '亲', '吻', '咬', '虎牙', '酒窝', '唇'], icon: 'fa-kiss-wink-heart' },
            { keywords: ['脖子', '颈', '喉结', '后颈'], icon: 'fa-user' },
            { keywords: ['肩', '锁骨', '肩膀'], icon: 'fa-shield-heart' },
            { keywords: ['后背', '背', '后背心'], icon: 'fa-user' },
            { keywords: ['手', '牵', '指尖', '手腕', '手掌', '手指', '指甲', '手背', '手肘', '胳膊', '手臂', '挽'], icon: 'fa-hands' },
            { keywords: ['胸', '胸肌', '胸口'], icon: 'fa-dumbbell' },
            { keywords: ['腹', '腹肌', '肚子', '肚'], icon: 'fa-fire' },
            { keywords: ['腰', '腰窝', '侧腰', '腰侧'], icon: 'fa-heart' },
            { keywords: ['腿', '大腿', '小腿', '膝盖', '膝'], icon: 'fa-person-walking' },
            { keywords: ['脚', '脚踝', '脚背', '脚趾'], icon: 'fa-shoe-prints' },
            { keywords: ['抱', '拥抱', '蹭', '埋'], icon: 'fa-people-arrows' },
            { keywords: ['衣服', '衣角', '领带'], icon: 'fa-user-tie' },
            { keywords: ['猫', '顺毛', '蹭蹭'], icon: 'fa-cat' },
            { keywords: ['拍', '打', '挠'], icon: 'fa-hand-point-up' },
            { keywords: ['屁股', '尾巴骨'], icon: 'fa-person' },
            { keywords: ['腋下', '肋骨'], icon: 'fa-user' }
        ];

        for (const item of iconMap) {
            for (const kw of item.keywords) {
                if (name.includes(kw)) {
                    return item.icon;
                }
            }
        }
        return 'fa-heart';
    }

    // ===== 初始化 =====
    function init() {
        loadData();
        startAutoCheck();
    }

    // ===== 加载数据 =====
    function loadData() {
        try {
            const saved = localStorage.getItem('touch_data');
            if (saved) {
                const data = JSON.parse(saved);
                touchData.hisBodyParts = data.hisBodyParts || [...DEFAULT_BODY_PARTS_HIM];
                touchData.hisTouchTypes = data.hisTouchTypes || [...DEFAULT_TOUCH_TYPES_HIM];
                touchData.herBodyParts = data.herBodyParts || [...DEFAULT_BODY_PARTS_HER];
                touchData.herTouchTypes = data.herTouchTypes || [...DEFAULT_TOUCH_TYPES_HER];
                touchData.hisParts = data.hisParts || [];
                touchData.herParts = data.herParts || [];
                touchData.records = data.records || [];
                touchData.lastAutoAddHim = data.lastAutoAddHim || 0;
                touchData.lastAutoAddHer = data.lastAutoAddHer || 0;
                touchData.lastShuffleHim = data.lastShuffleHim || 0;
                touchData.lastShuffleHer = data.lastShuffleHer || 0;
                touchData.lastHeTouchesYou = data.lastHeTouchesYou || 0;

                // 如果按钮列表为空，生成一批
                if (touchData.hisParts.length === 0) {
                    shuffleHisParts();
                }
                if (touchData.herParts.length === 0) {
                    shuffleHerParts();
                }
            } else {
                touchData.hisBodyParts = [...DEFAULT_BODY_PARTS_HIM];
                touchData.hisTouchTypes = [...DEFAULT_TOUCH_TYPES_HIM];
                touchData.herBodyParts = [...DEFAULT_BODY_PARTS_HER];
                touchData.herTouchTypes = [...DEFAULT_TOUCH_TYPES_HER];
                touchData.records = [];
                touchData.lastAutoAddHim = 0;
                touchData.lastAutoAddHer = 0;
                touchData.lastShuffleHim = 0;
                touchData.lastShuffleHer = 0;
                touchData.lastHeTouchesYou = 0;
                shuffleHisParts();
                shuffleHerParts();
            }
            saveData();
        } catch (e) {
            console.error('加载戳戳数据失败:', e);
            touchData.hisBodyParts = [...DEFAULT_BODY_PARTS_HIM];
            touchData.hisTouchTypes = [...DEFAULT_TOUCH_TYPES_HIM];
            touchData.herBodyParts = [...DEFAULT_BODY_PARTS_HER];
            touchData.herTouchTypes = [...DEFAULT_TOUCH_TYPES_HER];
            touchData.hisParts = [];
            touchData.herParts = [];
            touchData.records = [];
        }
    }

    // ===== 保存数据 =====
    function saveData() {
        try {
            localStorage.setItem('touch_data', JSON.stringify(touchData));
        } catch (e) {
            console.error('保存戳戳数据失败:', e);
        }
    }

    // ===== 生成戳他的按钮 =====
    function shuffleHisParts() {
        const parts = [];
        const count = 9;

        for (let i = 0; i < count; i++) {
            if (Math.random() < 0.5 && touchData.hisBodyParts.length > 0 && touchData.hisTouchTypes.length > 0) {
                const bodyPart = touchData.hisBodyParts[Math.floor(Math.random() * touchData.hisBodyParts.length)];
                const touchType = touchData.hisTouchTypes[Math.floor(Math.random() * touchData.hisTouchTypes.length)];
                const name = touchType + bodyPart;
                if (!parts.find(p => p.name === name)) {
                    parts.push({
                        id: 'shuffle_him_' + Date.now() + '_' + i,
                        name: name,
                        icon: getIconForName(name),
                        count: 0,
                        isGenerated: true
                    });
                } else {
                    i--;
                }
            } else {
                const candidates = touchData.hisTouchTypes.filter(t => t.length >= 3);
                if (candidates.length > 0) {
                    const name = candidates[Math.floor(Math.random() * candidates.length)];
                    if (!parts.find(p => p.name === name)) {
                        parts.push({
                            id: 'shuffle_him_' + Date.now() + '_' + i,
                            name: name,
                            icon: getIconForName(name),
                            count: 0,
                            isGenerated: true
                        });
                    } else {
                        i--;
                    }
                }
            }
        }

        const customParts = touchData.hisParts.filter(p => !p.isGenerated);
        touchData.hisParts = [...customParts, ...parts];
        touchData.lastShuffleHim = Date.now();
        saveData();
    }

    // ===== 生成他戳你的按钮 =====
    function shuffleHerParts() {
        const parts = [];
        const count = 9;

        for (let i = 0; i < count; i++) {
            if (Math.random() < 0.5 && touchData.herBodyParts.length > 0 && touchData.herTouchTypes.length > 0) {
                const bodyPart = touchData.herBodyParts[Math.floor(Math.random() * touchData.herBodyParts.length)];
                const touchType = touchData.herTouchTypes[Math.floor(Math.random() * touchData.herTouchTypes.length)];
                const name = touchType + bodyPart;
                if (!parts.find(p => p.name === name)) {
                    parts.push({
                        id: 'shuffle_her_' + Date.now() + '_' + i,
                        name: name,
                        icon: getIconForName(name),
                        count: 0,
                        isGenerated: true
                    });
                } else {
                    i--;
                }
            } else {
                const candidates = touchData.herTouchTypes.filter(t => t.length >= 3);
                if (candidates.length > 0) {
                    const name = candidates[Math.floor(Math.random() * candidates.length)];
                    if (!parts.find(p => p.name === name)) {
                        parts.push({
                            id: 'shuffle_her_' + Date.now() + '_' + i,
                            name: name,
                            icon: getIconForName(name),
                            count: 0,
                            isGenerated: true
                        });
                    } else {
                        i--;
                    }
                }
            }
        }

        const customParts = touchData.herParts.filter(p => !p.isGenerated);
        touchData.herParts = [...customParts, ...parts];
        touchData.lastShuffleHer = Date.now();
        saveData();
    }

    // ===== 他添加新的戳戳按钮（戳他的）=====
    function checkAutoAddHim() {
        // 6% 概率，没有时间限制，每次检测都独立概率
        if (Math.random() > 0.06) {
            return false;
        }

        // 从字卡库中选一个触摸方式 + 一个身体部位，组合成新按钮
        if (touchData.hisBodyParts.length === 0 || touchData.hisTouchTypes.length === 0) {
            return false;
        }

        const bodyPart = touchData.hisBodyParts[Math.floor(Math.random() * touchData.hisBodyParts.length)];
        const touchType = touchData.hisTouchTypes[Math.floor(Math.random() * touchData.hisTouchTypes.length)];
        const name = touchType + bodyPart;

        // 检查是否已经有这个按钮了
        if (touchData.hisParts.find(p => p.name === name)) {
            return false;
        }

        // 添加新按钮到按钮列表
        const newPart = {
            id: 'auto_him_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            name: name,
            icon: getIconForName(name),
            count: 0,
            isGenerated: true,
            isAutoAdded: true // 标记是他主动加的
        };
        touchData.hisParts.push(newPart);

        // 加一条系统记录
        const record = {
            id: 'touch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: 'system',
            systemType: 'newButton',
            systemSide: 'him',
            name: name,
            direction: 'him',
            timestamp: Date.now()
        };
        touchData.records.unshift(record);
        if (touchData.records.length > 200) touchData.records = touchData.records.slice(0, 200);

        saveData();

        const notifyText = '他多了一个可以戳的地方：' + name;
        if (typeof window.showNotification === 'function') {
            window.showNotification(notifyText, 'info', 3000);
        }

        return { name: name };
    }

    // ===== 他添加新的戳戳按钮（他戳你的）=====
    function checkAutoAddHer() {
        // 6% 概率，没有时间限制，每次检测都独立概率
        if (Math.random() > 0.06) {
            return false;
        }

        // 从字卡库中选一个触摸方式 + 一个身体部位，组合成新按钮
        if (touchData.herBodyParts.length === 0 || touchData.herTouchTypes.length === 0) {
            return false;
        }

        const bodyPart = touchData.herBodyParts[Math.floor(Math.random() * touchData.herBodyParts.length)];
        const touchType = touchData.herTouchTypes[Math.floor(Math.random() * touchData.herTouchTypes.length)];
        const name = touchType + bodyPart;

        // 检查是否已经有这个按钮了
        if (touchData.herParts.find(p => p.name === name)) {
            return false;
        }

        // 添加新按钮到按钮列表
        const newPart = {
            id: 'auto_her_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            name: name,
            icon: getIconForName(name),
            count: 0,
            isGenerated: true,
            isAutoAdded: true // 标记是他主动加的
        };
        touchData.herParts.push(newPart);

        // 加一条系统记录
        const record = {
            id: 'touch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: 'system',
            systemType: 'newButton',
            systemSide: 'her',
            name: name,
            direction: 'her',
            timestamp: Date.now()
        };
        touchData.records.unshift(record);
        if (touchData.records.length > 200) touchData.records = touchData.records.slice(0, 200);

        saveData();

        const notifyText = '他想这样戳你：' + name;
        if (typeof window.showNotification === 'function') {
            window.showNotification(notifyText, 'info', 3000);
        }

        return { name: name };
    }

    // ===== 他主动戳你（更频繁，想戳就戳）=====
    function checkHeTouchesYou() {
        const now = Date.now();
        // 每 1-2 小时就可能戳你一次，没有严格限制
        const minInterval = 1 * 60 * 60 * 1000; // 1小时

        if (now - touchData.lastHeTouchesYou < minInterval) return false;
        touchData.lastHeTouchesYou = now;

        // 50% 概率他会戳你（比较频繁）
        if (Math.random() > 0.5) {
            saveData();
            return false;
        }

        if (touchData.herParts.length === 0) {
            saveData();
            return false;
        }

        // 随机选 1-3 个部位戳
        const touchCount = 1 + Math.floor(Math.random() * 3);
        const results = [];

        for (let i = 0; i < touchCount; i++) {
            const part = touchData.herParts[Math.floor(Math.random() * touchData.herParts.length)];
            part.count++;

            const record = {
                id: 'touch_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
                partId: part.id,
                partName: part.name,
                direction: 'her',
                type: 'touch',
                isHeInitiative: true,
                timestamp: Date.now() - (touchCount - 1 - i) * 3000
            };
            touchData.records.unshift(record);
            results.push(part.name);
        }

        if (touchData.records.length > 200) touchData.records = touchData.records.slice(0, 200);

        saveData();

        const notifyText = touchCount === 1
            ? '他戳了你：' + results[0] + ' ♡'
            : '他戳了你好几下：' + results.join('、') + ' ♡';
        if (typeof window.showNotification === 'function') {
            window.showNotification(notifyText, 'info', 3000);
        }

        return results;
    }

    // ===== 触摸（我戳他）=====
    function touchHim(partId) {
        const part = touchData.hisParts.find(p => p.id === partId);
        if (!part) return;

        part.count++;

        const record = {
            id: 'touch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            partId: partId,
            partName: part.name,
            direction: 'him',
            type: 'touch',
            timestamp: Date.now()
        };
        touchData.records.unshift(record);
        if (touchData.records.length > 200) touchData.records = touchData.records.slice(0, 200);

        saveData();
        return record;
    }

    // ===== 统计函数 =====
    function getTodayHimCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        return touchData.records.filter(r => r.timestamp >= todayStart && r.direction === 'him' && r.type === 'touch').length;
    }

    function getTodayHerCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        return touchData.records.filter(r => r.timestamp >= todayStart && r.direction === 'her' && r.type === 'touch').length;
    }

    function getTotalHimCount() {
        return touchData.records.filter(r => r.direction === 'him' && r.type === 'touch').length;
    }

    function getTotalHerCount() {
        return touchData.records.filter(r => r.direction === 'her' && r.type === 'touch').length;
    }

    // ===== 格式化时间 =====
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < 60 * 1000) return '刚刚';
        if (diff < 60 * 60 * 1000) return Math.floor(diff / (60 * 1000)) + '分钟前';
        if (diff < oneDay) return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
        if (diff < 7 * oneDay) return Math.floor(diff / oneDay) + '天前';
        return (date.getMonth() + 1) + '.' + date.getDate() + ' ' +
               date.getHours().toString().padStart(2, '0') + ':' +
               date.getMinutes().toString().padStart(2, '0');
    }

    // ===== 渲染主界面 =====
    function render() {
        const container = document.getElementById('touch-content');
        if (!container) return;

        const todayHim = getTodayHimCount();
        const todayHer = getTodayHerCount();
        const totalHim = getTotalHimCount();
        const totalHer = getTotalHerCount();

        const partnerName = (typeof window.settings !== 'undefined' && window.settings.partnerName)
            ? window.settings.partnerName : '梦角';

        container.innerHTML = `
            <!-- 标签切换 -->
            <div class="touch-tabs">
                <button class="touch-tab-btn ${currentTab === 'him' ? 'active' : ''}" data-tab="him" onclick="window.TouchApp.switchTab('him')">
                    <i class="fas fa-mars"></i> 戳${partnerName}
                </button>
                <button class="touch-tab-btn ${currentTab === 'her' ? 'active' : ''}" data-tab="her" onclick="window.TouchApp.switchTab('her')">
                    <i class="fas fa-venus"></i> ${partnerName}戳你
                </button>
                <button class="touch-tab-btn ${currentTab === 'records' ? 'active' : ''}" data-tab="records" onclick="window.TouchApp.switchTab('records')">
                    <i class="fas fa-list"></i> 记录
                </button>
            </div>

            <!-- 戳他面板 -->
            <div class="touch-panel" id="touch-panel-him" style="display:${currentTab === 'him' ? 'block' : 'none'};">
                <div class="touch-stats">
                    <div class="touch-stat-item">
                        <div class="touch-stat-num">${todayHim}</div>
                        <div class="touch-stat-label">今日戳${partnerName}</div>
                    </div>
                    <div class="touch-stat-divider"></div>
                    <div class="touch-stat-item">
                        <div class="touch-stat-num">${totalHim}</div>
                        <div class="touch-stat-label">累计戳${partnerName}</div>
                    </div>
                </div>

                <div class="touch-parts-grid">
                    ${touchData.hisParts.map(part => `
                        <button class="touch-part-btn ${part.heWants ? 'he-wants' : ''}" data-id="${part.id}" data-side="him" onmousedown="window.TouchApp.startLongPress(event, '${part.id}', 'him')" onmouseup="window.TouchApp.endLongPress(event, '${part.id}', 'him')" onmouseleave="window.TouchApp.cancelLongPress()" ontouchstart="window.TouchApp.startLongPress(event, '${part.id}', 'him')" ontouchend="window.TouchApp.endLongPress(event, '${part.id}', 'him')" ontouchcancel="window.TouchApp.cancelLongPress()">
                            ${part.heWants ? '<span class="he-wants-badge"><i class="fas fa-heart"></i> 他想要</span>' : ''}
                            <div class="touch-part-check"><i class="fas fa-check"></i></div>
                            <div class="touch-part-icon">
                                <i class="fas ${part.icon}"></i>
                            </div>
                            <div class="touch-part-name">${part.name}</div>
                            <div class="touch-part-count">${part.count}次</div>
                        </button>
                    `).join('')}
                </div>

                <div class="touch-action-btns">
                    <button class="touch-add-btn" onclick="window.TouchApp.showAddDialog('him')">
                        <i class="fas fa-plus"></i> 自定义
                    </button>
                    <button class="touch-add-btn touch-shuffle-btn" onclick="window.TouchApp.shuffleHim()">
                        <i class="fas fa-shuffle"></i> 换一批
                    </button>
                    <button class="touch-add-btn touch-manage-btn" onclick="window.TouchApp.enterEditMode('him')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                </div>
            </div>

            <!-- 他戳你面板 -->
            <div class="touch-panel" id="touch-panel-her" style="display:${currentTab === 'her' ? 'block' : 'none'};">
                <div class="touch-stats">
                    <div class="touch-stat-item">
                        <div class="touch-stat-num">${todayHer}</div>
                        <div class="touch-stat-label">今日被戳</div>
                    </div>
                    <div class="touch-stat-divider"></div>
                    <div class="touch-stat-item">
                        <div class="touch-stat-num">${totalHer}</div>
                        <div class="touch-stat-label">累计被戳</div>
                    </div>
                </div>

                <div class="touch-parts-grid">
                    ${touchData.herParts.map(part => `
                        <button class="touch-part-btn touch-part-her" data-id="${part.id}" data-side="her" onmousedown="window.TouchApp.startLongPress(event, '${part.id}', 'her')" onmouseup="window.TouchApp.endLongPress(event, '${part.id}', 'her')" onmouseleave="window.TouchApp.cancelLongPress()" ontouchstart="window.TouchApp.startLongPress(event, '${part.id}', 'her')" ontouchend="window.TouchApp.endLongPress(event, '${part.id}', 'her')" ontouchcancel="window.TouchApp.cancelLongPress()">
                            <div class="touch-part-check"><i class="fas fa-check"></i></div>
                            <div class="touch-part-icon">
                                <i class="fas ${part.icon}"></i>
                            </div>
                            <div class="touch-part-name">${part.name}</div>
                            <div class="touch-part-count">${part.count}次</div>
                        </button>
                    `).join('')}
                </div>

                <div class="touch-action-btns">
                    <button class="touch-add-btn touch-shuffle-btn" onclick="window.TouchApp.shuffleHer()">
                        <i class="fas fa-shuffle"></i> 等他换方式
                    </button>
                    <button class="touch-add-btn touch-manage-btn" onclick="window.TouchApp.enterEditMode('her')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                </div>

                <div class="touch-her-hint">
                    <i class="fas fa-heart"></i>
                    <span>这些是他戳你的地方～点一下只会痒痒哦</span>
                </div>
            </div>

            <!-- 记录面板 -->
            <div class="touch-panel" id="touch-panel-records" style="display:${currentTab === 'records' ? 'block' : 'none'};">
                <div class="touch-records-list">
                    ${touchData.records.length === 0 ? `
                        <div class="touch-empty">
                            <i class="fas fa-hand-sparkles"></i>
                            <p>还没有戳戳记录</p>
                            <span>快去戳戳${partnerName}吧～</span>
                        </div>
                    ` : touchData.records.slice(0, 50).map(record => renderRecordItem(record)).join('')}
                </div>
                ${touchData.records.length > 0 ? `
                    <button class="touch-clear-btn" onclick="window.TouchApp.clearRecords()">
                        <i class="fas fa-trash-alt"></i> 清空记录
                    </button>
                ` : ''}
            </div>

            <!-- 字卡库管理面板 -->
            <div class="touch-panel" id="touch-panel-manage" style="display:none;">
                <div class="touch-manage-header">
                    <button class="touch-back-btn" onclick="window.TouchApp.hideManage()">
                        <i class="fas fa-arrow-left"></i> 返回
                    </button>
                    <span class="touch-manage-title" id="touch-manage-title">字卡库管理</span>
                </div>
                <div class="touch-sub-tabs">
                    <button class="touch-sub-tab ${currentManageTab === 'bodyParts' ? 'active' : ''}" onclick="window.TouchApp.switchManageTab('bodyParts')" id="touch-manage-tab-body">
                        身体部位 (0)
                    </button>
                    <button class="touch-sub-tab ${currentManageTab === 'touchTypes' ? 'active' : ''}" onclick="window.TouchApp.switchManageTab('touchTypes')" id="touch-manage-tab-type">
                        触摸方式 (0)
                    </button>
                </div>
                <div class="touch-manage-list" id="touch-manage-list"></div>
                <div class="touch-manage-add">
                    <input type="text" id="touch-manage-input" placeholder="添加新的..." class="touch-manage-input">
                    <button class="touch-manage-add-btn" onclick="window.TouchApp.addWord()">
                        <i class="fas fa-plus"></i> 添加
                    </button>
                </div>
            </div>

            <!-- 编辑模式底部栏 -->
            <div class="touch-edit-bar" id="touch-edit-bar" style="display:none;">
                <button class="touch-edit-btn touch-edit-select-all" onclick="window.TouchApp.selectAllParts()">全选</button>
                <span class="touch-edit-count">已选 0 / 0</span>
                <button class="touch-edit-btn touch-edit-delete" onclick="window.TouchApp.batchDelete()">
                    <i class="fas fa-trash-alt"></i> 删除
                </button>
                <button class="touch-edit-btn touch-edit-cancel" onclick="window.TouchApp.exitEditMode()">取消</button>
            </div>
        `;

        // 如果管理面板是打开的，渲染管理列表
        const managePanel = document.getElementById('touch-panel-manage');
        if (managePanel && managePanel.style.display !== 'none') {
            updateManageUI();
        }
    }

    // ===== 渲染单条记录 =====
    function renderRecordItem(record) {
        if (record.type === 'system') {
            const isBodyPart = record.systemType === 'bodyPart';
            const sideText = record.systemSide === 'him' ? '（戳他的）' : '（他戳你的）';
            return `
                <div class="touch-record-item touch-record-system">
                    <div class="touch-record-icon dir-system">
                        <i class="fas fa-magic"></i>
                    </div>
                    <div class="touch-record-info">
                        <div class="touch-record-name">
                            他添加了${isBodyPart ? '身体部位' : '戳戳方式'}${sideText}：${record.name}
                        </div>
                        <div class="touch-record-time">${formatTime(record.timestamp)}</div>
                    </div>
                    <div class="touch-record-dir">
                        <span class="system-badge">系统</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="touch-record-item ${record.isHeInitiative ? 'touch-record-he-initiative' : ''}">
                    <div class="touch-record-icon ${record.direction === 'him' ? 'dir-him' : 'dir-her'}">
                        <i class="fas ${record.direction === 'him' ? 'fa-arrow-right' : 'fa-arrow-left'}"></i>
                    </div>
                    <div class="touch-record-info">
                        <div class="touch-record-name">
                            ${record.partName}
                            ${record.isHeInitiative ? '<span class="he-initiative-badge">他主动</span>' : ''}
                        </div>
                        <div class="touch-record-time">${formatTime(record.timestamp)}</div>
                    </div>
                    <div class="touch-record-dir">
                        ${record.direction === 'him' ? '你→他' : '他→你'}
                    </div>
                </div>
            `;
        }
    }

    // ===== 切换标签 =====
    function switchTab(tab) {
        currentTab = tab;
        // 切换标签时退出编辑模式
        if (isEditMode) {
            exitEditMode();
        }
        render();
    }

    // ===== 显示字卡库管理 =====
    function showManage(side) {
        currentManageSide = side;
        currentManageTab = 'bodyParts';

        document.getElementById('touch-panel-him').style.display = 'none';
        document.getElementById('touch-panel-her').style.display = 'none';
        document.getElementById('touch-panel-records').style.display = 'none';
        document.getElementById('touch-panel-manage').style.display = 'block';

        document.querySelectorAll('.touch-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        updateManageUI();
    }

    // ===== 隐藏管理面板 =====
    function hideManage() {
        document.getElementById('touch-panel-manage').style.display = 'none';
        switchTab(currentManageSide);
    }

    // ===== 切换管理面板标签 =====
    function switchManageTab(tab) {
        currentManageTab = tab;
        updateManageUI();
    }

    // ===== 更新管理面板UI =====
    function updateManageUI() {
        const bodyParts = currentManageSide === 'him' ? touchData.hisBodyParts : touchData.herBodyParts;
        const touchTypes = currentManageSide === 'him' ? touchData.hisTouchTypes : touchData.herTouchTypes;
        const list = currentManageTab === 'bodyParts' ? bodyParts : touchTypes;

        // 更新标题
        const titleEl = document.getElementById('touch-manage-title');
        if (titleEl) {
            titleEl.textContent = currentManageSide === 'him' ? '戳他的字卡库' : '他戳你的字卡库';
        }

        // 更新标签数字
        const bodyTab = document.getElementById('touch-manage-tab-body');
        const typeTab = document.getElementById('touch-manage-tab-type');
        if (bodyTab) bodyTab.textContent = `身体部位 (${bodyParts.length})`;
        if (typeTab) typeTab.textContent = `触摸方式 (${touchTypes.length})`;

        // 更新标签激活状态
        document.querySelectorAll('.touch-sub-tab').forEach(btn => {
            const isBody = btn.textContent.includes('身体部位');
            btn.classList.toggle('active', isBody ? currentManageTab === 'bodyParts' : currentManageTab === 'touchTypes');
        });

        // 更新列表
        const listEl = document.getElementById('touch-manage-list');
        if (listEl) {
            if (list.length === 0) {
                listEl.innerHTML = `<div class="touch-empty"><p>还没有内容</p></div>`;
            } else {
                listEl.innerHTML = `
                    <div class="touch-word-list">
                        ${list.map((word, index) => `
                            <div class="touch-word-item">
                                <span class="touch-word-text">${word}</span>
                                <button class="touch-word-del" onclick="window.TouchApp.deleteWord(${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        // 更新输入框placeholder
        const inputEl = document.getElementById('touch-manage-input');
        if (inputEl) {
            inputEl.placeholder = '添加新的' + (currentManageTab === 'bodyParts' ? '身体部位' : '触摸方式') + '...';
        }
    }

    // ===== 添加字卡 =====
    function addWord() {
        const input = document.getElementById('touch-manage-input');
        if (!input) return;
        const word = input.value.trim();
        if (!word) return;

        const bodyParts = currentManageSide === 'him' ? touchData.hisBodyParts : touchData.herBodyParts;
        const touchTypes = currentManageSide === 'him' ? touchData.hisTouchTypes : touchData.herTouchTypes;
        const list = currentManageTab === 'bodyParts' ? bodyParts : touchTypes;

        if (list.includes(word)) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('已经有这个了~', 'info', 1500);
            }
            return;
        }

        list.push(word);
        saveData();
        input.value = '';
        updateManageUI();

        if (typeof window.showNotification === 'function') {
            window.showNotification('添加成功！', 'success', 1500);
        }
    }

    // ===== 删除字卡 =====
    function deleteWord(index) {
        if (!confirm('确定要删除这个吗？')) return;

        const bodyParts = currentManageSide === 'him' ? touchData.hisBodyParts : touchData.herBodyParts;
        const touchTypes = currentManageSide === 'him' ? touchData.hisTouchTypes : touchData.herTouchTypes;
        const list = currentManageTab === 'bodyParts' ? bodyParts : touchTypes;

        list.splice(index, 1);
        saveData();
        updateManageUI();
    }

    // ===== 换一批 =====
    function shuffleHim() {
        shuffleHisParts();
        render();
        if (typeof window.showNotification === 'function') {
            window.showNotification('换好啦～', 'success', 1500);
        }
    }

    function shuffleHer() {
        shuffleHerParts();
        render();
        if (typeof window.showNotification === 'function') {
            window.showNotification('他换了新的戳戳方式～', 'success', 1500);
        }
    }

    // ===== 执行戳他 =====
    function doTouchHim(partId) {
        const record = touchHim(partId);
        if (!record) return;

        const btn = document.querySelector(`#touch-panel-him .touch-part-btn[data-id="${partId}"]`);
        if (btn) {
            btn.classList.add('touched');
            setTimeout(() => btn.classList.remove('touched'), 300);

            const countEl = btn.querySelector('.touch-part-count');
            const part = touchData.hisParts.find(p => p.id === partId);
            if (countEl && part) {
                countEl.textContent = part.count + '次';
            }
        }

        updateHimStats();
        showTouchEffect(btn, record.partName, 'him');
    }

    // ===== 点他戳你的部位（痒痒效果）=====
    function tapHerPart(partId) {
        const btn = document.querySelector(`#touch-panel-her .touch-part-btn[data-id="${partId}"]`);
        if (btn) {
            btn.classList.add('tapped');
            setTimeout(() => btn.classList.remove('tapped'), 400);

            const effect = document.createElement('div');
            effect.className = 'touch-effect tickle-effect';
            effect.textContent = '~♡~';
            btn.appendChild(effect);
            setTimeout(() => effect.remove(), 800);
        }

        const hints = [
            '这是他戳你的地方哦～',
            '你自己戳不算数啦',
            '等他来戳你嘛～',
            '痒痒～',
            '只能他戳你哦',
            '再等一等他吧'
        ];
        const hint = hints[Math.floor(Math.random() * hints.length)];
        if (typeof window.showNotification === 'function') {
            window.showNotification(hint, 'info', 1200);
        }
    }

    // ===== 更新统计 =====
    function updateHimStats() {
        const himPanel = document.getElementById('touch-panel-him');
        if (!himPanel) return;
        const statsEl = himPanel.querySelector('.touch-stats');
        if (!statsEl) return;
        const todayHim = getTodayHimCount();
        const totalHim = getTotalHimCount();
        const items = statsEl.querySelectorAll('.touch-stat-num');
        if (items.length >= 2) {
            items[0].textContent = todayHim;
            items[1].textContent = totalHim;
        }
    }

    // ===== 触摸特效 =====
    function showTouchEffect(btn, partName, direction) {
        if (!btn) return;
        const effect = document.createElement('div');
        effect.className = 'touch-effect';
        effect.textContent = direction === 'him' ? '♡' : '~';
        btn.appendChild(effect);
        setTimeout(() => effect.remove(), 600);
    }

    // ===== 自定义部位对话框 =====
    function showAddDialog(direction) {
        const name = prompt('请输入名称：');
        if (!name || !name.trim()) return;

        const icon = prompt('请输入图标（Font Awesome 图标名，如 fa-heart）：\n留空使用默认爱心图标', 'fa-heart');

        const newPart = {
            id: 'custom_' + Date.now(),
            name: name.trim(),
            icon: icon && icon.trim() ? icon.trim() : 'fa-heart',
            count: 0
        };

        if (direction === 'him') {
            touchData.hisParts.push(newPart);
        } else {
            touchData.herParts.push(newPart);
        }

        saveData();
        render();
        switchTab(direction);
    }

    // ===== 清空记录 =====
    function clearRecords() {
        if (!confirm('确定要清空所有戳戳记录吗？')) return;

        touchData.records = [];
        touchData.hisParts.forEach(p => p.count = 0);
        touchData.herParts.forEach(p => p.count = 0);

        saveData();
        render();
    }

    // ===== 打开功能 =====
    function open() {
        const modal = document.getElementById('touch-modal');
        if (modal) {
            if (typeof window.showModal === 'function') {
                window.showModal(modal);
            } else if (typeof window.homeShowModal === 'function') {
                window.homeShowModal(modal);
            } else {
                modal.classList.add('active');
            }
            currentTab = 'him';
            render();
        }
    }

    // ===== 后台自动检测（只要在线就有概率触发）=====
    function startAutoCheck() {
        // 页面可见时检测
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                checkAutoAddHim();
                checkAutoAddHer();
                checkHeTouchesYou();
            }
        });

        // 定时检测（每2分钟一次，没有冷却限制）
        setInterval(function() {
            if (document.visibilityState === 'visible') {
                checkAutoAddHim();
                checkAutoAddHer();
                checkHeTouchesYou();
            }
        }, 2 * 60 * 1000);

        // 初始化后延迟一下也检测一次
        setTimeout(function() {
            checkAutoAddHim();
            checkAutoAddHer();
            checkHeTouchesYou();
        }, 8000);
    }

    // ===== 关闭功能 =====
    function close() {
        const modal = document.getElementById('touch-modal');
        if (modal) {
            if (typeof window.hideModal === 'function') {
                window.hideModal(modal);
            } else if (typeof window.homeHideModal === 'function') {
                window.homeHideModal(modal);
            } else {
                modal.classList.remove('active');
            }
        }
    }

    // ===== 暴露到全局 =====
    // ===== 编辑模式 & 批量删除 =====
    let longPressTimer = null;
    let isLongPressed = false;
    let longPressPartId = null;
    let longPressSide = null;
    let isEditMode = false;
    let editModeSide = null;
    let selectedParts = [];

    function toggleSelectPart(partId) {
        const idx = selectedParts.indexOf(partId);
        const wasSelected = idx > -1;
        if (wasSelected) {
            selectedParts.splice(idx, 1);
        } else {
            selectedParts.push(partId);
        }
        updateEditModeUI();

        // 选中时触发抖动动画
        if (!wasSelected) {
            const btn = document.querySelector(`.touch-part-btn[data-id="${partId}"][data-side="${editModeSide}"]`);
            if (btn) {
                btn.style.animation = 'none';
                // 强制重排以重启动画
                void btn.offsetWidth;
                btn.style.animation = '';
            }
        }
    }

    function selectAllParts() {
        const parts = editModeSide === 'him' ? touchData.hisParts : touchData.herParts;
        if (selectedParts.length === parts.length) {
            selectedParts = [];
        } else {
            selectedParts = parts.map(p => p.id);
        }
        updateEditModeUI();
    }

    function batchDelete() {
        if (selectedParts.length === 0) return;
        if (!confirm(`确定要删除选中的 ${selectedParts.length} 个吗？`)) return;

        if (editModeSide === 'him') {
            touchData.hisParts = touchData.hisParts.filter(p => !selectedParts.includes(p.id));
        } else {
            touchData.herParts = touchData.herParts.filter(p => !selectedParts.includes(p.id));
        }
        saveData();
        selectedParts = [];
        exitEditMode();
        render();
        if (typeof window.showNotification === 'function') {
            window.showNotification('已删除', 'success', 1500);
        }
    }

    function enterEditMode(side) {
        isEditMode = true;
        editModeSide = side;
        selectedParts = [];
        updateEditModeUI();
    }

    function exitEditMode() {
        isEditMode = false;
        editModeSide = null;
        selectedParts = [];
        // 清除所有按钮的编辑状态
        document.querySelectorAll('.touch-part-btn').forEach(btn => {
            btn.classList.remove('edit-mode', 'selected');
        });
        // 隐藏编辑底部栏
        const bar = document.getElementById('touch-edit-bar');
        if (bar) bar.style.display = 'none';
    }

    function updateEditModeUI() {
        // 更新按钮选中状态
        document.querySelectorAll('.touch-part-btn').forEach(btn => {
            const id = parseInt(btn.dataset.id);
            const side = btn.dataset.side;
            if (isEditMode && side === editModeSide) {
                btn.classList.add('edit-mode');
                if (selectedParts.includes(id)) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            } else {
                btn.classList.remove('edit-mode', 'selected');
            }
        });

        // 更新底部编辑栏
        const bar = document.getElementById('touch-edit-bar');
        if (bar) {
            if (isEditMode) {
                bar.style.display = 'flex';
                const parts = editModeSide === 'him' ? touchData.hisParts : touchData.herParts;
                const countEl = bar.querySelector('.touch-edit-count');
                const allBtn = bar.querySelector('.touch-edit-select-all');
                if (countEl) countEl.textContent = `已选 ${selectedParts.length} / ${parts.length}`;
                if (allBtn) allBtn.textContent = selectedParts.length === parts.length ? '取消全选' : '全选';
            } else {
                bar.style.display = 'none';
            }
        }
    }

    function startLongPress(e, partId, side) {
        // 编辑模式下不触发长按
        if (isEditMode) return;

        isLongPressed = false;
        longPressPartId = partId;
        longPressSide = side;

        longPressTimer = setTimeout(() => {
            isLongPressed = true;
            // 长按进入编辑模式
            enterEditMode(side);
            // 震动反馈
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 500); // 500ms长按
    }

    function endLongPress(e, partId, side) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // 如果是长按触发的，不执行点击事件
        if (isLongPressed) {
            isLongPressed = false;
            return;
        }
        // 编辑模式下：点击选中/取消
        if (isEditMode && side === editModeSide) {
            toggleSelectPart(partId);
            return;
        }
        // 短按：执行原来的点击逻辑
        if (side === 'him') {
            doTouchHim(partId);
        } else {
            tapHerPart(partId);
        }
    }

    function cancelLongPress() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        isLongPressed = false;
    }

    function clearAllDeleteState() {
        document.querySelectorAll('.touch-part-btn.show-delete').forEach(btn => {
            btn.classList.remove('show-delete');
        });
    }

    function deletePart(partId, side) {
        if (!confirm('确定要删除这个按钮吗？')) return;

        if (side === 'him') {
            const index = touchData.hisParts.findIndex(p => p.id === partId);
            if (index !== -1) {
                touchData.hisParts.splice(index, 1);
                saveData();
                render();
                if (typeof showNotification === 'function') {
                    showNotification('已删除', 'success', 1500);
                }
            }
        } else {
            const index = touchData.herParts.findIndex(p => p.id === partId);
            if (index !== -1) {
                touchData.herParts.splice(index, 1);
                saveData();
                render();
                if (typeof showNotification === 'function') {
                    showNotification('已删除', 'success', 1500);
                }
            }
        }
    }

    function editPart(partId, side) {
        const parts = side === 'him' ? touchData.hisParts : touchData.herParts;
        const part = parts.find(p => p.id === partId);
        if (!part) return;

        const newName = prompt('修改按钮名称：', part.name);
        if (!newName || !newName.trim()) return;

        part.name = newName.trim();
        part.icon = getIconForName(part.name);
        saveData();
        render();

        if (typeof showNotification === 'function') {
            showNotification('修改成功～', 'success', 1500);
        }
    }

    function getIconForName(name) {
        const iconMap = {
            '脸': 'fa-face-smile',
            '脸蛋': 'fa-face-smile',
            '脸颊': 'fa-face-smile',
            '额头': 'fa-face-smile',
            '鼻子': 'fa-face-smile',
            '耳朵': 'fa-ear',
            '嘴唇': 'fa-face-kiss',
            '嘴巴': 'fa-face-kiss',
            '下巴': 'fa-face-smile',
            '脖子': 'fa-person',
            '肩膀': 'fa-person',
            '手臂': 'fa-hand',
            '胳膊': 'fa-hand',
            '手': 'fa-hand',
            '手掌': 'fa-hand',
            '手指': 'fa-hand-pointer',
            '肚子': 'fa-person',
            '肚子/腰': 'fa-person',
            '腰': 'fa-person',
            '屁股': 'fa-person',
            '腿': 'fa-person',
            '大腿': 'fa-person',
            '小腿': 'fa-person',
            '膝盖': 'fa-person',
            '脚': 'fa-shoe-prints',
            '脚丫': 'fa-shoe-prints',
            '头': 'fa-user',
            '头发': 'fa-user',
            '背': 'fa-user',
            '后背': 'fa-user',
            '胸': 'fa-heart',
            '心脏': 'fa-heart',
            '心': 'fa-heart',
            '脸颊/腰': 'fa-person',
            '手/腰': 'fa-hand',
            '手/肚子': 'fa-hand',
            '抱': 'fa-hands-holding',
            '拥抱': 'fa-hands-holding',
            '牵手': 'fa-hand-holding-hand',
            '摸头': 'fa-hand',
            '摸脸': 'fa-hand',
            '亲': 'fa-face-kiss',
            '亲亲': 'fa-face-kiss',
            '咬': 'fa-teeth',
            '捏': 'fa-hand',
            '掐': 'fa-hand',
            '挠痒痒': 'fa-hand',
            '戳': 'fa-hand-pointer',
            '戳戳': 'fa-hand-pointer',
            '弹脑门': 'fa-hand',
            '顶': 'fa-head-side',
            '顶顶': 'fa-head-side'
        };
        return iconMap[name] || 'fa-hand-pointer';
    }

    // 点击空白处清除所有删除状态
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.touch-part-btn')) {
            clearAllDeleteState();
        }
    });

    window.TouchApp = {
        init: init,
        open: open,
        close: close,
        render: render,
        switchTab: switchTab,
        switchManageTab: switchManageTab,
        doTouchHim: doTouchHim,
        tapHerPart: tapHerPart,
        showAddDialog: showAddDialog,
        clearRecords: clearRecords,
        shuffleHim: shuffleHim,
        shuffleHer: shuffleHer,
        showManage: showManage,
        hideManage: hideManage,
        addWord: addWord,
        deleteWord: deleteWord,
        startLongPress: startLongPress,
        endLongPress: endLongPress,
        cancelLongPress: cancelLongPress,
        deletePart: deletePart,
        editPart: editPart,
        enterEditMode: enterEditMode,
        exitEditMode: exitEditMode,
        toggleSelectPart: toggleSelectPart,
        selectAllParts: selectAllParts,
        batchDelete: batchDelete,
        getData: function() { return touchData; }
    };

    // ===== 页面加载完成后初始化 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
