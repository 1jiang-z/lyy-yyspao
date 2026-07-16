/**
 * 留言墙功能 - 黑白暗黑风格
 * 书桌 + 黑无常锁链 + 白色便利贴
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'messageWallData';

    // 留言数据
    let wallData = {
        messages: [],  // { id, content, timestamp, isRead, rotation, editCount, originalContent }
        title: '梦角的留言墙',
        weather: null, // 当前天气
        weatherHistory: [], // 天气变化记录 { id, from, to, timestamp }
        lastWeatherCheck: 0 // 上次检查天气的时间戳
    };

    const ROTATIONS = ['rot-1', 'rot-2', 'rot-3', 'rot-4', 'rot-5'];

    // 天气类型
    const WEATHER_TYPES = {
        SUNNY: 'sunny',        // 晴天
        CLOUDY: 'cloudy',      // 阴天
        RAINY: 'rainy',        // 下雨
        THUNDER: 'thunder',    // 雷雨天
        SNOWY: 'snowy'         // 下雪
    };

    const WEATHER_NAMES = {
        sunny: '晴天',
        cloudy: '阴天',
        rainy: '下雨',
        thunder: '雷雨天',
        snowy: '下雪'
    };

    // 季节类型
    const SEASONS = {
        SPRING: 'spring', // 春
        SUMMER: 'summer', // 夏
        AUTUMN: 'autumn', // 秋
        WINTER: 'winter'  // 冬
    };

    // 留言文案库
    const MESSAGE_TEMPLATES = [
        '今天的风很温柔，像你一样。',
        '我刚刚路过一家很好吃的店，下次带你来。',
        '你在干嘛呢？有点想你了。',
        '今天遇到了一件很有趣的事，等见面了讲给你听。',
        '记得按时吃饭，不要让我担心。',
        '看到了一朵很像你的云，拍下来了。',
        '今天的星星特别亮，你看到了吗？',
        '突然很想听你说话。',
        '今天学了一道新菜，以后做给你吃。',
        '你笑起来真的很好看，要多笑笑哦。',
        '路上看到一只很可爱的小猫，让我想起了你。',
        '今天天气真好，适合和你在一起。',
        '你有没有好好睡觉？不准熬夜。',
        '我在想，你现在在做什么呢？',
        '今天的月亮好圆，就像我们以后要一起过的每一天。',
        '刚才差点就给你发消息了，想想还是写在留言墙上吧。',
        '不管发生什么，我都在这里。',
        '你是我每天最期待见到的人。',
        '今天也很喜欢你，和昨天一样，比明天少一点。',
        '记得多喝水，照顾好自己。',
        '如果你看到这条留言，说明我在想你。',
        '今天的风里有花香，你闻到了吗？',
        '我攒了好多话想对你说，慢慢讲给你听。',
        '要开心呀，你开心的话我也会开心的。',
        '无论什么时候来找我，我都在。',
        '今天也是被你治愈的一天。',
        '你不在的时候，时间都变慢了。',
        '刚刚梦到你了，醒来就更想你了。',
        '你就是我平淡生活里的糖。',
        '今天也想和你说晚安。',
    ];

    // ===== 数据加载与保存 =====
    async function loadWallData() {
        try {
            const key = getStorageKey(STORAGE_KEY);
            const saved = await window.localforage.getItem(key);
            if (saved && saved.messages) {
                // 合并旧数据，确保新字段存在
                wallData = {
                    messages: saved.messages || [],
                    title: saved.title || '梦角的留言墙',
                    weather: saved.weather || null,
                    weatherHistory: saved.weatherHistory || [],
                    lastWeatherCheck: saved.lastWeatherCheck || 0
                };
            }
        } catch (e) {
            console.warn('[留言墙] 加载数据失败:', e);
            // 加载失败时保持默认数据，不抛出错误
        }
    }

    function saveWallData() {
        try {
            const key = getStorageKey(STORAGE_KEY);
            window.localforage.setItem(key, wallData);
        } catch (e) {
            console.warn('[留言墙] 保存数据失败:', e);
        }
    }

    function getStorageKey(base) {
        if (typeof window.getStorageKey === 'function') {
            try {
                return window.getStorageKey(base);
            } catch (e) {
                // SESSION_ID 未初始化时，使用默认 key 作为临时存储
                console.warn('[留言墙] getStorageKey 调用失败，使用默认存储键:', e.message);
            }
        }
        return 'CHAT_APP_V3_default_' + base;
    }

    // ===== 获取留言墙时间（比现实慢2.5小时）=====
    function getWallDate() {
        const now = new Date();
        // 减去 2.5 小时 = 150 分钟 = 9000000 毫秒
        return new Date(now.getTime() - 2.5 * 60 * 60 * 1000);
    }

    // ===== 时间段判断（基于留言墙时间）=====
    function getTimePeriod() {
        const hour = getWallDate().getHours();
        if (hour >= 5 && hour < 7) return 'dawn';         // 清晨
        if (hour >= 7 && hour < 9) return 'sunrise';      // 日出
        if (hour >= 9 && hour < 11) return 'morning';     // 上午
        if (hour >= 11 && hour < 14) return 'noon';       // 正午
        if (hour >= 14 && hour < 17) return 'afternoon';  // 下午
        if (hour >= 17 && hour < 19) return 'sunset';     // 黄昏
        if (hour >= 19 && hour < 21) return 'dusk';       // 傍晚
        return 'night';                                    // 午夜
    }

    // ===== 季节判断 =====
    function getSeason() {
        const month = getWallDate().getMonth() + 1; // 1-12
        if (month >= 3 && month <= 5) return SEASONS.SPRING;   // 3-5月 春
        if (month >= 6 && month <= 8) return SEASONS.SUMMER;   // 6-8月 夏
        if (month >= 9 && month <= 11) return SEASONS.AUTUMN;  // 9-11月 秋
        return SEASONS.WINTER;                                  // 12-2月 冬
    }

    // ===== 获取当前季节可能出现的天气 =====
    function getPossibleWeathers() {
        const season = getSeason();
        // 所有天气都有可能，只是季节不同时某些天气更少见
        // 但用户说"完全随机"，所以所有天气概率一样
        const all = [
            WEATHER_TYPES.SUNNY,
            WEATHER_TYPES.CLOUDY,
            WEATHER_TYPES.RAINY,
            WEATHER_TYPES.THUNDER,
            WEATHER_TYPES.SNOWY
        ];
        return all;
    }

    // ===== 随机选一个天气（完全随机）=====
    function randomWeather() {
        const list = getPossibleWeathers();
        return list[Math.floor(Math.random() * list.length)];
    }

    // ===== 自然过渡：从当前天气自然变到下一个天气 =====
    // 符合常理：晴→阴→雨→晴 这种过渡更常见，但也可能突变
    function naturalNextWeather(current) {
        // 70% 概率自然过渡（相邻状态），30% 概率随机突变
        if (Math.random() < 0.3) {
            // 随机突变，但不能和当前一样
            let w = randomWeather();
            let tries = 0;
            while (w === current && tries < 5) {
                w = randomWeather();
                tries++;
            }
            return w;
        }

        // 自然过渡链：晴 ↔ 阴 ↔ 雨 ↔ 雷 / 雪
        const transitions = {
            sunny: ['cloudy', 'sunny', 'cloudy'],       // 晴天最可能变成阴天
            cloudy: ['sunny', 'rainy', 'cloudy'],        // 阴天可能变晴或下雨
            rainy: ['cloudy', 'thunder', 'snowy'],       // 雨天可能转阴、雷、或转雪
            thunder: ['rainy', 'cloudy'],                // 雷雨天通常变雨或阴
            snowy: ['cloudy', 'rainy', 'snowy']          // 雪天可能转阴、雨、或继续下
        };

        const options = transitions[current] || getPossibleWeathers();
        return options[Math.floor(Math.random() * options.length)];
    }

    // ===== 检查天气变化（自然变化 + 梦角修改）=====
    function checkWeatherChange() {
        const now = Date.now();
        const wallNow = getWallDate().getTime();

        // 每 1-2 小时（留言墙时间）检查一次天气是否变化
        // 换算成现实时间：留言墙慢2.5小时，但我们用现实时间计时
        // 每 45 分钟现实时间 = 约 1.8 小时留言墙时间，检查一次
        const checkInterval = 45 * 60 * 1000; // 45分钟检查一次

        if (now - wallData.lastWeatherCheck < checkInterval) return;
        wallData.lastWeatherCheck = now;

        const oldWeather = wallData.weather;

        // 每次检查有 60% 概率天气会变化（40% 概率天气不变）
        if (Math.random() < 0.4) {
            // 天气不变，不记录
            saveWallData();
            return;
        }

        // 6% 概率是梦角修改的天气（直接跳到任意天气）
        const isModified = Math.random() < 0.06;

        let newWeather;
        if (isModified) {
            // 梦角修改：随机选一个和当前不一样的
            newWeather = randomWeather();
            let tries = 0;
            while (newWeather === oldWeather && tries < 5) {
                newWeather = randomWeather();
                tries++;
            }
        } else {
            // 自然变化
            newWeather = naturalNextWeather(oldWeather);
        }

        if (newWeather === oldWeather) {
            saveWallData();
            return;
        }

        wallData.weather = newWeather;

        // 记录天气变化历史
        wallData.weatherHistory.unshift({
            id: 'weather_' + now,
            from: oldWeather,
            to: newWeather,
            timestamp: now,
            isModified: isModified // true=梦角改的，false=自然变化
        });

        // 最多保留 100 条记录
        if (wallData.weatherHistory.length > 100) {
            wallData.weatherHistory = wallData.weatherHistory.slice(0, 100);
        }

        saveWallData();
        applyWeather();
    }

    // ===== 应用天气效果到DOM =====
    function applyWeather() {
        const windowEl = document.querySelector('.mw-window');
        if (!windowEl) return;

        // 移除所有天气类
        windowEl.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-thunder', 'weather-snowy');

        if (wallData.weather) {
            windowEl.classList.add('weather-' + wallData.weather);
        }

        // 应用季节
        const room = document.getElementById('mw-room');
        if (room) {
            room.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
            room.classList.add('season-' + getSeason());
        }
    }

    function updateWindowSky() {
        const sky = document.getElementById('mw-window-sky');
        if (!sky) return;
        const period = getTimePeriod();
        sky.className = 'mw-window-sky period-' + period;

        const hour = getWallDate().getHours();

        // 更新锁链颜色：晚上8点到凌晨12点是黑色，其他时间银白色
        const chain = document.getElementById('mw-chain');
        if (chain) {
            // 20点 ~ 24点（晚上8点到12点）是黑色
            // 0点 ~ 20点都是银白色
            if (hour >= 20 && hour < 24) {
                chain.classList.add('night');
            } else {
                chain.classList.remove('night');
            }
        }

        // 更新暖光灯：晚上6点到凌晨6点亮灯
        const room = document.getElementById('mw-room');
        if (room) {
            if (hour >= 18 || hour < 6) {
                room.classList.add('night');
            } else {
                room.classList.remove('night');
            }
        }

        // 初始化天气（如果没有的话）
        if (!wallData.weather) {
            wallData.weather = randomWeather();
            saveWallData();
        }
        applyWeather();

        // 检查是否系统修改天气
        checkWeatherChange();
    }

    // ===== 留言生成 =====
    // 50% 概率从字卡库选取（拼字卡风格，多条组合），50% 概率从原创模板选取（单句）
    function getRandomMessage() {
        const useWordCard = Math.random() < 0.5;

        if (useWordCard && typeof customReplies !== 'undefined' && customReplies.length > 0) {
            // 从字卡库随机选取 min-max 条，用逗号拼接（拼字卡风格）
            const minCards = getMinCardCount();
            const maxCards = getMaxCardCount();
            const count = minCards + Math.floor(Math.random() * (maxCards - minCards + 1));
            const shuffled = customReplies.slice().sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, Math.min(count, shuffled.length));
            return {
                content: selected.join('，'),
                source: 'wordcard', // 来自字卡库
                cardCount: selected.length
            };
        } else {
            // 从原创模板随机选取一条（单句）
            return {
                content: MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)],
                source: 'original', // 原创
                cardCount: 1
            };
        }
    }

    function getRandomRotation() {
        return ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
    }

    function getMinCardCount() {
        try {
            const v = parseInt(window.settings.messageWallMinCount);
            return isNaN(v) ? 2 : Math.max(1, Math.min(9, v));
        } catch (e) { return 2; }
    }

    function getMaxCardCount() {
        try {
            const v = parseInt(window.settings.messageWallMaxCount);
            return isNaN(v) ? 4 : Math.max(1, Math.min(9, v));
        } catch (e) { return 4; }
    }

    // 添加一条新留言
    function addMessage(content) {
        // 便签不删除，一直叠加堆叠，可以有无限多张

        let msgContent, msgSource, msgCardCount;
        if (content) {
            msgContent = content;
            msgSource = 'custom';
            msgCardCount = 1;
        } else {
            const result = getRandomMessage();
            msgContent = result.content;
            msgSource = result.source;
            msgCardCount = result.cardCount;
        }

        const msg = {
            id: 'wall_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            content: msgContent,
            source: msgSource, // wordcard / original / custom
            cardCount: msgCardCount,
            timestamp: Date.now(),
            isRead: false,
            rotation: getRandomRotation(),
            editCount: 0, // 修改次数
            originalContent: null // 原始内容（第一次修改时保存）
        };
        wallData.messages.push(msg);
        saveWallData();
        updateUnreadBadge();
        return msg;
    }

    // 修改一条已有的便签（梦角修改）
    function editMessage(msgId, newContent) {
        const msg = wallData.messages.find(m => m.id === msgId);
        if (!msg) return null;

        // 第一次修改时保存原始内容
        if (msg.editCount === 0) {
            msg.originalContent = msg.content;
        }

        if (newContent) {
            msg.content = newContent;
        } else {
            const result = getRandomMessage();
            msg.content = result.content;
            msg.source = result.source;
            msg.cardCount = result.cardCount;
        }
        msg.timestamp = Date.now(); // 更新时间为修改时间
        msg.isRead = false; // 标记为未读
        msg.editCount = (msg.editCount || 0) + 1;

        saveWallData();
        updateUnreadBadge();
        return msg;
    }

    // 随机修改一条便签（模拟梦角修改便签）
    function maybeEditRandomMessage() {
        if (!wallData.messages.length) return false;
        // 3% 概率修改一条便签（很低的概率）
        if (Math.random() >= 0.03) return false;

        // 随机选一条已读的，或者随机选一条
        const candidates = wallData.messages.filter(m => m.isRead);
        const pool = candidates.length > 0 ? candidates : wallData.messages;
        const randomMsg = pool[Math.floor(Math.random() * pool.length)];

        if (!randomMsg) return false;

        // 不传 content，让 editMessage 内部生成新的随机内容
        editMessage(randomMsg.id);

        return true;
    }

    // 检查是否需要补充留言
    function checkAndRefill() {
        // 便签数量不设上限，不再自动补充
        // 保留函数以兼容现有调用，但不做任何操作
        return false;
    }

    // 定时检查
    function startAutoMessageTimer() {
        setInterval(() => {
            // 先尝试修改便签（梦角修改已有便签）
            if (maybeEditRandomMessage()) {
                renderWall();
                return;
            }

            // 30% 概率新增一条便签（便签无限叠加，不删除旧的）
            if (Math.random() < 0.3) {
                addMessage();
                renderWall();
            }
        }, 5 * 60 * 1000);

        // 每分钟更新一次窗户时间
        setInterval(() => {
            updateWindowSky();
        }, 60 * 1000);
    }

    // 当前显示的堆叠组索引（用于切换叠加的便签）
    let currentStackIndex = 0;

    // ===== 渲染拼字卡风格便签（堆叠效果 + 切换）=====
    function renderWall() {
        const listEl = document.getElementById('mw-sticky-list');
        if (!listEl) return;

        const pName = (typeof window.settings !== 'undefined' && window.settings.partnerName)
            ? window.settings.partnerName : '梦角';

        if (!wallData.messages.length) {
            listEl.innerHTML = `
                <div class="mw-empty">
                    <i class="fas fa-sticky-note"></i>
                    <p>书桌上还没有便签</p>
                    <span>${pName}还没有给你留便签，再等等吧～</span>
                </div>
            `;
            return;
        }

        // 倒序排列，最新的在前面
        const sorted = wallData.messages.slice().sort((a, b) => b.timestamp - a.timestamp);

        // 最多显示 12 张（便签重叠堆叠，能放更多）
        const maxVisible = 12;
        const visibleMsgs = sorted.slice(0, Math.min(sorted.length, maxVisible));
        const totalCount = sorted.length;

        // 如果超过12张，从 currentStackIndex 开始显示 12 张
        let displayMsgs;
        if (totalCount > maxVisible) {
            const startIdx = currentStackIndex % (totalCount - maxVisible + 1);
            displayMsgs = sorted.slice(startIdx, startIdx + maxVisible);
        } else {
            displayMsgs = visibleMsgs;
        }

        listEl.innerHTML = displayMsgs.map((msg, index) => {
            const timeStr = formatTime(new Date(msg.timestamp));
            const unreadClass = msg.isRead ? '' : ' mw-unread';
            const editedBadge = (msg.editCount && msg.editCount > 0)
                ? `<span class="mw-sticky-edited" title="已修改${msg.editCount}次">已修改</span>`
                : '';

            // 来源标记
            const sourceBadge = msg.source === 'wordcard'
                ? `<span class="mw-card-source source-wordcard"><i class="fas fa-th-large"></i> 拼字卡</span>`
                : '';

            // 拼字卡风格的堆叠布局：散落桌面式
            // 计算卡片位置（使用 top/left 百分比，相对于容器）
            const positions = calculateCardPosition(index, displayMsgs.length);
            const stackStyle = `
                top: ${positions.top}%;
                left: ${positions.left}%;
                transform: rotate(${positions.rotate}deg);
                z-index: ${positions.zIndex};
                opacity: ${positions.opacity};
            `;

            // 卡片类名
            const sourceClass = msg.source === 'wordcard' ? ' source-wordcard' : ' source-original';
            const editedClass = (msg.editCount && msg.editCount > 0) ? ' is-edited' : '';

            return `
                <div class="mw-sticky-note mw-sticky-stacked ${msg.rotation}${unreadClass}${sourceClass}${editedClass}" data-id="${msg.id}" data-index="${index}" style="${stackStyle}">
                    <div class="mw-sticky-note-paper">
                        <button class="mw-sticky-del-btn" data-id="${msg.id}" title="撕掉">
                            <i class="fas fa-times"></i>
                        </button>
                        ${editedBadge}
                        ${sourceBadge}
                        <div class="mw-sticky-content">${escapeHtml(msg.content)}</div>
                        <div class="mw-sticky-time">${timeStr}</div>
                        ${msg.source === 'wordcard' ? `<div class="mw-card-count">${msg.cardCount || 2}张拼接</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // 如果有更多便签，添加切换提示
        if (totalCount > maxVisible) {
            const remaining = totalCount - maxVisible;
            const totalGroups = totalCount - maxVisible + 1;
            const stackGroup = (currentStackIndex % totalGroups + totalGroups) % totalGroups;
            listEl.innerHTML += `
                <div class="mw-sticky-more" id="mw-sticky-more">
                    <i class="fas fa-hand-pointer"></i>
                    <span>点击便签切换下一组 (${stackGroup + 1}/${totalGroups}组)</span>
                    <small>共 ${totalCount} 张便签</small>
                </div>
            `;
        }

        // 绑定删除按钮
        listEl.querySelectorAll('.mw-sticky-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                deleteMessage(id);
            });
        });

        // 绑定便签点击（切换叠加的便签）
        if (totalCount > maxVisible) {
            listEl.querySelectorAll('.mw-sticky-note').forEach(note => {
                note.addEventListener('click', (e) => {
                    // 如果点的是删除按钮，不切换
                    if (e.target.closest('.mw-sticky-del-btn')) return;
                    // 切换到下一组
                    currentStackIndex++;
                    renderWall();
                });
            });
        }

        // 标记最上面那张为已读
        if (displayMsgs.length > 0) {
            const topMsg = wallData.messages.find(m => m.id === displayMsgs[0].id);
            if (topMsg) topMsg.isRead = true;
        }
        saveWallData();
        updateUnreadBadge();
    }

    // 计算卡片位置（散落桌面式布局，更自然均匀，支持12张以上堆叠）
    function calculateCardPosition(index, total) {
        // 使用确定性随机（基于index），保证同一张卡位置稳定
        const hash = (index * 9301 + 49297) % 233280;
        const rand = hash / 233280;
        const hash2 = (index * 12345 + 6789) % 10007;
        const rand2 = hash2 / 10007;
        const hash3 = (index * 7919 + 31) % 1000;
        const rand3 = hash3 / 1000;

        // 使用网格基础 + 随机偏移，保证分布均匀
        // 4列 x 3行 的基础网格（支持12张卡片）
        const cols = 4;
        const rows = 3;
        const col = index % cols;
        const row = Math.floor(index / cols) % rows;

        // 每个格子的范围（百分比，相对于容器）
        const cellWidth = 20; // 百分比（更紧凑）
        const cellHeight = 26; // 百分比
        const startLeft = 3;
        const startTop = 5;

        // 格子中心 + 随机偏移
        const baseLeft = startLeft + col * cellWidth + cellWidth / 2;
        const baseTop = startTop + row * cellHeight + cellHeight / 2;

        // 随机偏移（在格子内移动，最多格子大小的 60%，增加重叠感）
        const offsetLeft = (rand - 0.5) * cellWidth * 0.6;
        const offsetTop = (rand2 - 0.5) * cellHeight * 0.6;

        const left = baseLeft + offsetLeft;
        const top = baseTop + offsetTop;
        const rotate = (rand3 * 2 - 1) * 12; // -12° ~ +12° 轻微旋转

        return {
            left: left,
            top: top,
            rotate: rotate,
            zIndex: 10 + index,
            opacity: Math.max(0.85, 1 - index * 0.008)
        };
    }

    function formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < 60 * 1000) {
            return '刚刚';
        } else if (diff < 60 * 60 * 1000) {
            return Math.floor(diff / (60 * 1000)) + '分钟前';
        } else if (diff < oneDay) {
            return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
        } else if (diff < 7 * oneDay) {
            return Math.floor(diff / oneDay) + '天前';
        } else {
            return (date.getMonth() + 1) + '.' + date.getDate();
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // 删除留言
    function deleteMessage(id) {
        const idx = wallData.messages.findIndex(m => m.id === id);
        if (idx !== -1) {
            wallData.messages.splice(idx, 1);
            saveWallData();
            renderWall();
            if (typeof window.showNotification === 'function') {
                window.showNotification('已撕掉这张便签', 'info', 1500);
            }
        }
    }

    // 未读角标
    function updateUnreadBadge() {
        const unread = wallData.messages.filter(m => !m.isRead).length;

        // 高级功能入口角标
        const badge1 = document.getElementById('mw-unread-badge');
        if (badge1) {
            if (unread > 0) {
                badge1.textContent = unread > 99 ? '99+' : unread;
                badge1.style.display = 'flex';
            } else {
                badge1.style.display = 'none';
            }
        }

        // 主页入口角标
        const badge2 = document.getElementById('mw-app-badge');
        if (badge2) {
            if (unread > 0) {
                badge2.textContent = unread > 99 ? '99+' : unread;
                badge2.style.display = 'flex';
                badge2.style.position = 'absolute';
                badge2.style.top = '2px';
                badge2.style.right = '18px';
                badge2.style.minWidth = '16px';
                badge2.style.height = '16px';
                badge2.style.background = '#ff4d4f';
                badge2.style.color = '#fff';
                badge2.style.fontSize = '10px';
                badge2.style.fontWeight = '600';
                badge2.style.borderRadius = '8px';
                badge2.style.alignItems = 'center';
                badge2.style.justifyContent = 'center';
                badge2.style.padding = '0 4px';
                badge2.style.lineHeight = '1';
                badge2.style.zIndex = '2';
            } else {
                badge2.style.display = 'none';
            }
        }
    }

    // ===== 标题渲染与编辑 =====
    function renderTitle() {
        const titleText = document.getElementById('mw-title-text');
        if (titleText) {
            titleText.textContent = wallData.title || '梦角的留言墙';
        }
    }

    function bindTitleEdit() {
        const titleEl = document.getElementById('mw-title');
        if (!titleEl) return;

        titleEl.addEventListener('click', () => {
            const titleText = document.getElementById('mw-title-text');
            if (!titleText) return;

            const currentText = wallData.title || '梦角的留言墙';
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.className = 'mw-title-input';
            input.maxLength = 20;

            titleText.replaceWith(input);
            input.focus();
            input.select();

            function saveTitle() {
                const newTitle = input.value.trim() || '梦角的留言墙';
                wallData.title = newTitle;
                saveWallData();
                const span = document.createElement('span');
                span.id = 'mw-title-text';
                span.textContent = newTitle;
                input.replaceWith(span);
            }

            input.addEventListener('blur', saveTitle);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
                if (e.key === 'Escape') {
                    input.value = currentText;
                    input.blur();
                }
            });
        });
    }

    // ===== 初始化入口 =====
    function initEntry() {
        // 高级功能面板入口
        const entryBtn = document.getElementById('message-wall-function');
        if (entryBtn && !entryBtn.dataset.initialized) {
            entryBtn.dataset.initialized = 'true';
            const newBtn = entryBtn.cloneNode(true);
            entryBtn.parentNode.replaceChild(newBtn, entryBtn);

            newBtn.addEventListener('click', async () => {
                const advModal = document.getElementById('advanced-modal');
                if (advModal && typeof window.hideModal === 'function') {
                    window.hideModal(advModal);
                }
                await loadWallData();
                setTimeout(() => {
                    openMessageWall();
                }, 150);
            });
        }

        // 主页入口
        if (typeof window.openApp === 'function' && !window._mwAppRegistered) {
            window._mwAppRegistered = true;
            const origOpenApp = window.openApp;
            window.openApp = function (app) {
                if (app === 'message-wall') {
                    loadWallData()
                        .then(() => {
                            openMessageWall();
                        })
                        .catch((e) => {
                            console.error('[留言墙] 加载数据失败，直接打开:', e);
                            openMessageWall();
                        });
                    return;
                }
                return origOpenApp.call(this, app);
            };
        }
    }

    // 立即设置 openApp 拦截（如果 openApp 已经存在）
    // 这样即使 tryInit 还没完成，点击留言墙图标也能响应
    function setupOpenAppInterception() {
        if (typeof window.openApp === 'function' && !window._mwAppRegistered) {
            window._mwAppRegistered = true;
            const origOpenApp = window.openApp;
            window.openApp = function (app) {
                if (app === 'message-wall') {
                    loadWallData()
                        .then(() => {
                            openMessageWall();
                        })
                        .catch((e) => {
                            console.error('[留言墙] 加载数据失败，直接打开:', e);
                            openMessageWall();
                        });
                    return;
                }
                return origOpenApp.call(this, app);
            };
            console.log('[留言墙] openApp 拦截已设置');
        }
    }

    // 尝试立即设置拦截
    setupOpenAppInterception();
    // 如果 openApp 还没加载，每隔一段时间重试
    const interceptionTimer = setInterval(() => {
        if (window._mwAppRegistered) {
            clearInterval(interceptionTimer);
            return;
        }
        setupOpenAppInterception();
    }, 100);
    // 最多重试 5 秒
    setTimeout(() => clearInterval(interceptionTimer), 5000);

    function openMessageWall() {
        try {
            const modal = document.getElementById('message-wall-modal');
            if (!modal) {
                console.error('[留言墙] 找不到模态框元素 #message-wall-modal');
                return;
            }
            updateWindowSky();
            renderTitle();
            renderWall();
            bindChainClick();
            if (typeof window.showModal === 'function') {
                window.showModal(modal);
            } else if (typeof window.homeShowModal === 'function') {
                window.homeShowModal(modal);
            } else {
                // 兜底：直接用 style 显示
                modal.style.display = 'flex';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.zIndex = '99999999';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
            }
            console.log('[留言墙] 已打开');
        } catch (e) {
            console.error('[留言墙] 打开失败:', e);
            // 即使出错也尝试显示模态框
            const modal = document.getElementById('message-wall-modal');
            if (modal) {
                modal.style.display = 'flex';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.zIndex = '99999999';
            }
        }
    }

    // ===== 锁链点击：打开历史留言列表 =====
    function bindChainClick() {
        const chain = document.getElementById('mw-chain');
        if (!chain || chain.dataset.bound) return;
        chain.dataset.bound = 'true';
        chain.style.cursor = 'pointer';
        chain.title = '点击查看所有历史便签';

        chain.addEventListener('click', () => {
            openHistoryList();
        });
    }

    // 打开历史留言列表
    function openHistoryList() {
        const modal = document.getElementById('mw-history-modal');
        if (!modal) return;
        renderHistoryList('messages'); // 默认显示便签
        if (typeof window.showModal === 'function') {
            window.showModal(modal);
        }
    }

    // 切换历史标签
    function switchHistoryTab(tab) {
        // 更新标签状态
        document.querySelectorAll('.mw-history-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector('.mw-history-tab[data-tab="' + tab + '"]');
        if (activeTab) activeTab.classList.add('active');

        renderHistoryList(tab);
    }

    // 渲染历史列表
    function renderHistoryList(tab) {
        const listEl = document.getElementById('mw-history-list');
        if (!listEl) return;

        const pName = (typeof window.settings !== 'undefined' && window.settings.partnerName)
            ? window.settings.partnerName : '梦角';

        const countEl = document.getElementById('mw-history-count');

        if (tab === 'weather') {
            // 天气变化记录
            if (countEl) {
                countEl.textContent = `共 ${wallData.weatherHistory.length} 条天气变化`;
            }

            if (!wallData.weatherHistory.length) {
                listEl.innerHTML = `
                    <div class="mw-history-empty">
                        <i class="fas fa-cloud-sun"></i>
                        <p>还没有天气变化</p>
                        <span>天气一直很稳定～</span>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = wallData.weatherHistory.map((item, index) => {
                const date = new Date(item.timestamp);
                const dateStr = date.getFullYear() + '.' + 
                               String(date.getMonth() + 1).padStart(2, '0') + '.' + 
                               String(date.getDate()).padStart(2, '0') + ' ' + 
                               String(date.getHours()).padStart(2, '0') + ':' + 
                               String(date.getMinutes()).padStart(2, '0');
                const fromName = WEATHER_NAMES[item.from] || item.from;
                const toName = WEATHER_NAMES[item.to] || item.to;
                const pName = (typeof window.settings !== 'undefined' && window.settings.partnerName)
                    ? window.settings.partnerName : '梦角';

                // 区分是梦角修改的还是自然变化
                const modifiedBadge = item.isModified
                    ? `<span class="mw-weather-modified"><i class="fas fa-magic"></i> ${pName}改的</span>`
                    : `<span class="mw-weather-natural"><i class="fas fa-leaf"></i> 自然变化</span>`;

                const descText = item.isModified
                    ? `${pName}把天气由「${fromName}」改成了「${toName}」`
                    : `天气由「${fromName}」变成了「${toName}」`;

                return `
                    <div class="mw-history-item mw-weather-item ${item.isModified ? 'is-modified' : 'is-natural'}">
                        <div class="mw-history-item-header">
                            <span class="mw-history-index">#${wallData.weatherHistory.length - index}</span>
                            ${modifiedBadge}
                            <span class="mw-history-date">${dateStr}</span>
                        </div>
                        <div class="mw-weather-change">
                            <span class="mw-weather-from">${fromName}</span>
                            <i class="fas fa-arrow-right mw-weather-arrow"></i>
                            <span class="mw-weather-to">${toName}</span>
                        </div>
                        <div class="mw-weather-desc">
                            ${descText}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // 便签记录
            if (countEl) {
                countEl.textContent = `共 ${wallData.messages.length} 张便签`;
            }

            if (!wallData.messages.length) {
                listEl.innerHTML = `
                    <div class="mw-history-empty">
                        <i class="fas fa-sticky-note"></i>
                        <p>还没有任何便签</p>
                        <span>${pName}还没有给你留过便签</span>
                    </div>
                `;
                return;
            }

            // 倒序排列，最新的在最上面
            const sorted = wallData.messages.slice().sort((a, b) => b.timestamp - a.timestamp);

            listEl.innerHTML = sorted.map((msg, index) => {
                const date = new Date(msg.timestamp);
                const dateStr = date.getFullYear() + '.' + 
                               String(date.getMonth() + 1).padStart(2, '0') + '.' + 
                               String(date.getDate()).padStart(2, '0') + ' ' + 
                               String(date.getHours()).padStart(2, '0') + ':' + 
                               String(date.getMinutes()).padStart(2, '0');
                const editedBadge = (msg.editCount && msg.editCount > 0)
                    ? `<span class="mw-history-edited">已修改${msg.editCount}次</span>`
                    : '';
                const originalContent = msg.originalContent
                    ? `<div class="mw-history-original">
                            <span class="mw-history-original-label">原始内容：</span>
                            <span class="mw-history-original-text">${escapeHtml(msg.originalContent)}</span>
                        </div>`
                    : '';
                return `
                    <div class="mw-history-item" data-id="${msg.id}">
                        <div class="mw-history-item-header">
                            <span class="mw-history-index">#${sorted.length - index}</span>
                            <span class="mw-history-date">${dateStr}</span>
                            ${editedBadge}
                            <button class="mw-history-del-btn" data-id="${msg.id}" title="撕掉">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <div class="mw-history-content">${escapeHtml(msg.content)}</div>
                        ${originalContent}
                    </div>
                `;
            }).join('');

            // 绑定删除按钮
            listEl.querySelectorAll('.mw-history-del-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = e.currentTarget.dataset.id;
                    if (confirm('确定要撕掉这张便签吗？')) {
                        deleteMessage(id);
                        renderHistoryList('messages');
                    }
                });
            });
        }
    }

    // ===== 设置面板绑定 =====
    function bindSettings() {
        const minInput = document.getElementById('mw-min-count');
        const maxInput = document.getElementById('mw-max-count');
        const saveBtn = document.getElementById('mw-settings-save');

        if (!minInput || !maxInput) return;

        minInput.value = getMinCardCount();
        maxInput.value = getMaxCardCount();

        [minInput, maxInput].forEach(input => {
            input.addEventListener('input', () => {
                let v = parseInt(input.value);
                if (isNaN(v)) v = 1;
                v = Math.max(1, Math.min(9, v));
                input.value = v;
            });
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                let minV = parseInt(minInput.value);
                let maxV = parseInt(maxInput.value);

                if (isNaN(minV)) minV = 2;
                if (isNaN(maxV)) maxV = 4;
                minV = Math.max(1, Math.min(9, minV));
                maxV = Math.max(1, Math.min(9, maxV));

                if (minV > maxV) {
                    minV = maxV;
                    minInput.value = minV;
                }

                try {
                    window.settings.messageWallMinCount = minV;
                    window.settings.messageWallMaxCount = maxV;
                    if (typeof window.throttledSaveData === 'function') {
                        window.throttledSaveData();
                    }
                } catch (e) {}

                if (typeof window.showNotification === 'function') {
                    window.showNotification('设置已保存', 'success', 1500);
                }

                const setModal = document.getElementById('mw-settings-modal');
                if (setModal && typeof window.hideModal === 'function') {
                    window.hideModal(setModal);
                }

                renderWall();
            });
        }
    }

    function bindSettingsBtn() {
        const btn = document.getElementById('mw-settings-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const setModal = document.getElementById('mw-settings-modal');
            if (!setModal) return;
            const minInput = document.getElementById('mw-min-count');
            const maxInput = document.getElementById('mw-max-count');
            if (minInput) minInput.value = getMinCardCount();
            if (maxInput) maxInput.value = getMaxCardCount();
            if (typeof window.showModal === 'function') {
                window.showModal(setModal);
            }
        });
    }

    // ===== 启动 =====
    function tryInit() {
        if (document.getElementById('message-wall-modal')) {
            initEntry();
            bindSettingsBtn();
            bindSettings();
            bindTitleEdit();
            loadWallData().then(() => {
                updateUnreadBadge();
                // 初始时如果没有便签，自动生成几张
                if (wallData.messages.length === 0) {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            addMessage();
                            renderWall();
                        }, i * 400);
                    }
                }
                startAutoMessageTimer();
            });
        } else {
            setTimeout(tryInit, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }

    // 暴露到全局
    window.MessageWall = {
        addMessage: addMessage,
        renderWall: renderWall,
        loadWallData: loadWallData,
        getData: () => wallData,
        getTimePeriod: getTimePeriod,
        switchHistoryTab: switchHistoryTab
    };
})();
