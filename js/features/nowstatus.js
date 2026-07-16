/* ========================================
 * 状态功能 - 梦角状态管理
 * 他的状态 + 我的状态，两边独立字卡库 + 历史记录
 * ======================================== */

(function() {
    'use strict';

    // ===== 他的状态字卡库（默认）=====
    const DEFAULT_HIS_STATE_LIBRARY = [
        '心情', '健康', '饱腹值', '精力', '睡眠',
        '好感度', '思念值', '害羞值', '占有欲',
        '工作状态', '疲劳度', '压力值',
        '开心值', '期待值', '满足感',
        '体温', '食欲', '运动量'
    ];

    // ===== 我的状态字卡库（默认）=====
    const DEFAULT_MY_STATE_LIBRARY = [
        '心情', '健康', '饱腹值', '精力', '睡眠',
        '好感度', '思念值', '幸福感',
        '学习状态', '工作状态', '疲劳度',
        '开心值', '安全感', '满足感',
        '生理期', '食欲', '运动量'
    ];

    // ===== 他可能添加的候选状态（他的状态）=====
    const CANDIDATE_HIS_STATES = [
        '性欲', '占有欲', '控制欲',
        '宠溺值', '保护欲', '粘人度',
        '吃醋程度', '委屈值', '撒娇度',
        '腹黑值', '温柔度', '耐心值',
        '创作灵感', '游戏瘾', '熬夜程度'
    ];

    // ===== 他可能添加的候选状态（我的状态）=====
    const CANDIDATE_MY_STATES = [
        '依赖度', '撒娇值', '委屈度',
        '吃醋程度', '粘人度', '可爱值',
        '害羞值', '幸福感', '安全感',
        '期待值', '满足感', '被宠爱值',
        '学习状态', '减肥进度', '喝水量'
    ];

    // ===== 预设颜色 =====
    const PRESET_COLORS = [
        '#ff8fab', '#ffb347', '#6bcb77', '#4d96ff',
        '#9b89c9', '#ffd93d', '#ff6b6b', '#6dd5ed',
        '#e8d5a3', '#a8e6cf', '#dda0dd', '#87ceeb',
        '#ff9a9e', '#a1c4fd', '#c2e9fb', '#fbc2eb'
    ];

    // ===== 预设图标 =====
    function getIconForState(name) {
        const iconMap = [
            { keywords: ['心情', '开心', '情绪', '幸福', '满足'], icon: 'fa-face-smile' },
            { keywords: ['健康', '体力', '生病'], icon: 'fa-heart-pulse' },
            { keywords: ['饱腹', '饥饿', '食欲', '吃', '饭'], icon: 'fa-utensils' },
            { keywords: ['精力', '能量', '疲劳', '累'], icon: 'fa-bolt' },
            { keywords: ['睡眠', '困', '熬夜', '梦'], icon: 'fa-moon' },
            { keywords: ['好感', '喜欢', '爱', '宠溺', '保护欲'], icon: 'fa-heart' },
            { keywords: ['思念', '想你', '想念'], icon: 'fa-heart-circle-plus' },
            { keywords: ['害羞', '脸红', '羞涩'], icon: 'fa-face-grin-hearts' },
            { keywords: ['占有欲', '控制欲', '吃醋'], icon: 'fa-fire' },
            { keywords: ['工作', '学习', '进度'], icon: 'fa-briefcase' },
            { keywords: ['压力', '焦虑', '紧张'], icon: 'fa-brain' },
            { keywords: ['粘人', '依赖', '撒娇'], icon: 'fa-cat' },
            { keywords: ['委屈', '难过', '哭'], icon: 'fa-face-sad-tear' },
            { keywords: ['期待', '兴奋'], icon: 'fa-star' },
            { keywords: ['体温', '发烧', '温度'], icon: 'fa-temperature-half' },
            { keywords: ['运动', '锻炼', '健身'], icon: 'fa-dumbbell' },
            { keywords: ['安全感', '安心'], icon: 'fa-shield-heart' },
            { keywords: ['腹黑', '坏'], icon: 'fa-face-smile-wink' },
            { keywords: ['温柔', '耐心'], icon: 'fa-hand-holding-heart' },
            { keywords: ['游戏', '玩'], icon: 'fa-gamepad' },
            { keywords: ['生理期', '姨妈'], icon: 'fa-droplet' },
            { keywords: ['喝水', '水'], icon: 'fa-glass-water' },
            { keywords: ['减肥', '体重'], icon: 'fa-weight-scale' }
        ];

        for (const item of iconMap) {
            for (const kw of item.keywords) {
                if (name.includes(kw)) {
                    return item.icon;
                }
            }
        }
        return 'fa-star';
    }

    // ===== 数据结构 =====
    let stateData = {
        // 他的状态
        hisStates: [],
        hisStateLibrary: [],
        // 我的状态
        myStates: [],
        myStateLibrary: [],
        // 历史记录
        records: []
    };

    // 当前标签
    let currentTab = 'his';
    let currentManageSide = 'his';

    // ===== 初始化 =====
    function init() {
        loadData();
        startAutoCheck();
    }

    // ===== 加载数据 =====
    function loadData() {
        try {
            const saved = localStorage.getItem('state_data');
            if (saved) {
                const data = JSON.parse(saved);
                stateData.hisStates = data.hisStates || generateDefaultHisStates();
                stateData.hisStateLibrary = data.hisStateLibrary || [...DEFAULT_HIS_STATE_LIBRARY];
                stateData.myStates = data.myStates || generateDefaultMyStates();
                stateData.myStateLibrary = data.myStateLibrary || [...DEFAULT_MY_STATE_LIBRARY];
                stateData.records = data.records || [];
            } else {
                stateData.hisStates = generateDefaultHisStates();
                stateData.hisStateLibrary = [...DEFAULT_HIS_STATE_LIBRARY];
                stateData.myStates = generateDefaultMyStates();
                stateData.myStateLibrary = [...DEFAULT_MY_STATE_LIBRARY];
                stateData.records = [];
                saveData();
            }
        } catch (e) {
            console.error('加载状态数据失败:', e);
            stateData.hisStates = generateDefaultHisStates();
            stateData.hisStateLibrary = [...DEFAULT_HIS_STATE_LIBRARY];
            stateData.myStates = generateDefaultMyStates();
            stateData.myStateLibrary = [...DEFAULT_MY_STATE_LIBRARY];
            stateData.records = [];
        }
    }

    // 生成默认他的状态
    function generateDefaultHisStates() {
        return [
            { id: 'his_mood', name: '心情', icon: 'fa-face-smile', value: 80, maxValue: 100, color: '#ff8fab', glow: true, custom: false },
            { id: 'his_health', name: '健康', icon: 'fa-heart-pulse', value: 90, maxValue: 100, color: '#6bcb77', glow: true, custom: false },
            { id: 'his_hunger', name: '饱腹值', icon: 'fa-utensils', value: 60, maxValue: 100, color: '#ffb347', glow: true, custom: false },
            { id: 'his_energy', name: '精力', icon: 'fa-bolt', value: 70, maxValue: 100, color: '#ffd93d', glow: false, custom: false },
            { id: 'his_sleep', name: '睡眠', icon: 'fa-moon', value: 75, maxValue: 100, color: '#9b89c9', glow: false, custom: false }
        ];
    }

    // 生成默认我的状态
    function generateDefaultMyStates() {
        return [
            { id: 'my_mood', name: '心情', icon: 'fa-face-smile', value: 85, maxValue: 100, color: '#ff8fab', glow: true, custom: false },
            { id: 'my_health', name: '健康', icon: 'fa-heart-pulse', value: 95, maxValue: 100, color: '#6bcb77', glow: true, custom: false },
            { id: 'my_hunger', name: '饱腹值', icon: 'fa-utensils', value: 50, maxValue: 100, color: '#ffb347', glow: true, custom: false },
            { id: 'my_energy', name: '精力', icon: 'fa-bolt', value: 65, maxValue: 100, color: '#ffd93d', glow: false, custom: false }
        ];
    }

    // ===== 保存数据 =====
    function saveData() {
        try {
            localStorage.setItem('state_data', JSON.stringify(stateData));
        } catch (e) {
            console.error('保存状态数据失败:', e);
        }
    }

    // ===== 检查自动添加（无时间限制，每次打开都可能触发）=====
    function checkAutoAdd() {
        let added = false;
        let notifications = [];

        // 他添加自己的状态（每次打开6%概率）
        if (Math.random() < 0.06) {
            const result = autoAddHisState();
            if (result) {
                added = true;
                notifications.push('他新增了一个状态：' + result.name);
            }
        }

        // 他给你加状态（每次打开6%概率）
        if (Math.random() < 0.06) {
            const result = autoAddMyState();
            if (result) {
                added = true;
                notifications.push('他给你加了一个状态：' + result.name);
            }
        }

        // 他改变自己某个状态的数值（每次打开6%概率）
        if (Math.random() < 0.06 && stateData.hisStates.length > 0) {
            const result = autoChangeHisValue();
            if (result) {
                added = true;
                notifications.push('他的' + result.name + '变成了 ' + result.newValue);
            }
        }

        saveData();

        // 显示通知
        if (notifications.length > 0 && typeof window.showNotification === 'function') {
            notifications.forEach((msg, i) => {
                setTimeout(() => {
                    window.showNotification(msg, 'info', 2500);
                }, i * 800);
            });
        }

        return added;
    }

    // 他自动添加自己的状态
    function autoAddHisState() {
        const existingNames = stateData.hisStates.map(s => s.name);
        const fromLibrary = stateData.hisStateLibrary.filter(n => !existingNames.includes(n));

        let name;
        if (fromLibrary.length > 0) {
            name = fromLibrary[Math.floor(Math.random() * fromLibrary.length)];
        } else {
            const fromCandidates = CANDIDATE_HIS_STATES.filter(n => !existingNames.includes(n));
            if (fromCandidates.length === 0) return null;
            name = fromCandidates[Math.floor(Math.random() * fromCandidates.length)];
            stateData.hisStateLibrary.push(name);
        }

        const newState = {
            id: 'his_auto_' + Date.now(),
            name: name,
            icon: getIconForState(name),
            value: 50 + Math.floor(Math.random() * 40),
            maxValue: 100,
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
            glow: Math.random() < 0.5,
            custom: true,
            heAdded: true
        };

        stateData.hisStates.push(newState);

        // 添加记录
        addRecord({
            type: 'add_state',
            side: 'his',
            name: name,
            action: '给自己添加了状态'
        });

        return { name: name };
    }

    // 他自动添加我的状态
    function autoAddMyState() {
        const existingNames = stateData.myStates.map(s => s.name);
        const fromLibrary = stateData.myStateLibrary.filter(n => !existingNames.includes(n));

        let name;
        if (fromLibrary.length > 0) {
            name = fromLibrary[Math.floor(Math.random() * fromLibrary.length)];
        } else {
            const fromCandidates = CANDIDATE_MY_STATES.filter(n => !existingNames.includes(n));
            if (fromCandidates.length === 0) return null;
            name = fromCandidates[Math.floor(Math.random() * fromCandidates.length)];
            stateData.myStateLibrary.push(name);
        }

        const newState = {
            id: 'my_he_added_' + Date.now(),
            name: name,
            icon: getIconForState(name),
            value: 50 + Math.floor(Math.random() * 30),
            maxValue: 100,
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
            glow: Math.random() < 0.5,
            custom: true,
            heAdded: true
        };

        stateData.myStates.push(newState);

        // 添加记录
        addRecord({
            type: 'add_state',
            side: 'my',
            name: name,
            action: '给你添加了状态'
        });

        return { name: name };
    }

    // 他自动改变自己的数值
    function autoChangeHisValue() {
        if (stateData.hisStates.length === 0) return null;

        const state = stateData.hisStates[Math.floor(Math.random() * stateData.hisStates.length)];
        const change = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.floor(Math.random() * 20));
        const oldValue = state.value;
        state.value = Math.max(0, Math.min(state.maxValue, state.value + change));

        if (state.value === oldValue) return null;

        // 添加记录
        addRecord({
            type: 'change_value',
            side: 'his',
            name: state.name,
            oldValue: oldValue,
            newValue: state.value,
            action: '的数值变化了'
        });

        return { name: state.name, newValue: state.value };
    }

    // ===== 添加记录 =====
    function addRecord(record) {
        const fullRecord = {
            id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: Date.now(),
            ...record
        };
        stateData.records.unshift(fullRecord);
        if (stateData.records.length > 100) {
            stateData.records = stateData.records.slice(0, 100);
        }
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
        const container = document.getElementById('nowstatus-content');
        if (!container) return;

        const partnerName = (typeof window.settings !== 'undefined' && window.settings.partnerName)
            ? window.settings.partnerName : '梦角';

        container.innerHTML = `
            <!-- 标签切换 -->
            <div class="status-tabs">
                <button class="status-tab ${currentTab === 'his' ? 'active' : ''}" onclick="window.NowStatusApp.switchTab('his')">
                    <i class="fas fa-mars"></i> ${partnerName}的状态
                </button>
                <button class="status-tab ${currentTab === 'my' ? 'active' : ''}" onclick="window.NowStatusApp.switchTab('my')">
                    <i class="fas fa-venus"></i> 我的状态
                </button>
                <button class="status-tab ${currentTab === 'records' ? 'active' : ''}" onclick="window.NowStatusApp.switchTab('records')">
                    <i class="fas fa-clock-rotate-left"></i> 记录
                </button>
            </div>

            <!-- 他的状态面板 -->
            <div class="status-panel" id="status-panel-his" style="display:${currentTab === 'his' ? 'block' : 'none'};">
                ${renderStateList(stateData.hisStates, 'his')}
                <div class="status-manage-row">
                    <button class="status-manage-btn" onclick="window.NowStatusApp.showManage('his')">
                        <i class="fas fa-book"></i> 他的状态字卡库
                    </button>
                    <button class="status-add-main-btn" onclick="window.NowStatusApp.addHisState()">
                        <i class="fas fa-plus-circle"></i> 添加他的状态
                    </button>
                </div>
            </div>

            <!-- 我的状态面板 -->
            <div class="status-panel" id="status-panel-my" style="display:${currentTab === 'my' ? 'block' : 'none'};">
                ${renderStateList(stateData.myStates, 'my')}
                <div class="status-manage-row">
                    <button class="status-manage-btn" onclick="window.NowStatusApp.showManage('my')">
                        <i class="fas fa-book"></i> 我的状态字卡库
                    </button>
                    <button class="status-add-main-btn" onclick="window.NowStatusApp.addMyState()">
                        <i class="fas fa-plus-circle"></i> 添加我的状态
                    </button>
                </div>
            </div>

            <!-- 记录面板 -->
            <div class="status-panel" id="status-panel-records" style="display:${currentTab === 'records' ? 'block' : 'none'};">
                ${renderRecords()}
            </div>

            <!-- 字卡库管理面板 -->
            <div class="status-panel" id="status-panel-library" style="display:none;">
                <div class="status-manage-header">
                    <button class="status-back-btn" onclick="window.NowStatusApp.hideManage()">
                        <i class="fas fa-arrow-left"></i> 返回
                    </button>
                    <span class="status-manage-title" id="status-manage-title">字卡库管理</span>
                </div>

                <div class="status-lib-stats" id="status-lib-stats"></div>

                <div class="status-lib-list" id="status-lib-list"></div>

                <div class="status-lib-add">
                    <input type="text" id="status-lib-input" placeholder="添加新的状态名称..." class="status-lib-input">
                    <button class="status-lib-add-btn" onclick="window.NowStatusApp.addToLibrary()">
                        <i class="fas fa-plus"></i> 添加
                    </button>
                </div>
            </div>
        `;
    }

    // ===== 渲染状态列表 =====
    function renderStateList(states, side) {
        if (states.length === 0) {
            return `
                <div class="status-empty">
                    <i class="fas fa-heart"></i>
                    <p>还没有状态～</p>
                </div>
            `;
        }

        const canEdit = side === 'my';

        return `
            <div class="status-list">
                ${states.map((state, index) => `
                    <div class="status-item ${state.heAdded ? 'he-added' : ''} ${state.userAdded ? 'user-added' : ''}" data-id="${state.id}" data-side="${side}">
                        ${state.heAdded ? '<span class="he-added-badge"><i class="fas fa-heart"></i> 他加的</span>' : ''}
                        ${state.userAdded ? '<span class="user-added-badge"><i class="fas fa-user"></i> 你加的</span>' : ''}
                        <div class="status-item-header">
                            <div class="status-item-left">
                                <div class="status-icon" style="${state.glow ? 'box-shadow: 0 0 15px ' + state.color + '80;' : ''} color: ${state.color};">
                                    <i class="fas ${state.icon}"></i>
                                </div>
                                <div class="status-name-text">${state.name}</div>
                            </div>
                            <div class="status-value-text" style="color: ${state.color};">
                                ${state.value}/${state.maxValue}
                            </div>
                        </div>
                        <div class="status-bar-container">
                            <div class="status-bar-bg">
                                <div class="status-bar-fill" style="
                                    width: ${(state.value / state.maxValue * 100)}%;
                                    background: linear-gradient(90deg, ${state.color}dd, ${state.color});
                                    ${state.glow ? 'box-shadow: 0 0 10px ' + state.color + '80;' : ''}
                                "></div>
                            </div>
                        </div>
                        <div class="status-actions">
                            ${canEdit ? `
                                <button class="status-btn minus" onclick="window.NowStatusApp.decrease('${side}', ${index})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <button class="status-btn plus" onclick="window.NowStatusApp.increase('${side}', ${index})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            ` : `
                                <span class="status-cant-edit">只有他能改哦</span>
                            `}
                            <button class="status-btn edit" onclick="window.NowStatusApp.editState('${side}', ${index})">
                                <i class="fas fa-pen"></i>
                            </button>
                            ${state.custom ? `<button class="status-btn delete" onclick="window.NowStatusApp.deleteState('${side}', ${index})"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===== 渲染记录 =====
    function renderRecords() {
        if (stateData.records.length === 0) {
            return `
                <div class="status-empty">
                    <i class="fas fa-clock-rotate-left"></i>
                    <p>还没有记录～</p>
                    <span>他会偷偷给你加状态的哦</span>
                </div>
            `;
        }

        return `
            <div class="status-records-list">
                ${stateData.records.slice(0, 50).map(record => {
                    const isMySide = record.side === 'my';
                    let icon = '';
                    let text = '';

                    if (record.type === 'add_state') {
                        icon = isMySide ? 'fa-heart-circle-plus' : 'fa-plus-circle';
                        text = '他' + record.action + '：' + record.name;
                    } else if (record.type === 'user_add_his') {
                        icon = 'fa-user-plus';
                        text = '你添加了他的状态：' + record.name;
                    } else if (record.type === 'change_value') {
                        const up = record.newValue > record.oldValue;
                        icon = up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
                        text = '他的' + record.name + '：' + record.oldValue + ' → ' + record.newValue;
                    } else if (record.type === 'user_edit') {
                        icon = 'fa-pen';
                        text = '你修改了' + record.name;
                    }

                    return `
                        <div class="status-record-item">
                            <div class="status-record-icon ${isMySide ? 'side-my' : 'side-his'}">
                                <i class="fas ${icon}"></i>
                            </div>
                            <div class="status-record-info">
                                <div class="status-record-name">${text}</div>
                                <div class="status-record-time">${formatTime(record.timestamp)}</div>
                            </div>
                            <div class="status-record-tag">
                                ${isMySide ? '你的' : '他的'}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            ${stateData.records.length > 0 ? `
                <button class="status-clear-records-btn" onclick="window.NowStatusApp.clearRecords()">
                    <i class="fas fa-trash-alt"></i> 清空记录
                </button>
            ` : ''}
        `;
    }

    // ===== 切换标签 =====
    function switchTab(tab) {
        currentTab = tab;
        render();
    }

    // ===== 显示字卡库管理 =====
    function showManage(side) {
        currentManageSide = side;

        document.getElementById('status-panel-his').style.display = 'none';
        document.getElementById('status-panel-my').style.display = 'none';
        document.getElementById('status-panel-records').style.display = 'none';
        document.getElementById('status-panel-library').style.display = 'block';

        updateLibraryUI();
    }

    function hideManage() {
        document.getElementById('status-panel-library').style.display = 'none';
        switchTab(currentManageSide);
    }

    // ===== 更新字卡库UI =====
    function updateLibraryUI() {
        const library = currentManageSide === 'his' ? stateData.hisStateLibrary : stateData.myStateLibrary;
        const states = currentManageSide === 'his' ? stateData.hisStates : stateData.myStates;
        const partnerName = (typeof window.settings !== 'undefined' && window.settings.partnerName)
            ? window.settings.partnerName : '梦角';

        const titleEl = document.getElementById('status-manage-title');
        if (titleEl) {
            titleEl.textContent = currentManageSide === 'his'
                ? partnerName + '的状态字卡库'
                : '我的状态字卡库';
        }

        const statsEl = document.getElementById('status-lib-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="status-lib-stat">
                    <span class="stat-num">${library.length}</span>
                    <span class="stat-label">个字卡</span>
                </div>
                <div class="status-lib-stat">
                    <span class="stat-num">${states.length}</span>
                    <span class="stat-label">个已启用</span>
                </div>
            `;
        }

        const listEl = document.getElementById('status-lib-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="status-lib-items">
                    ${library.map((word, index) => {
                        const isActive = states.some(s => s.name === word);
                        return `
                            <div class="status-lib-item ${isActive ? 'active' : ''}">
                                <span class="lib-word">${word}</span>
                                ${isActive ? '<span class="lib-active-tag">已启用</span>' : ''}
                                <button class="lib-del-btn" onclick="window.NowStatusApp.removeFromLibrary(${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        const inputEl = document.getElementById('status-lib-input');
        if (inputEl) {
            inputEl.placeholder = '添加新的状态名称...';
        }
    }

    // ===== 添加到字卡库 =====
    function addToLibrary() {
        const input = document.getElementById('status-lib-input');
        if (!input) return;
        const word = input.value.trim();
        if (!word) return;

        const library = currentManageSide === 'his' ? stateData.hisStateLibrary : stateData.myStateLibrary;

        if (library.includes(word)) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('字卡库里已经有啦', 'info', 1500);
            }
            return;
        }

        library.push(word);
        saveData();
        input.value = '';
        updateLibraryUI();

        if (typeof window.showNotification === 'function') {
            window.showNotification('添加成功！', 'success', 1500);
        }
    }

    // ===== 从字卡库移除 =====
    function removeFromLibrary(index) {
        if (!confirm('确定要从字卡库移除吗？\n（已启用的状态不受影响）')) return;

        const library = currentManageSide === 'his' ? stateData.hisStateLibrary : stateData.myStateLibrary;
        library.splice(index, 1);
        saveData();
        updateLibraryUI();
    }

    // ===== 增减数值 =====
    function increase(side, index) {
        const states = side === 'his' ? stateData.hisStates : stateData.myStates;
        const state = states[index];
        if (!state) return;

        state.value = Math.min(state.maxValue, state.value + 10);
        saveData();
        updateSingleBar(side, index);
    }

    function decrease(side, index) {
        const states = side === 'his' ? stateData.hisStates : stateData.myStates;
        const state = states[index];
        if (!state) return;

        state.value = Math.max(0, state.value - 10);
        saveData();
        updateSingleBar(side, index);
    }

    function updateSingleBar(side, index) {
        const states = side === 'his' ? stateData.hisStates : stateData.myStates;
        const state = states[index];
        if (!state) return;

        const panel = side === 'his' ? 'status-panel-his' : 'status-panel-my';
        const items = document.querySelectorAll(`#${panel} .status-item`);
        const item = items[index];
        if (!item) return;

        const fill = item.querySelector('.status-bar-fill');
        const valueText = item.querySelector('.status-value-text');

        if (fill) fill.style.width = (state.value / state.maxValue * 100) + '%';
        if (valueText) valueText.textContent = state.value + '/' + state.maxValue;
    }

    // ===== 编辑状态 =====
    function editState(side, index) {
        const states = side === 'his' ? stateData.hisStates : stateData.myStates;
        const state = states[index];
        if (!state) return;

        const name = prompt('状态名称：', state.name);
        if (name === null) return;
        if (name.trim()) state.name = name.trim();

        const icon = prompt('图标（Font Awesome）：', state.icon);
        if (icon !== null && icon.trim()) state.icon = icon.trim();

        const maxVal = prompt('最大值：', state.maxValue);
        if (maxVal !== null) {
            const v = parseInt(maxVal);
            if (!isNaN(v) && v > 0) state.maxValue = v;
        }

        const color = prompt('颜色（如 #ff8fab）：', state.color);
        if (color !== null && color.trim()) state.color = color.trim();

        const glow = confirm('是否发光？\n确定=开  取消=关');
        state.glow = glow;

        if (state.value > state.maxValue) state.value = state.maxValue;

        // 记录用户修改
        addRecord({
            type: 'user_edit',
            side: side,
            name: state.name,
            action: '你修改了状态'
        });

        saveData();
        render();

        if (typeof window.showNotification === 'function') {
            window.showNotification('修改成功！', 'success', 1500);
        }
    }

    // ===== 添加我的状态 =====
    function addMyState() {
        const name = prompt('新状态名称：');
        if (!name || !name.trim()) return;

        const newState = {
            id: 'my_custom_' + Date.now(),
            name: name.trim(),
            icon: getIconForState(name.trim()),
            value: 50,
            maxValue: 100,
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
            glow: true,
            custom: true
        };

        stateData.myStates.push(newState);

        if (!stateData.myStateLibrary.includes(name.trim())) {
            stateData.myStateLibrary.push(name.trim());
        }

        saveData();
        currentTab = 'my';
        render();

        if (typeof window.showNotification === 'function') {
            window.showNotification('添加成功！点击编辑可以改颜色哦', 'success', 2000);
        }
    }

    // ===== 添加他的状态（用户主动加） =====
    function addHisState() {
        const name = prompt('添加你想看到的他的状态：');
        if (!name || !name.trim()) return;

        const trimmedName = name.trim();

        // 检查是否已存在
        if (stateData.hisStates.some(s => s.name === trimmedName)) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('这个状态已经有了哦', 'info', 2000);
            }
            return;
        }

        const newState = {
            id: 'his_user_added_' + Date.now(),
            name: trimmedName,
            icon: getIconForState(trimmedName),
            value: 50 + Math.floor(Math.random() * 30),
            maxValue: 100,
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
            glow: Math.random() < 0.5,
            custom: true,
            userAdded: true
        };

        stateData.hisStates.push(newState);

        if (!stateData.hisStateLibrary.includes(trimmedName)) {
            stateData.hisStateLibrary.push(trimmedName);
        }

        // 添加记录
        addRecord({
            type: 'user_add_his',
            side: 'his',
            name: trimmedName,
            action: '你添加了他的状态'
        });

        saveData();
        currentTab = 'his';
        render();

        if (typeof window.showNotification === 'function') {
            window.showNotification('已添加，数值他会自己调哦', 'success', 2000);
        }
    }

    // ===== 删除状态 =====
    function deleteState(side, index) {
        const states = side === 'his' ? stateData.hisStates : stateData.myStates;
        const state = states[index];
        if (!state) return;

        if (!confirm('确定要删除「' + state.name + '」吗？')) return;

        states.splice(index, 1);
        saveData();
        render();
    }

    // ===== 清空记录 =====
    function clearRecords() {
        if (!confirm('确定要清空所有记录吗？')) return;
        stateData.records = [];
        saveData();
        render();
    }

    // ===== 打开 =====
    function open() {
        const modal = document.getElementById('nowstatus-modal');
        if (modal) {
            if (typeof window.showModal === 'function') {
                window.showModal(modal);
            } else if (typeof window.homeShowModal === 'function') {
                window.homeShowModal(modal);
            } else {
                modal.classList.add('active');
            }
            currentTab = 'his';
            render();
        }
    }

    // ===== 后台自动检测（只要在线就有概率触发）=====
    function startAutoCheck() {
        // 页面可见时检测
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                checkAutoAdd();
            }
        });

        // 定时检测（每2分钟一次，没有冷却限制）
        setInterval(function() {
            if (document.visibilityState === 'visible') {
                checkAutoAdd();
            }
        }, 2 * 60 * 1000);

        // 初始化后延迟一下也检测一次
        setTimeout(checkAutoAdd, 5000);
    }

    // ===== 关闭 =====
    function close() {
        const modal = document.getElementById('nowstatus-modal');
        if (modal) {
            if (typeof window.hideModal === 'function') {
                window.hideModal(modal);
            } else if (typeof window.homeHideModal === 'function') {
                window.homeHideModal(modal);
            } else {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        }
    }

    // ===== 暴露到全局 =====
    window.NowStatusApp = {
        init: init,
        open: open,
        close: close,
        render: render,
        switchTab: switchTab,
        showManage: showManage,
        hideManage: hideManage,
        addToLibrary: addToLibrary,
        removeFromLibrary: removeFromLibrary,
        increase: increase,
        decrease: decrease,
        editState: editState,
        addMyState: addMyState,
        addHisState: addHisState,
        deleteState: deleteState,
        clearRecords: clearRecords,
        getData: function() { return stateData; }
    };

    // ===== 页面加载完成后初始化 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 500);
        });
    } else {
        setTimeout(init, 500);
    }

})();
