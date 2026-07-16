/* ========================================
 * 邀请功能 - 他邀请我
 * ======================================== */

(function() {
    'use strict';

    const APP_PREFIX = 'invitation_';
    let invitationData = null;
    let currentView = 'main'; // main, manage
    let isAnimating = false;

    // 默认初始邀请列表
    const defaultInvitations = [
        { id: 'inv_1', text: '邀请我和他洗澡', custom: true },
        { id: 'inv_2', text: '邀请我陪他玩游戏', custom: true },
        { id: 'inv_3', text: '邀请我抱抱', custom: true }
    ];

    // 随机邀请池（不根据字卡库的，小概率触发）
    const randomPool = [
        '邀请我和他看电影',
        '邀请我一起吃饭',
        '邀请我去散步',
        '邀请我一起听歌',
        '邀请我陪他聊天',
        '邀请我一起睡觉',
        '邀请我陪他逛街',
        '邀请我一起做饭',
        '邀请我陪他追剧',
        '邀请我一起运动'
    ];

    // 初始化数据
    function initData() {
        return localforage.getItem(APP_PREFIX + 'data').then(data => {
            if (data) {
                invitationData = data;
            } else {
                invitationData = {
                    invitations: [...defaultInvitations],
                    records: [],
                    totalCount: 0
                };
                saveData();
            }
            return invitationData;
        }).catch(() => {
            invitationData = {
                invitations: [...defaultInvitations],
                records: [],
                totalCount: 0
            };
            return invitationData;
        });
    }

    // 保存数据
    function saveData() {
        localforage.setItem(APP_PREFIX + 'data', invitationData).catch(e => {
            console.error('保存邀请数据失败:', e);
        });
    }

    // 获取对方备注名
    function getPartnerName() {
        try {
            if (window.settings && window.settings.partnerName) {
                return window.settings.partnerName;
            }
        } catch(e) {}
        return '他';
    }

    // 获取我的名字
    function getMyName() {
        try {
            if (window.settings && window.settings.userName) {
                return window.settings.userName;
            }
        } catch(e) {}
        return '我';
    }

    // 替换文本中的"他"为备注名
    function replaceName(text) {
        const name = getPartnerName();
        if (name === '他') return text;
        return text.replace(/他/g, name);
    }

    // 生成邀请内容
    function generateInvitation() {
        const useCustom = Math.random() < 0.94; // 94%概率用字卡库
        let text = '';

        if (useCustom && invitationData.invitations.length > 0) {
            const randomIndex = Math.floor(Math.random() * invitationData.invitations.length);
            text = invitationData.invitations[randomIndex].text;
        } else {
            const randomIndex = Math.floor(Math.random() * randomPool.length);
            text = randomPool[randomIndex];
        }

        return replaceName(text);
    }

    // 收到邀请（触发弹窗+音效）
    function receiveInvitation() {
        const text = generateInvitation();
        
        // 添加记录
        const record = {
            id: 'rec_' + Date.now(),
            text: text,
            time: new Date(),
            accepted: null
        };
        invitationData.records.unshift(record);
        invitationData.totalCount++;
        
        if (invitationData.records.length > 100) {
            invitationData.records = invitationData.records.slice(0, 100);
        }
        
        saveData();
        render();
        
        // 显示弹窗
        showInvitationPopup(text);
        
        // 播放温情音效
        playWarmSound();
        
        return text;
    }

    // 显示邀请弹窗
    function showInvitationPopup(text) {
        const partnerName = getPartnerName();
        
        // 先移除已有的弹窗
        const existing = document.getElementById('invitation-popup-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'invitation-popup-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 100000;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div class="invitation-popup-content" style="
                background: linear-gradient(135deg, #fff5f7 0%, #f0f4ff 100%);
                border-radius: 24px;
                padding: 32px 28px;
                width: 85%;
                max-width: 360px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(107,143,255,0.3);
                animation: invitationPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
            ">
                <!-- 装饰爱心背景 -->
                <div style="
                    position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                    font-size: 60px; opacity: 0.1;
                ">
                    <i class="fas fa-heart" style="color: #6b8fff;"></i>
                </div>
                
                <div style="position: relative; z-index: 1;">
                    <div style="
                        font-size: 14px; color: #6b8fff; margin-bottom: 12px;
                        font-weight: 500; letter-spacing: 1px;
                    ">
                        ✨ ${partnerName}想邀请你 ✨
                    </div>
                    
                    <div style="
                        font-size: 20px; font-weight: 700; color: #333;
                        margin-bottom: 8px; line-height: 1.5;
                    ">
                        ${text}
                    </div>
                    
                    <div style="
                        font-size: 13px; color: #999; margin-bottom: 24px;
                    ">
                        要答应吗～
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button class="invitation-accept-btn" style="
                            flex: 1; padding: 12px 24px;
                            border: none; border-radius: 50px;
                            background: linear-gradient(135deg, #ff8fab 0%, #ff6b9d 100%);
                            color: #fff; font-size: 14px; font-weight: 600;
                            cursor: pointer; font-family: var(--font-family);
                            box-shadow: 0 4px 15px rgba(255,107,157,0.3);
                            transition: all 0.3s;
                        ">
                            <i class="fas fa-heart" style="margin-right: 6px;"></i>答应
                        </button>
                        <button class="invitation-reject-btn" style="
                            flex: 1; padding: 12px 24px;
                            border: 2px solid #ddd; border-radius: 50px;
                            background: #fff; color: #999;
                            font-size: 14px; font-weight: 500;
                            cursor: pointer; font-family: var(--font-family);
                            transition: all 0.3s;
                        ">
                            再想想
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // 动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes invitationPopIn {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            .invitation-popup-content:hover {
                transform: translateY(-2px);
            }
            .invitation-accept-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(255,107,157,0.4);
            }
            .invitation-reject-btn:hover {
                border-color: #bbb;
                color: #666;
            }
        `;
        document.head.appendChild(style);
        
        // 绑定事件
        const acceptBtn = overlay.querySelector('.invitation-accept-btn');
        const rejectBtn = overlay.querySelector('.invitation-reject-btn');
        const myName = getMyName();
        
        let autoCloseTimer = null;
        let isResponded = false;
        
        function closePopup() {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = null;
            }
            stopWarmSound();
            overlay.style.animation = 'fadeIn 0.2s ease reverse forwards';
            setTimeout(() => overlay.remove(), 200);
        }
        
        function showMissed() {
            if (isResponded) return;
            isResponded = true;
            stopWarmSound();
            
            // 标记为错过
            respondToLatest('missed');
            
            // 改成错过的样式
            const content = overlay.querySelector('.invitation-popup-content');
            if (content) {
                content.innerHTML = `
                    <div style="position: relative; z-index: 1; padding: 20px 0;">
                        <div style="font-size: 40px; margin-bottom: 16px; opacity: 0.3;">
                            <i class="far fa-clock" style="color: #6b8fff;"></i>
                        </div>
                        <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 8px;">
                            ${myName}错过了${partnerName}的邀请
                        </div>
                        <div style="font-size: 13px; color: #999;">
                            下次要快点哦～
                        </div>
                    </div>
                `;
            }
            
            // 2秒后关闭
            setTimeout(() => {
                overlay.style.animation = 'fadeIn 0.3s ease reverse forwards';
                setTimeout(() => overlay.remove(), 300);
            }, 2000);
        }
        
        acceptBtn.addEventListener('click', () => {
            if (isResponded) return;
            isResponded = true;
            respondToLatest(true);
            closePopup();
            if (typeof showNotification === 'function') {
                showNotification('好耶～', 'success', 2000);
            }
        });
        
        rejectBtn.addEventListener('click', () => {
            if (isResponded) return;
            isResponded = true;
            respondToLatest(false);
            closePopup();
            if (typeof showNotification === 'function') {
                showNotification('下次吧～', 'info', 2000);
            }
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                // 点背景不关闭，避免误触
            }
        });
        
        // 25秒没操作就自动显示错过
        autoCloseTimer = setTimeout(showMissed, 25000);
    }

    // 回应最新的邀请
    function respondToLatest(accepted) {
        if (invitationData.records.length > 0) {
            invitationData.records[0].accepted = accepted;
            saveData();
            render();
        }
    }

    let currentSoundCtx = null;

    // 播放温情钢琴音效（抒情风格，约25秒）
    function playWarmSound() {
        stopWarmSound();
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            
            const ctx = new AudioCtx();
            currentSoundCtx = ctx;
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.4;
            masterGain.connect(ctx.destination);
            
            // 钢琴音色：用三角波 + 柔和包络模拟，加延音让它更连贯
            function playNote(freq, startTime, duration, volume) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                // 更连贯的包络：快速起音，非常缓慢的衰减（延音效果）
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(volume || 0.3, startTime + 0.03);
                gain.gain.setValueAtTime(volume || 0.3, startTime + duration * 0.3);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(startTime);
                osc.stop(startTime + duration + 0.2);
            }
            
            // 音符频率（C大调，抒情）
            const G3 = 196.00, A3 = 220.00;
            const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
            const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
            
            const t = ctx.currentTime;
            
            // 第一遍（0-16秒）
            // 第1小节：C和弦
            playNote(C4, t, 3.5, 0.18);
            playNote(E4, t, 3.5, 0.14);
            playNote(G4, t, 3.5, 0.12);
            // 第2小节：G和弦
            playNote(G3, t + 3.2, 3.5, 0.18);
            playNote(B4, t + 3.2, 3.5, 0.14);
            playNote(D5, t + 3.2, 3.5, 0.12);
            // 第3小节：Am和弦
            playNote(A3, t + 6.4, 3.5, 0.18);
            playNote(C5, t + 6.4, 3.5, 0.14);
            playNote(E5, t + 6.4, 3.5, 0.12);
            // 第4小节：F和弦
            playNote(F4, t + 9.6, 4.5, 0.18);
            playNote(A4, t + 9.6, 4.5, 0.14);
            playNote(C5, t + 9.6, 4.5, 0.12);
            
            // 右手旋律 第一遍
            playNote(E5, t + 0.3, 1.0, 0.28);
            playNote(G5, t + 1.2, 1.0, 0.28);
            playNote(C5, t + 2.2, 1.2, 0.32);
            playNote(D5, t + 3.5, 0.9, 0.28);
            playNote(E5, t + 4.5, 0.9, 0.28);
            playNote(G4, t + 5.4, 1.2, 0.32);
            playNote(A4, t + 6.7, 1.0, 0.28);
            playNote(C5, t + 7.7, 1.0, 0.28);
            playNote(E5, t + 8.7, 1.2, 0.32);
            playNote(F5, t + 9.9, 1.0, 0.28);
            playNote(E5, t + 11.0, 1.2, 0.3);
            playNote(C5, t + 12.3, 2.5, 0.35);
            
            // 第二遍（13-25秒，轻一点，慢慢渐弱）
            // 第5小节：C和弦
            playNote(C4, t + 12.8, 3.5, 0.14);
            playNote(E4, t + 12.8, 3.5, 0.1);
            playNote(G4, t + 12.8, 3.5, 0.08);
            // 第6小节：G和弦
            playNote(G3, t + 16.0, 3.5, 0.14);
            playNote(B4, t + 16.0, 3.5, 0.1);
            playNote(D5, t + 16.0, 3.5, 0.08);
            // 第7小节：Am和弦
            playNote(A3, t + 19.2, 3.5, 0.12);
            playNote(C5, t + 19.2, 3.5, 0.08);
            playNote(E5, t + 19.2, 3.5, 0.06);
            // 第8小节：F和弦（收尾）
            playNote(F4, t + 22.4, 4, 0.1);
            playNote(A4, t + 22.4, 4, 0.07);
            playNote(C5, t + 22.4, 4, 0.05);
            
            // 右手旋律 第二遍（更轻）
            playNote(E5, t + 13.1, 1.0, 0.22);
            playNote(G5, t + 14.0, 1.0, 0.22);
            playNote(C5, t + 15.0, 1.2, 0.25);
            playNote(D5, t + 16.3, 0.9, 0.22);
            playNote(E5, t + 17.3, 0.9, 0.22);
            playNote(G4, t + 18.2, 1.2, 0.25);
            playNote(A4, t + 19.5, 1.0, 0.2);
            playNote(C5, t + 20.5, 1.0, 0.2);
            playNote(E5, t + 21.5, 1.2, 0.22);
            playNote(F5, t + 22.7, 1.0, 0.18);
            playNote(E5, t + 23.8, 1.5, 0.2);
            playNote(C5, t + 25.0, 2.5, 0.25);
            
            // 整体渐弱
            masterGain.gain.setValueAtTime(0.4, t + 20);
            masterGain.gain.linearRampToValueAtTime(0.01, t + 27);
            
        } catch(e) {
            console.error('播放音效失败:', e);
        }
    }

    // 停止音效
    function stopWarmSound() {
        if (currentSoundCtx) {
            try {
                currentSoundCtx.close();
            } catch(e) {}
            currentSoundCtx = null;
        }
    }

    // 按钮点击互动效果
    function buttonClickEffect(btn) {
        if (isAnimating) return;
        isAnimating = true;
        
        // 按钮抖动
        btn.style.animation = 'btnShake 0.5s ease';
        setTimeout(() => { btn.style.animation = ''; }, 500);
        
        // 创建上升的文字和爱心（蓝灰色，参考戳戳样式）
        createFloatItems(btn);
        
        // 添加记录
        addClickRecord();
        
        setTimeout(() => {
            isAnimating = false;
        }, 1500);
    }

    // 添加点击记录
    function addClickRecord() {
        const myName = getMyName();
        const partnerName = getPartnerName();
        const record = {
            id: 'rec_' + Date.now(),
            text: `${myName}想${partnerName}`,
            time: new Date(),
            accepted: null,
            type: 'click' // 区分是点击按钮还是收到邀请
        };
        invitationData.records.unshift(record);
        invitationData.totalCount++;
        
        if (invitationData.records.length > 100) {
            invitationData.records = invitationData.records.slice(0, 100);
        }
        
        saveData();
        render();
    }

    // 创建飘动的文字和爱心（蓝灰色）
    function createFloatItems(btn) {
        // 第一个文字 "？"
        setTimeout(() => {
            createFloatItem('？', btn, 0, '28px', '700');
        }, 100);
        
        // 第二个文字 "这么迫不及待？"
        setTimeout(() => {
            createFloatItem('这么迫不及待？', btn, 1, '14px', '500');
        }, 350);
        
        // 空心爱心
        setTimeout(() => {
            createFloatHeart(btn);
        }, 600);
    }

    // 创建飘动的文字
    function createFloatItem(text, btn, index, fontSize, fontWeight) {
        const el = document.createElement('div');
        el.className = 'invitation-float-text';
        el.textContent = text;
        el.style.cssText = `
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            color: #6b8fff;
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            pointer-events: none;
            z-index: 100;
            opacity: 0;
            font-family: var(--font-family);
            white-space: nowrap;
            text-shadow: 0 2px 8px rgba(107,143,255,0.3);
        `;
        btn.appendChild(el);
        
        // 触发动画
        requestAnimationFrame(() => {
            el.style.animation = `invitationFloatUp 1.2s ease-out forwards`;
            el.style.animationDelay = `${index * 0.1}s`;
        });
        
        setTimeout(() => el.remove(), 1500);
    }

    // 创建飘动的空心爱心
    function createFloatHeart(btn) {
        const el = document.createElement('div');
        el.className = 'invitation-float-heart';
        el.innerHTML = '<i class="far fa-heart"></i>';
        el.style.cssText = `
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            color: #6b8fff;
            font-size: 24px;
            pointer-events: none;
            z-index: 100;
            opacity: 0;
        `;
        btn.appendChild(el);
        
        requestAnimationFrame(() => {
            el.style.animation = 'invitationFloatHeart 1.5s ease-out forwards';
        });
        
        setTimeout(() => el.remove(), 1800);
    }

    // 添加动画样式
    function addAnimStyles() {
        if (document.getElementById('invitation-anim-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'invitation-anim-styles';
        style.textContent = `
            #invitation-main-btn {
                position: relative;
                overflow: visible;
            }
            @keyframes btnShake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                20%, 40%, 60%, 80% { transform: translateX(3px); }
            }
            @keyframes invitationFloatUp {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(0) scale(0.8);
                }
                20% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-60px) scale(1.2);
                }
            }
            @keyframes invitationFloatHeart {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(0) scale(0.5);
                }
                30% {
                    opacity: 0.9;
                    transform: translateX(-50%) translateY(-20px) scale(1.3);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-80px) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 添加自定义邀请
    function addInvitation(text) {
        if (!text || !text.trim()) return false;
        text = text.trim();
        
        const exists = invitationData.invitations.some(inv => inv.text === text);
        if (exists) {
            if (typeof showNotification === 'function') {
                showNotification('这个已经有啦～', 'warning');
            }
            return false;
        }
        
        invitationData.invitations.push({
            id: 'inv_' + Date.now(),
            text: text,
            custom: true
        });
        saveData();
        render();
        
        if (typeof showNotification === 'function') {
            showNotification('添加成功～', 'success');
        }
        return true;
    }

    // 删除自定义邀请
    function deleteInvitation(id) {
        const index = invitationData.invitations.findIndex(inv => inv.id === id);
        if (index !== -1) {
            invitationData.invitations.splice(index, 1);
            saveData();
            render();
            if (typeof showNotification === 'function') {
                showNotification('已删除', 'success', 1500);
            }
        }
    }

    // 清空记录
    function clearRecords() {
        if (!confirm('确定要清空所有邀请记录吗？')) return;
        invitationData.records = [];
        saveData();
        render();
    }

    // 格式化记录显示文字
    function formatRecordText(record) {
        const myName = getMyName();
        const partnerName = getPartnerName();
        return `${myName}想${partnerName}`;
    }

    // 格式化时间
    function formatTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        
        if (d.getFullYear() === now.getFullYear()) {
            return `${month}月${day}日 ${hour}:${minute}`;
        }
        return `${d.getFullYear()}/${month}/${day} ${hour}:${minute}`;
    }

    // 渲染主界面
    function renderMain() {
        const partnerName = getPartnerName();
        const myName = getMyName();
        const todayCount = invitationData.records.filter(r => {
            const today = new Date();
            const recordDate = new Date(r.time);
            return recordDate.toDateString() === today.toDateString();
        }).length;

        return `
            <div style="padding: 0 4px;">
                <!-- 统计信息 -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(107,143,255,0.12) 0%, rgba(180,167,255,0.12) 100%);
                    border-radius: 16px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(107,143,255,0.25);
                ">
                    <div style="text-align: center;">
                        <div style="font-size: 28px;font-weight: 700;color: #6b8fff;line-height: 1;margin-bottom: 6px;">${todayCount}</div>
                        <div style="font-size: 12px;color: var(--text-secondary);">今日邀请</div>
                    </div>
                    <div style="width: 1px;height: 36px;background: var(--border-color);"></div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px;font-weight: 700;color: #6b8fff;line-height: 1;margin-bottom: 6px;">${invitationData.totalCount}</div>
                        <div style="font-size: 12px;color: var(--text-secondary);">累计邀请</div>
                    </div>
                </div>

                <!-- 主按钮 - 灰蓝色，点击只有互动效果 -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <button id="invitation-main-btn" style="
                        padding: 18px 48px;
                        border: 2px solid #6b8fff;
                        border-radius: 50px;
                        background: transparent;
                        color: #6b8fff;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-family: var(--font-family);
                        position: relative;
                        overflow: visible;
                    " onmouseover="this.style.background='rgba(107,143,255,0.08)';" onmouseout="this.style.background='transparent';">
                        <i class="far fa-heart" style="margin-right: 8px;"></i>
                        ${partnerName}想邀请我...
                    </button>
                    <div style="font-size: 12px; color: #999; margin-top: 12px; font-style: italic;">
                        （点一下试试看？）
                    </div>
                </div>

                <!-- 记录列表 -->
                <div style="margin-bottom: 12px;">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    ">
                        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
                            <i class="fas fa-clock" style="margin-right: 6px; color: #6b8fff;"></i>想你的时刻
                        </span>
                        <button onclick="window.InvitationApp.clearRecords()" style="
                            background: none;
                            border: none;
                            color: var(--text-tertiary);
                            font-size: 12px;
                            cursor: pointer;
                            font-family: var(--font-family);
                        ">清空</button>
                    </div>

                    <div style="max-height: 280px; overflow-y: auto;">
                        ${invitationData.records.length === 0 ? `
                            <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
                                <i class="far fa-heart" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px;"></i>
                                <p style="font-size: 14px; color: var(--text-secondary);">还没有收到邀请</p>
                                <span style="font-size: 12px;">等待${partnerName}的邀请吧～</span>
                            </div>
                        ` : invitationData.records.slice(0, 20).map(record => `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                padding: 12px;
                                background: var(--secondary-bg);
                                border-radius: 10px;
                                margin-bottom: 8px;
                            ">
                                <div style="
                                    width: 36px;
                                    height: 36px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 50%;
                                    background: rgba(107,143,255,0.15);
                                    color: #6b8fff;
                                    font-size: 14px;
                                    flex-shrink: 0;
                                ">
                                    <i class="far fa-heart"></i>
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size: 14px; color: var(--text-primary); margin-bottom: 2px;">${formatRecordText(record)}</div>
                                    <div style="font-size: 11px; color: var(--text-tertiary);">${record.text} · ${formatTime(record.time)}</div>
                                </div>
                                ${record.accepted !== null && record.accepted !== 'missed' ? `
                                    <span style="
                                        font-size: 11px;
                                        padding: 3px 10px;
                                        border-radius: 20px;
                                        background: ${record.accepted ? 'rgba(81,207,102,0.15)' : 'rgba(255,107,107,0.15)'};
                                        color: ${record.accepted ? '#51cf66' : '#ff6b6b'};
                                        flex-shrink: 0;
                                    ">${record.accepted ? '答应了' : '再想想'}</span>
                                ` : record.accepted === 'missed' ? `
                                    <span style="
                                        font-size: 11px;
                                        padding: 3px 10px;
                                        border-radius: 20px;
                                        background: rgba(153,153,153,0.15);
                                        color: #999;
                                        flex-shrink: 0;
                                    ">错过了</span>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 管理按钮 -->
                <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button onclick="window.InvitationApp.showManage()" style="
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #d4c5a3;
                        border-radius: 12px;
                        background: transparent;
                        color: #b8956a;
                        font-size: 13px;
                        cursor: pointer;
                        font-family: var(--font-family);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(232,213,163,0.1)';" onmouseout="this.style.background='transparent';">
                        <i class="fas fa-cog"></i> 字卡库
                    </button>
                    <button onclick="window.InvitationApp.simulate()" style="
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #6b8fff;
                        border-radius: 12px;
                        background: transparent;
                        color: #6b8fff;
                        font-size: 13px;
                        cursor: pointer;
                        font-family: var(--font-family);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(107,143,255,0.1)';" onmouseout="this.style.background='transparent';">
                        <i class="fas fa-magic"></i> 模拟邀请
                    </button>
                </div>
            </div>
        `;
    }

    // 渲染管理界面
    function renderManage() {
        return `
            <div style="padding: 0 4px;">
                <!-- 头部 -->
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border-color);
                ">
                    <button onclick="window.InvitationApp.hideManage()" style="
                        background: none;
                        border: none;
                        color: var(--text-secondary);
                        cursor: pointer;
                        padding: 6px;
                        font-size: 16px;
                        transition: color 0.2s;
                    " onmouseover="this.style.color='#6b8fff';" onmouseout="this.style.color='var(--text-secondary)';">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <span style="font-size: 16px; font-weight: 600; color: var(--text-primary);">邀请字卡库</span>
                </div>

                <!-- 说明 -->
                <div style="
                    padding: 12px;
                    background: rgba(107,143,255,0.08);
                    border-radius: 10px;
                    margin-bottom: 16px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                ">
                    <i class="fas fa-info-circle" style="color: #6b8fff; margin-right: 4px;"></i>
                    字卡库里的内容有 <strong style="color: #6b8fff;">94%</strong> 概率被抽到，<br>
                    另外还有小概率出现随机内容～
                </div>

                <!-- 添加 -->
                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                    <input type="text" id="inv-add-input" placeholder="输入邀请内容，如：邀请我陪他看电影" style="
                        flex: 1;
                        padding: 10px 14px;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: var(--font-family);
                        background: var(--primary-bg);
                        color: var(--text-primary);
                        outline: none;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderColor='#6b8fff';" onblur="this.style.borderColor='var(--border-color)';">
                    <button onclick="window.InvitationApp.add()" style="
                        padding: 10px 18px;
                        border: 1px solid #6b8fff;
                        border-radius: 8px;
                        background: rgba(107,143,255,0.1);
                        color: #6b8fff;
                        font-size: 14px;
                        cursor: pointer;
                        font-family: var(--font-family);
                        white-space: nowrap;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(107,143,255,0.2)';" onmouseout="this.style.background='rgba(107,143,255,0.1)';">
                        <i class="fas fa-plus"></i> 添加
                    </button>
                </div>

                <!-- 字卡列表 -->
                <div style="max-height: 45vh; overflow-y: auto;">
                    ${invitationData.invitations.length === 0 ? `
                        <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
                            <i class="fas fa-layer-group" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px;"></i>
                            <p style="font-size: 14px; color: var(--text-secondary);">字卡库是空的</p>
                            <span style="font-size: 12px;">添加一些邀请内容吧～</span>
                        </div>
                    ` : `
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${invitationData.invitations.map((inv, index) => `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding: 10px 14px;
                                    background: var(--secondary-bg);
                                    border-radius: 8px;
                                    transition: all 0.2s;
                                " onmouseover="this.style.background='var(--hover-bg)';" onmouseout="this.style.background='var(--secondary-bg)';">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="
                                            width: 24px;
                                            height: 24px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            border-radius: 6px;
                                            background: rgba(107,143,255,0.15);
                                            color: #6b8fff;
                                            font-size: 12px;
                                            font-weight: 600;
                                        ">${index + 1}</span>
                                        <span style="font-size: 14px; color: var(--text-primary);">${inv.text}</span>
                                    </div>
                                    <button onclick="window.InvitationApp.delete('${inv.id}')" style="
                                        background: none;
                                        border: none;
                                        color: var(--text-tertiary);
                                        cursor: pointer;
                                        padding: 4px 8px;
                                        border-radius: 4px;
                                        transition: all 0.2s;
                                        font-size: 12px;
                                    " onmouseover="this.style.color='#ff6b6b';this.style.background='rgba(255,107,107,0.1)';" onmouseout="this.style.color='var(--text-tertiary)';this.style.background='none';">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // 渲染
    function render() {
        const content = document.getElementById('invitation-content');
        if (!content) return;

        addAnimStyles();

        if (currentView === 'main') {
            content.innerHTML = renderMain();
            
            // 绑定主按钮点击事件
            const btn = document.getElementById('invitation-main-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    buttonClickEffect(btn);
                });
            }
        } else if (currentView === 'manage') {
            content.innerHTML = renderManage();
            
            const input = document.getElementById('inv-add-input');
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        addInvitation(input.value);
                        input.value = '';
                    }
                });
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    // 打开
    function open() {
        const modal = document.getElementById('invitation-modal');
        if (modal) {
            showModal(modal);
            currentView = 'main';
            initData().then(() => render());
        }
    }

    // 关闭
    function close() {
        const modal = document.getElementById('invitation-modal');
        if (modal) {
            hideModal(modal);
        }
    }

    // 显示管理
    function showManage() {
        currentView = 'manage';
        render();
    }

    // 隐藏管理
    function hideManage() {
        currentView = 'main';
        render();
    }

    // 模拟收到邀请（测试用）
    function simulate() {
        receiveInvitation();
    }

    // 添加
    function add() {
        const input = document.getElementById('inv-add-input');
        if (input) {
            addInvitation(input.value);
            input.value = '';
        }
    }

    // 删除
    function del(id) {
        if (confirm('确定要删除这个邀请内容吗？')) {
            deleteInvitation(id);
        }
    }

    // 初始化
    function init() {
        initData();
        addAnimStyles();
    }

    // 暴露到全局
    window.InvitationApp = {
        init: init,
        open: open,
        close: close,
        render: render,
        add: add,
        delete: del,
        showManage: showManage,
        hideManage: hideManage,
        clearRecords: clearRecords,
        simulate: simulate,
        receive: receiveInvitation,
        getData: function() { return invitationData; }
    };

    // ===== 页面加载完成后初始化 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
