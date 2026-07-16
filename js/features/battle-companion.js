/**
 * 作战陪伴功能
 * - 对方可以邀请你陪他做委托（工作）
 * - 邀请有钢琴音效提醒，25秒超时
 * - 可以添加自定义道具（图片+效果文字）
 * - 点击道具"扔过去"，屏幕中间显示效果文字动画
 * - 对方有10%概率主动邀请你扔东西
 */

(function() {
    'use strict';

    // ========== 数据结构 ==========
    // 道具列表：[{id, name, image(base64), effects:[...]}]
    let items = [];
    // 委托/陪伴状态：{ active: false, mission: '', startTime: '', partnerName: '' }
    let companionState = { active: false, mission: '', startTime: '', partnerName: '' };
    // 邀请记录
    let records = [];

    let currentSoundCtx = null;
    let inviteTimer = null;
    let currentInviteOverlay = null;
    let throwAnimTimer = null;

    const STORAGE_KEY = 'battleCompanionData';

    // ========== 存储 ==========
    function getStorageKey(key) {
        const sessionId = window.SESSION_ID || 'default';
        return `${sessionId}_${key}`;
    }

    async function loadData() {
        try {
            if (typeof localforage !== 'undefined') {
                const data = await localforage.getItem(getStorageKey(STORAGE_KEY));
                if (data) {
                    items = data.items || [];
                    companionState = data.companionState || { active: false, mission: '', startTime: '', partnerName: '' };
                    records = data.records || [];
                    return;
                }
            }
        } catch (e) {
            console.warn('[作战陪伴] 加载数据失败:', e);
        }
        // 默认道具
        items = [
            {
                id: 1,
                name: '能量饮料',
                image: '',
                effects: ['你扔了一瓶能量饮料过去！他精神抖擞了起来！', '能量饮料砸中了他的脑袋，他更有干劲了！', '他接过能量饮料，对你比了个加油的手势！']
            },
            {
                id: 2,
                name: '爱心便当',
                image: '',
                effects: ['你扔了一份爱心便当过去！他感动得热泪盈眶！', '便当稳稳落在他桌上，他笑着冲你挥挥手！', '他打开便当，里面还有一张小纸条："加油哦~"']
            },
            {
                id: 3,
                name: '小枕头',
                image: '',
                effects: ['你扔了一个小枕头过去！他接住枕了一下，好舒服~', '小枕头砸在他脸上，他假装生气地瞪了你一眼！', '他抱着小枕头，工作效率竟然提高了！']
            }
        ];
    }

    async function saveData() {
        try {
            if (typeof localforage !== 'undefined') {
                await localforage.setItem(getStorageKey(STORAGE_KEY), {
                    items: items,
                    companionState: companionState,
                    records: records
                });
            }
        } catch (e) {
            console.warn('[作战陪伴] 保存数据失败:', e);
        }
    }

    // ========== 音效 ==========
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

            function playNote(freq, startTime, duration, volume) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(volume || 0.3, startTime + 0.03);
                gain.gain.setValueAtTime(volume || 0.3, startTime + duration * 0.3);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(startTime);
                osc.stop(startTime + duration + 0.2);
            }

            const G3 = 196.00, A3 = 220.00;
            const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
            const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

            const t = ctx.currentTime;

            // 第一遍（0-16秒）
            playNote(C4, t, 3.5, 0.18);
            playNote(E4, t, 3.5, 0.14);
            playNote(G4, t, 3.5, 0.12);
            playNote(G3, t + 3.2, 3.5, 0.18);
            playNote(B4, t + 3.2, 3.5, 0.14);
            playNote(D5, t + 3.2, 3.5, 0.12);
            playNote(A3, t + 6.4, 3.5, 0.18);
            playNote(C5, t + 6.4, 3.5, 0.14);
            playNote(E5, t + 6.4, 3.5, 0.12);
            playNote(F4, t + 9.6, 4.5, 0.18);
            playNote(A4, t + 9.6, 4.5, 0.14);
            playNote(C5, t + 9.6, 4.5, 0.12);

            // 右手旋律
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

            // 第二遍（13-25秒，轻一点）
            playNote(C4, t + 12.8, 3.5, 0.14);
            playNote(E4, t + 12.8, 3.5, 0.1);
            playNote(G4, t + 12.8, 3.5, 0.08);
            playNote(G3, t + 16.0, 3.5, 0.12);
            playNote(B4, t + 16.0, 3.5, 0.08);
            playNote(D5, t + 16.0, 3.5, 0.06);
            playNote(A3, t + 19.2, 3.5, 0.1);
            playNote(C5, t + 19.2, 3.5, 0.07);
            playNote(E5, t + 19.2, 3.5, 0.05);
            playNote(F4, t + 22.4, 3, 0.08);
            playNote(A4, t + 22.4, 3, 0.05);
            playNote(C5, t + 22.4, 3, 0.04);

            playNote(E5, t + 13.1, 1.0, 0.2);
            playNote(G5, t + 14.0, 1.0, 0.2);
            playNote(C5, t + 15.0, 1.2, 0.22);
            playNote(D5, t + 16.3, 0.9, 0.18);
            playNote(E5, t + 17.3, 0.9, 0.18);
            playNote(G4, t + 18.2, 1.2, 0.2);
            playNote(A4, t + 19.5, 1.0, 0.16);
            playNote(C5, t + 20.5, 1.0, 0.16);
            playNote(E5, t + 21.5, 1.2, 0.18);
            playNote(F5, t + 22.7, 1.0, 0.16);
            playNote(E5, t + 23.8, 1.5, 0.18);
        } catch (e) {
            console.warn('[作战陪伴] 播放音效失败:', e);
        }
    }

    function stopWarmSound() {
        if (currentSoundCtx) {
            try { currentSoundCtx.close(); } catch (e) {}
            currentSoundCtx = null;
        }
    }

    // ========== 邀请系统 ==========
    function showInvite(mission) {
        // 如果已经有邀请在显示，先关掉
        closeInvite();

        playWarmSound();

        const partnerName = window.partnerName || '他';
        const missionText = mission || '处理委托';

        const overlay = document.createElement('div');
        overlay.id = 'battle-invite-overlay';
        overlay.className = 'bc-overlay';
        overlay.innerHTML = `
            <div class="bc-invite-card">
                <div class="bc-invite-icon">
                    <i class="fas fa-sword"></i>
                </div>
                <div class="bc-invite-title">${partnerName}邀请你一起作战</div>
                <div class="bc-invite-mission">「${missionText}」</div>
                <div class="bc-invite-desc">来陪我完成这个委托吧~</div>
                <div class="bc-invite-buttons">
                    <button class="bc-btn bc-btn-reject" id="bc-invite-reject">拒绝</button>
                    <button class="bc-btn bc-btn-accept" id="bc-invite-accept">答应！</button>
                </div>
                <div class="bc-invite-timer" id="bc-invite-timer">25s 后自动关闭</div>
            </div>
        `;
        document.body.appendChild(overlay);
        currentInviteOverlay = overlay;

        // 倒计时
        let timeLeft = 25;
        const timerEl = overlay.querySelector('#bc-invite-timer');
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.textContent = `${timeLeft}s 后自动关闭`;
            if (timeLeft <= 0) clearInterval(countdownInterval);
        }, 1000);

        // 25秒自动关闭
        inviteTimer = setTimeout(() => {
            showMissed(missionText);
        }, 25000);

        // 绑定按钮
        overlay.querySelector('#bc-invite-accept').addEventListener('click', () => {
            acceptInvite(missionText);
        });
        overlay.querySelector('#bc-invite-reject').addEventListener('click', () => {
            rejectInvite(missionText);
        });

        // 点背景不关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {}
        });
    }

    function acceptInvite(mission) {
        clearTimeout(inviteTimer);
        stopWarmSound();
        closeInvite();

        companionState = {
            active: true,
            mission: mission,
            startTime: new Date().toISOString(),
            partnerName: window.partnerName || '他'
        };
        records.unshift({
            id: Date.now(),
            mission: mission,
            accepted: true,
            time: new Date().toISOString()
        });
        saveData();
        render();

        if (window.showNotification) {
            window.showNotification('作战开始！加油~', 'success');
        }
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    }

    function rejectInvite(mission) {
        clearTimeout(inviteTimer);
        stopWarmSound();
        closeInvite();

        records.unshift({
            id: Date.now(),
            mission: mission,
            accepted: false,
            time: new Date().toISOString()
        });
        saveData();

        if (window.showNotification) {
            window.showNotification('已拒绝邀请', 'warning');
        }
    }

    function showMissed(mission) {
        stopWarmSound();
        if (currentInviteOverlay) {
            currentInviteOverlay.querySelector('.bc-invite-card').innerHTML = `
                <div class="bc-missed-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="bc-invite-title">你错过了他的邀请</div>
                <div class="bc-invite-mission">「${mission}」</div>
                <div class="bc-invite-desc">他有点失落...</div>
                <button class="bc-btn bc-btn-accept" style="margin-top:20px;" onclick="this.closest('.bc-overlay').remove()">我知道了</button>
            `;
        }
        records.unshift({
            id: Date.now(),
            mission: mission,
            accepted: false,
            missed: true,
            time: new Date().toISOString()
        });
        saveData();
    }

    function closeInvite() {
        if (currentInviteOverlay) {
            currentInviteOverlay.remove();
            currentInviteOverlay = null;
        }
        clearTimeout(inviteTimer);
    }

    // ========== 扔东西动画 ==========
    function throwItem(item) {
        if (!item || !item.effects || item.effects.length === 0) return;

        // 随机选一条效果
        const effect = item.effects[Math.floor(Math.random() * item.effects.length)];

        // 创建动画
        const anim = document.createElement('div');
        anim.className = 'bc-throw-animation';
        anim.innerHTML = `
            <div class="bc-throw-item">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<div class="bc-throw-emoji">🎁</div>`}
            </div>
            <div class="bc-throw-effect">${effect}</div>
        `;
        document.body.appendChild(anim);

        // 触发动画
        requestAnimationFrame(() => {
            anim.classList.add('active');
        });

        // 2.5秒后消失
        clearTimeout(throwAnimTimer);
        throwAnimTimer = setTimeout(() => {
            anim.remove();
        }, 2500);

        // 震动
        if (navigator.vibrate) navigator.vibrate(50);

        // 记录
        records.unshift({
            id: Date.now(),
            type: 'throw',
            itemName: item.name,
            effect: effect,
            time: new Date().toISOString()
        });
        saveData();
    }

    // ========== 道具管理 ==========
    function addItem(name, image, effects) {
        const newItem = {
            id: Date.now(),
            name: name || '新道具',
            image: image || '',
            effects: effects && effects.length > 0 ? effects : ['你扔了过去！']
        };
        items.push(newItem);
        saveData();
        renderItems();
    }

    function deleteItem(id) {
        items = items.filter(i => i.id !== id);
        saveData();
        renderItems();
    }

    function editItem(id, name, image, effects) {
        const item = items.find(i => i.id === id);
        if (item) {
            item.name = name || item.name;
            if (image !== undefined) item.image = image;
            if (effects !== undefined) item.effects = effects;
            saveData();
            renderItems();
        }
    }

    // ========== 渲染 ==========
    function render() {
        renderItems();
        renderStatus();
        renderRecords();
    }

    function renderStatus() {
        const statusEl = document.getElementById('bc-status');
        if (!statusEl) return;

        if (companionState.active) {
            const startTime = new Date(companionState.startTime);
            const duration = Math.floor((Date.now() - startTime.getTime()) / 60000);
            statusEl.innerHTML = `
                <div class="bc-status-active">
                    <div class="bc-status-icon"><i class="fas fa-fire"></i></div>
                    <div class="bc-status-info">
                        <div class="bc-status-mission">${companionState.mission}</div>
                        <div class="bc-status-time">已陪伴 ${duration} 分钟</div>
                    </div>
                    <button class="bc-btn bc-btn-end" onclick="window.BattleCompanion.endCompanion()">结束</button>
                </div>
            `;
        } else {
            statusEl.innerHTML = `
                <div class="bc-status-idle">
                    <i class="fas fa-moon"></i>
                    <span>当前没有进行中的委托</span>
                </div>
            `;
        }
    }

    function renderItems() {
        const container = document.getElementById('bc-items');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="bc-empty">
                    <i class="fas fa-box-open"></i>
                    <p>还没有道具</p>
                    <p style="font-size:12px;opacity:0.6;">点击右上角添加你的第一个道具</p>
                </div>
            `;
            return;
        }

        let html = '<div class="bc-items-grid">';
        items.forEach(item => {
            html += `
                <div class="bc-item-card" onclick="window.BattleCompanion.throwItemById(${item.id})">
                    <div class="bc-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-gift" style="font-size:32px;opacity:0.4;"></i>'}
                    </div>
                    <div class="bc-item-name">${escapeHtml(item.name)}</div>
                    <div class="bc-item-count">${item.effects.length} 种效果</div>
                    <button class="bc-item-edit" onclick="event.stopPropagation();window.BattleCompanion.showEditItem(${item.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function renderRecords() {
        const container = document.getElementById('bc-records');
        if (!container) return;

        const recent = records.slice(0, 20);
        if (recent.length === 0) {
            container.innerHTML = `
                <div class="bc-empty bc-empty-small">
                    <p>还没有记录</p>
                </div>
            `;
            return;
        }

        let html = '<div class="bc-records-list">';
        recent.forEach(record => {
            const time = new Date(record.time);
            const timeStr = time.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            if (record.type === 'throw') {
                html += `
                    <div class="bc-record-item">
                        <div class="bc-record-icon bc-record-throw"><i class="fas fa-paper-plane"></i></div>
                        <div class="bc-record-content">
                            <div class="bc-record-text">你扔了「${escapeHtml(record.itemName)}」</div>
                            <div class="bc-record-effect">${escapeHtml(record.effect)}</div>
                        </div>
                        <div class="bc-record-time">${timeStr}</div>
                    </div>
                `;
            } else {
                const statusIcon = record.accepted ? 'fa-check' : (record.missed ? 'fa-clock' : 'fa-times');
                const statusClass = record.accepted ? 'bc-record-accept' : (record.missed ? 'bc-record-missed' : 'bc-record-reject');
                const statusText = record.accepted ? '已答应' : (record.missed ? '已错过' : '已拒绝');
                html += `
                    <div class="bc-record-item">
                        <div class="bc-record-icon ${statusClass}"><i class="fas ${statusIcon}"></i></div>
                        <div class="bc-record-content">
                            <div class="bc-record-text">邀请：${escapeHtml(record.mission)}</div>
                            <div class="bc-record-sub">${statusText}</div>
                        </div>
                        <div class="bc-record-time">${timeStr}</div>
                    </div>
                `;
            }
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ========== 编辑道具弹窗 ==========
    function showAddItem() {
        showEditItemModal(null);
    }

    function showEditItem(id) {
        const item = items.find(i => i.id === id);
        if (item) {
            showEditItemModal(item);
        }
    }

    function showEditItemModal(item) {
        const isEdit = !!item;
        const modal = document.createElement('div');
        modal.className = 'bc-overlay';
        modal.innerHTML = `
            <div class="bc-edit-modal">
                <div class="bc-edit-header">
                    ${isEdit ? `<button class="bc-edit-delete" id="bc-edit-delete" title="删除道具">
                        <i class="fas fa-trash-alt"></i>
                    </button>` : '<div class="bc-edit-spacer"></div>'}
                    <div class="bc-edit-title">${isEdit ? '编辑道具' : '添加道具'}</div>
                    <div class="bc-edit-spacer"></div>
                </div>
                <div class="bc-edit-field">
                    <label>道具名称</label>
                    <input type="text" id="bc-edit-name" value="${isEdit ? escapeHtml(item.name) : ''}" placeholder="给道具起个名字" maxlength="20">
                </div>
                <div class="bc-edit-field">
                    <label>道具图片</label>
                    <div class="bc-image-upload" id="bc-image-upload">
                        <div class="bc-image-preview" id="bc-image-preview" style="${isEdit && item.image ? '' : 'display:none;'}">
                            ${isEdit && item.image ? `<img src="${item.image}" id="bc-preview-img">` : ''}
                        </div>
                        <div class="bc-image-placeholder" id="bc-image-placeholder" style="${isEdit && item.image ? 'display:none;' : ''}">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>点击上传图片</span>
                        </div>
                        <input type="file" id="bc-image-input" accept="image/*" style="display:none;">
                    </div>
                </div>
                <div class="bc-edit-field">
                    <label>效果文字（每行一条，随机出现）</label>
                    <textarea id="bc-edit-effects" rows="5" placeholder="你扔了一瓶能量饮料过去！&#10;他精神抖擞了起来！">${isEdit ? item.effects.join('\n') : ''}</textarea>
                </div>
                <div class="bc-edit-buttons">
                    <button class="bc-btn bc-btn-reject" id="bc-edit-cancel">取消</button>
                    <button class="bc-btn bc-btn-accept" id="bc-edit-save">保存</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        let currentImage = isEdit ? item.image : '';

        // 图片上传
        const uploadArea = modal.querySelector('#bc-image-upload');
        const fileInput = modal.querySelector('#bc-image-input');
        const preview = modal.querySelector('#bc-image-preview');
        const placeholder = modal.querySelector('#bc-image-placeholder');

        function updatePreview(imgSrc) {
            if (imgSrc) {
                let img = preview.querySelector('img');
                if (img) {
                    img.src = imgSrc;
                } else {
                    preview.innerHTML = `<img src="${imgSrc}" id="bc-preview-img">`;
                }
                preview.style.display = '';
                placeholder.style.display = 'none';
            } else {
                preview.innerHTML = '';
                preview.style.display = 'none';
                placeholder.style.display = '';
            }
        }

        uploadArea.addEventListener('click', (e) => {
            e.stopPropagation();
            // 重置 fileInput 值，这样即使选同一个文件也能触发 change
            fileInput.value = '';
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    currentImage = ev.target.result;
                    updatePreview(currentImage);
                };
                reader.readAsDataURL(file);
            }
        });

        // 保存
        modal.querySelector('#bc-edit-save').addEventListener('click', () => {
            const name = modal.querySelector('#bc-edit-name').value.trim();
            const effectsText = modal.querySelector('#bc-edit-effects').value.trim();
            const effects = effectsText.split('\n').map(e => e.trim()).filter(e => e);

            if (!name) {
                if (window.showNotification) window.showNotification('请输入道具名称', 'warning');
                return;
            }
            if (effects.length === 0) {
                if (window.showNotification) window.showNotification('至少添加一条效果文字', 'warning');
                return;
            }

            if (isEdit) {
                editItem(item.id, name, currentImage, effects);
            } else {
                addItem(name, currentImage, effects);
            }
            modal.remove();
            if (window.showNotification) window.showNotification(isEdit ? '已保存' : '添加成功', 'success');
        });

        // 删除（编辑模式）
        if (isEdit) {
            const deleteBtn = modal.querySelector('#bc-edit-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除「${item.name}」吗？`)) {
                        deleteItem(item.id);
                        modal.remove();
                        if (window.showNotification) window.showNotification('已删除', 'success');
                    }
                });
            }
        }

        // 取消
        modal.querySelector('#bc-edit-cancel').addEventListener('click', () => {
            modal.remove();
        });

        // 点背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ========== 对方主动邀请扔东西 ==========
    function maybeRequestThrow() {
        // 10% 概率
        if (Math.random() > 0.1) return;
        if (!companionState.active) return; // 只有在陪伴中才会触发

        const partnerName = window.partnerName || '他';
        const requests = [
            `${partnerName}：再给我扔点东西嘛~`,
            `${partnerName}：还有补给吗？`,
            `${partnerName}：我需要支援！`,
            `${partnerName}：扔点什么过来！`,
            `${partnerName}：有点累了，给我点动力！`
        ];
        const request = requests[Math.floor(Math.random() * requests.length)];

        if (window.showNotification) {
            window.showNotification(request, 'info');
        }
    }

    // ========== 结束陪伴 ==========
    function endCompanion() {
        if (companionState.active) {
            const duration = Math.floor((Date.now() - new Date(companionState.startTime).getTime()) / 60000);
            companionState.active = false;
            saveData();
            render();
            if (window.showNotification) {
                window.showNotification(`作战结束！共陪伴 ${duration} 分钟，辛苦了~`, 'success');
            }
        }
    }

    // ========== 工具函数 ==========
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== 模拟邀请（测试用） ==========
    function simulateInvite() {
        const missions = ['整理报告', '代码调试', '方案设计', '数据整理', '文档撰写', '项目攻坚'];
        const mission = missions[Math.floor(Math.random() * missions.length)];
        showInvite(mission);
    }

    // ========== 公开 API ==========
    window.BattleCompanion = {
        open: function() {
            const modal = document.getElementById('battle-companion-modal');
            if (modal) {
                if (typeof window.showModal === 'function') {
                    window.showModal(modal);
                } else {
                    modal.style.display = 'flex';
                }
            }
            render();
            // 启动状态更新定时器
            if (this._statusTimer) clearInterval(this._statusTimer);
            this._statusTimer = setInterval(() => renderStatus(), 60000);
        },
        close: function() {
            const modal = document.getElementById('battle-companion-modal');
            if (modal) {
                if (typeof window.hideModal === 'function') {
                    window.hideModal(modal);
                } else {
                    modal.style.display = 'none';
                }
            }
            if (this._statusTimer) {
                clearInterval(this._statusTimer);
                this._statusTimer = null;
            }
        },
        throwItemById: function(id) {
            const item = items.find(i => i.id === id);
            if (item) throwItem(item);
        },
        showAddItem: showAddItem,
        showEditItem: showEditItem,
        simulateInvite: simulateInvite,
        endCompanion: endCompanion,
        maybeRequestThrow: maybeRequestThrow,
        loadData: loadData
    };

    // ========== 初始化 ==========
    document.addEventListener('DOMContentLoaded', () => {
        loadData();
    });

    // 页面加载完成后也尝试加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadData());
    } else {
        loadData();
    }

})();
