/* 书架与梦向问卷功能 */
var escapeHtml = window.escapeHtml || function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
};
window.escapeHtml = window.escapeHtml || escapeHtml;

// ==================== 梦向问卷功能 ====================
let dreamQuestionnaires = [];  // 创建的问卷列表
let dqCurrentType = 'choice';  // 当前编辑的问卷类型
let dqCurrentReplyTime = 'immediate'; // 当前编辑的回复时间
let dqQuestions = [];  // 当前编辑的题目列表
let dqEditingId = null; // 正在编辑的问卷 ID

// 修改 loadDQData 函数
async function loadDQData() {
    try {
        const saved = await localforage.getItem(getStorageKey('dreamQuestionnaires'));
        if (saved && Array.isArray(saved)) dreamQuestionnaires = saved;
    } catch(e) {
        dreamQuestionnaires = [];
    }
    
    // 检查所有待回复的问卷
    setTimeout(checkAllPendingDQs, 1000);
}

function saveDQData() {
    localforage.setItem(getStorageKey('dreamQuestionnaires'), dreamQuestionnaires).catch(() => {});
}

// 渲染问卷列表
function renderDQList() {
    const list = document.getElementById('dq-list');
    if (!list) return;

    if (dreamQuestionnaires.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-clipboard-list" style="font-size: 40px; opacity: 0.3; margin-bottom: 12px; display: block;"></i>
                <p style="font-size: 14px; font-weight: 500;">还没有问卷</p>
                <p style="font-size: 12px; opacity: 0.6;">点击"创建新问卷"开始吧~</p>
            </div>`;
    } else {
        list.innerHTML = dreamQuestionnaires.map((dq, index) => {
            const typeBadge = dq.type === 'choice' 
                ? '<span class="dq-card-badge choice">📋 选择题</span>'
                : '<span class="dq-card-badge fill">✏️ 填空题</span>';
            const statusBadge = dq.answer 
                ? '<span class="dq-card-badge answered">✓ 已回复</span>'
                : (dq.sent ? '<span class="dq-card-badge pending">⏳ 等待回复</span>' : '');
            const questionCount = dq.questions ? dq.questions.length : 0;
            const replyTimeLabel = dq.replyTime === 'immediate' ? '立即回复' : '随机时间';
            const answerPreview = dq.answer ? '点击查看回复 →' : (dq.sent ? '等待中...' : '点击发送 →');
            
            return `
                <div class="dq-card" onclick="handleDQCardClick('${dq.id}')">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="flex: 1; min-width: 0;">
                            <div class="dq-card-header">
                                <span class="dq-card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(dq.title || '未命名问卷')}</span>
                            </div>
                            <div class="dq-card-meta">
                                <span>${questionCount} 题</span>
                                <span>·</span>
                                ${typeBadge}
                                <span>·</span>
                                <span>${replyTimeLabel}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--accent-color); margin-top: 4px; opacity: 0.8;">${answerPreview}</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-left: 10px;">
                            ${statusBadge}
                            <button class="dq-delete-btn" onclick="event.stopPropagation(); deleteDQ('${dq.id}')" title="删除">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    // 渲染收到的回复列表
    renderDQReceived();
}

// 渲染收到的问卷回复
function renderDQReceived() {
    const receivedList = document.getElementById('dq-received-list');
    const receivedSection = document.getElementById('dq-received');
    if (!receivedList || !receivedSection) return;

    const answeredDQs = dreamQuestionnaires.filter(dq => dq.answer);
    
    if (answeredDQs.length === 0) {
        receivedSection.style.display = 'none';
        return;
    }
    
    receivedSection.style.display = 'block';
    receivedList.innerHTML = answeredDQs.map(dq => `
        <div class="dq-card" onclick="viewDQAnswer('${dq.id}')" style="margin-bottom: 6px;">
            <div class="dq-card-header">
                <span class="dq-card-title">${escapeHtml(dq.title || '未命名问卷')}</span>
                <span class="dq-card-badge answered">✓ 已回复</span>
            </div>
            <div class="dq-card-meta">
                ${dq.questions ? dq.questions.length : 0} 题 · ${dq.type === 'choice' ? '选择题' : '填空题'}
            </div>
        </div>
    `).join('');
}

// 处理问卷卡片点击
function handleDQCardClick(id) {
    const dq = dreamQuestionnaires.find(q => q.id === id);
    if (!dq) return;
    
    // 先检查是否需要生成回复（处理页面刷新后定时器丢失的情况）
    if (dq.sent && !dq.answer && dq.expectedReplyAt) {
        checkAndGenerateDQReply(dq);
    }
    
    // 重新获取最新状态
    const updatedDq = dreamQuestionnaires.find(q => q.id === id);
    if (!updatedDq) return;
    
    if (updatedDq.answer) {
        viewDQAnswer(id);
    } else if (!updatedDq.sent) {
        openDQEditor(id);
    } else {
        // 显示等待中的提示
        const remainingMinutes = updatedDq.expectedReplyAt 
            ? Math.max(0, Math.ceil((updatedDq.expectedReplyAt - Date.now()) / 60000))
            : 0;
        showNotification(`问卷已发送，梦角预计 ${remainingMinutes} 分钟内回复`, 'info', 3000);
    }
}

// 在页面加载时检查所有待回复的问卷
function checkAllPendingDQs() {
    dreamQuestionnaires.forEach(dq => {
        if (dq.sent && !dq.answer && dq.expectedReplyAt) {
            checkAndGenerateDQReply(dq);
        }
    });
}

// 打开编辑器
function openDQEditor(id = null) {
    dqEditingId = id;
    const editorView = document.getElementById('dq-editor-view');
    const mainView = document.getElementById('dq-main-view');
    const answerView = document.getElementById('dq-answer-view');
    
    if (id) {
        const dq = dreamQuestionnaires.find(q => q.id === id);
        if (!dq) return;
        dqCurrentType = dq.type || 'choice';
        dqCurrentReplyTime = dq.replyTime || 'immediate';
        dqQuestions = JSON.parse(JSON.stringify(dq.questions || []));
        document.getElementById('dq-title-input').value = dq.title || '';
    } else {
        dqCurrentType = 'choice';
        dqCurrentReplyTime = 'immediate';
        dqQuestions = [];
        document.getElementById('dq-title-input').value = '';
    }

    mainView.style.display = 'none';
    answerView.style.display = 'none';
    editorView.style.display = 'block';
    
    updateDQTypeButtons();
    updateDQReplyTimeButtons();
    renderDQQuestions();
    
    document.getElementById('dq-create-btn').style.display = 'none';
    document.getElementById('dq-save-btn').style.display = '';
    document.getElementById('dq-send-btn').style.display = '';
    document.getElementById('dq-back-btn').style.display = '';
    document.getElementById('close-dq-modal').style.display = 'none';
    document.getElementById('dq-send-btn').style.display = id ? (dreamQuestionnaires.find(q => q.id === id)?.sent ? 'none' : '') : '';
    document.getElementById('dq-save-btn').style.display = id ? (dreamQuestionnaires.find(q => q.id === id)?.sent ? 'none' : '') : '';
}

// 返回主视图
function backToDQMain() {
    document.getElementById('dq-editor-view').style.display = 'none';
    document.getElementById('dq-answer-view').style.display = 'none';
    document.getElementById('dq-main-view').style.display = '';
    document.getElementById('dq-create-btn').style.display = '';
    document.getElementById('dq-save-btn').style.display = 'none';
    document.getElementById('dq-send-btn').style.display = 'none';
    document.getElementById('dq-back-btn').style.display = 'none';
    document.getElementById('close-dq-modal').style.display = '';
    dqEditingId = null;
    renderDQList();
}

// 更新类型按钮
function updateDQTypeButtons() {
    document.querySelectorAll('.dq-type-btn').forEach(btn => {
        if (btn.dataset.type === dqCurrentType) {
            btn.className = 'modal-btn modal-btn-primary dq-type-btn';
        } else {
            btn.className = 'modal-btn modal-btn-secondary dq-type-btn';
        }
    });
}

// 更新回复时间按钮
function updateDQReplyTimeButtons() {
    document.querySelectorAll('.dq-reply-time-btn').forEach(btn => {
        if (btn.dataset.time === dqCurrentReplyTime) {
            btn.className = 'modal-btn modal-btn-primary dq-reply-time-btn';
        } else {
            btn.className = 'modal-btn modal-btn-secondary dq-reply-time-btn';
        }
    });
    document.getElementById('dq-random-hint').style.display = 
        dqCurrentReplyTime === 'random' ? 'block' : 'none';
}

// 渲染题目列表
function renderDQQuestions() {
    const container = document.getElementById('dq-questions-container');
    if (!container) return;

    if (dqQuestions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 13px; opacity: 0.6;">
                暂无题目，点击下方按钮添加
            </div>`;
        return;
    }

    container.innerHTML = dqQuestions.map((q, index) => `
        <div class="dq-question-block">
            <div class="dq-question-header">
                <div class="dq-question-number">${index + 1}</div>
                <input type="text" class="dq-question-input" value="${escapeHtml(q.question)}" 
                    placeholder="输入题目..." data-qindex="${index}" onchange="updateDQQuestion(${index}, 'question', this.value)">
                <button class="dq-option-remove" onclick="removeDQQuestion(${index})" title="删除题目">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${dqCurrentType === 'choice' ? renderDQOptions(q, index) : ''}
        </div>
    `).join('');
}

// 渲染选项
function renderDQOptions(question, qIndex) {
    const options = question.options || [];
    
    return `
        <div style="padding-left: 34px;">
            ${options.map((opt, oIndex) => `
                <div class="dq-option-row">
                    <span style="font-size: 11px; color: var(--text-secondary); min-width: 18px;">${String.fromCharCode(65 + oIndex)}.</span>
                    <input type="text" class="dq-option-input" value="${escapeHtml(opt)}" 
                        placeholder="选项 ${oIndex + 1}" onchange="updateDQOption(${qIndex}, ${oIndex}, this.value)">
                    <button class="dq-option-remove" onclick="removeDQOption(${qIndex}, ${oIndex})" title="删除选项">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
            <button onclick="addDQOption(${qIndex})" style="background: none; border: 1px dashed var(--border-color); border-radius: 6px; padding: 5px 10px; font-size: 11px; color: var(--text-secondary); cursor: pointer; width: 100%; margin-top: 4px;">
                <i class="fas fa-plus"></i> 添加选项
            </button>
        </div>
    `;
}

// 添加题目
function addDQQuestion() {
    const newQuestion = {
        question: '',
        options: dqCurrentType === 'choice' ? ['', ''] : []
    };
    dqQuestions.push(newQuestion);
    renderDQQuestions();
}

// 删除题目
function removeDQQuestion(index) {
    dqQuestions.splice(index, 1);
    renderDQQuestions();
}

// 更新题目
function updateDQQuestion(index, field, value) {
    if (dqQuestions[index]) {
        dqQuestions[index][field] = value;
    }
}

// 添加选项
function addDQOption(qIndex) {
    if (dqQuestions[qIndex] && dqQuestions[qIndex].options) {
        dqQuestions[qIndex].options.push('');
        renderDQQuestions();
    }
}

// 删除选项
function removeDQOption(qIndex, oIndex) {
    if (dqQuestions[qIndex] && dqQuestions[qIndex].options) {
        dqQuestions[qIndex].options.splice(oIndex, 1);
        renderDQQuestions();
    }
}

// 更新选项
function updateDQOption(qIndex, oIndex, value) {
    if (dqQuestions[qIndex] && dqQuestions[qIndex].options) {
        dqQuestions[qIndex].options[oIndex] = value;
    }
}

// 保存问卷
function saveDQ() {
    const title = document.getElementById('dq-title-input').value.trim();
    if (!title) {
        showNotification('请输入问卷标题', 'warning');
        return;
    }
    
    // 更新题目内容
    document.querySelectorAll('.dq-question-input').forEach(input => {
        const index = parseInt(input.dataset.qindex);
        if (!isNaN(index) && dqQuestions[index]) {
            dqQuestions[index].question = input.value;
        }
    });
    document.querySelectorAll('.dq-option-input').forEach((input, i) => {
        // 通过 DOM 结构解析
        const optionRow = input.closest('.dq-option-row');
        const questionBlock = input.closest('.dq-question-block');
        if (questionBlock) {
            const qInput = questionBlock.querySelector('.dq-question-input');
            if (qInput) {
                const qIndex = parseInt(qInput.dataset.qindex);
                const allOptionInputs = questionBlock.querySelectorAll('.dq-option-input');
                const oIndex = Array.from(allOptionInputs).indexOf(input);
                if (!isNaN(qIndex) && dqQuestions[qIndex] && dqQuestions[qIndex].options) {
                    dqQuestions[qIndex].options[oIndex] = input.value;
                }
            }
        }
    });

    const validQuestions = dqQuestions.filter(q => q.question.trim());
    if (validQuestions.length === 0) {
        showNotification('请至少添加一道有效题目', 'warning');
        return;
    }
    if (dqCurrentType === 'choice') {
        const invalidOptions = validQuestions.some(q => 
            !q.options || q.options.filter(o => o.trim()).length < 2
        );
        if (invalidOptions) {
            showNotification('选择题每题至少需要两个选项', 'warning');
            return;
        }
    }

    const dqData = {
        id: dqEditingId || ('dq_' + Date.now()),
        title,
        type: dqCurrentType,
        replyTime: dqCurrentReplyTime,
        questions: validQuestions.map(q => ({
            question: q.question.trim(),
            options: dqCurrentType === 'choice' ? q.options.map(o => o.trim()).filter(o => o) : []
        })),
        sent: false,
        answer: null,
        createdAt: Date.now()
    };

    if (dqEditingId) {
        const index = dreamQuestionnaires.findIndex(q => q.id === dqEditingId);
        if (index >= 0) {
            dreamQuestionnaires[index] = dqData;
        } else {
            dreamQuestionnaires.push(dqData);
        }
    } else {
        dreamQuestionnaires.push(dqData);
    }

    saveDQData();
    backToDQMain();
    showNotification('问卷已保存 ✓', 'success');
}

// 发送问卷
function sendDQ() {
    if (!dqEditingId) {
        showNotification('请先保存问卷', 'warning');
        return;
    }
    
    const dq = dreamQuestionnaires.find(q => q.id === dqEditingId);
    if (!dq) return;
    
    if (dq.sent) {
        showNotification('该问卷已发送', 'warning');
        return;
    }
    
    // 保存最新内容
    saveDQWithoutClose(dq);
    
    // 立即标记为已发送，并记录发送时间
    dq.sent = true;
    dq.sentAt = Date.now();
    
    // 如果是随机时间，记录期望的回复时间范围
    if (dq.replyTime === 'random') {
        const delayMinutes = Math.floor(Math.random() * 300); // 0-300 分钟
        dq.expectedReplyAt = Date.now() + delayMinutes * 60 * 1000;
        dq.replyDelayMinutes = delayMinutes;
    } else {
        dq.expectedReplyAt = Date.now() + 3000; // 立即回复，约3秒
        dq.replyDelayMinutes = 0;
    }
    
    saveDQData();
    
    // 检查是否应该立即回复
    checkAndGenerateDQReply(dq);
    
    backToDQMain();
    
    if (dq.replyTime === 'immediate') {
        showNotification('问卷已发送！梦角正在填写... ✉️', 'success');
    } else {
        showNotification(`问卷已发送！梦角将在 ${dq.replyDelayMinutes} 分钟内回复 ✉️`, 'success');
    }
}

// 检查并生成回复（替代 setTimeout）
function checkAndGenerateDQReply(dq) {
    if (!dq || !dq.sent || dq.answer) return;
    
    const now = Date.now();
    const expectedTime = dq.expectedReplyAt || 0;
    
    if (now >= expectedTime) {
        // 时间到了，立即生成回复
        generateDQAnswerNow(dq);
    } else {
        // 还没到时间，设置定时器
        const delay = expectedTime - now;
        setTimeout(() => {
            // 重新从数组中获取最新数据
            const currentDq = dreamQuestionnaires.find(q => q.id === dq.id);
            if (currentDq && currentDq.sent && !currentDq.answer) {
                generateDQAnswerNow(currentDq);
            }
        }, delay);
    }
}

// 无需关闭的保存
function saveDQWithoutClose(targetDQ) {
    const title = document.getElementById('dq-title-input').value.trim();
    if (title) targetDQ.title = title;
    targetDQ.type = dqCurrentType;
    targetDQ.replyTime = dqCurrentReplyTime;
    
    document.querySelectorAll('.dq-question-input').forEach(input => {
        const index = parseInt(input.dataset.qindex);
        if (!isNaN(index) && dqQuestions[index]) {
            dqQuestions[index].question = input.value;
        }
    });
    
    targetDQ.questions = dqQuestions.filter(q => q.question.trim()).map(q => ({
        question: q.question.trim(),
        options: dqCurrentType === 'choice' ? (q.options || []).map(o => o.trim()).filter(o => o) : []
    }));
}

// 安排回复
function scheduleDQReply(dq) {
    let delay;
    if (dq.replyTime === 'immediate') {
        delay = 2000 + Math.random() * 3000;
    } else {
        delay = Math.floor(Math.random() * 300 * 60 * 1000); // 0-300 分钟
    }
    
    setTimeout(() => {
        generateDQAnswer(dq);
    }, delay);
}

// 立即生成回复
function generateDQAnswerNow(dq) {
    if (!dq || !dq.questions) return;
    if (dq.answer) return; // 已经有答案了，不重复生成
    
    const answers = dq.questions.map(q => {
        if (dq.type === 'choice') {
            const options = q.options || [];
            if (options.length === 0) return { question: q.question, answer: '(无选项)' };
            const randomIndex = Math.floor(Math.random() * options.length);
            return { question: q.question, answer: options[randomIndex] };
        } else {
            // 填空题：从主字卡中随机抽取 1-3 句话
            const replyPool = customReplies && customReplies.length > 0 
                ? customReplies 
                : (typeof CONSTANTS !== 'undefined' && CONSTANTS.REPLY_MESSAGES && CONSTANTS.REPLY_MESSAGES.length > 0
                    ? CONSTANTS.REPLY_MESSAGES
                    : ['一切安好', '今天很开心', '想你']);
            const sentenceCount = 1 + Math.floor(Math.random() * 3); // 1-3 句
            const selected = [];
            const shuffled = [...replyPool].sort(() => Math.random() - 0.5);
            for (let i = 0; i < Math.min(sentenceCount, shuffled.length); i++) {
                selected.push(shuffled[i]);
            }
            return { question: q.question, answer: selected.join('。') + (selected.length > 0 ? '。' : '') };
        }
    });
    
    dq.answer = {
        answers,
        answeredAt: Date.now()
    };
    saveDQData();
    
    // 如果问卷列表当前可见，刷新显示
    const dqList = document.getElementById('dq-list');
    if (dqList && document.getElementById('dream-questionnaire-modal').style.display !== 'none') {
        renderDQList();
    }
    
    // 通知用户
    showNotification(`梦角已填写问卷「${dq.title}」✨`, 'success', 4000);
}

// 查看问卷答案
function viewDQAnswer(id) {
    const dq = dreamQuestionnaires.find(q => q.id === id);
    if (!dq || !dq.answer) return;
    
    const mainView = document.getElementById('dq-main-view');
    const editorView = document.getElementById('dq-editor-view');
    const answerView = document.getElementById('dq-answer-view');
    const answerContent = document.getElementById('dq-answer-content');
    
    mainView.style.display = 'none';
    editorView.style.display = 'none';
    answerView.style.display = 'block';
    
    answerContent.innerHTML = `
        <div style="margin-bottom: 16px;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(dq.title)}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">
                ${new Date(dq.answer.answeredAt).toLocaleString('zh-CN')} · 梦角填写
            </div>
        </div>
        ${dq.answer.answers.map((a, i) => `
            <div class="dq-qa-item">
                <div class="dq-qa-question">${i + 1}. ${escapeHtml(a.question)}</div>
                <div class="dq-qa-answer ${dq.type === 'fill' ? 'fill-answer' : ''}">${escapeHtml(a.answer)}</div>
            </div>
        `).join('')}
    `;
    
    document.getElementById('dq-create-btn').style.display = 'none';
    document.getElementById('dq-save-btn').style.display = 'none';
    document.getElementById('dq-send-btn').style.display = 'none';
    document.getElementById('dq-back-btn').style.display = '';
    document.getElementById('close-dq-modal').style.display = 'none';
}

// 删除问卷
function deleteDQ(id) {
    if (!confirm('确定要删除这个问卷吗？')) return;
    dreamQuestionnaires = dreamQuestionnaires.filter(q => q.id !== id);
    saveDQData();
    renderDQList();
    showNotification('问卷已删除', 'success');
}

// 初始化问卷事件
function initDQListeners() {
    // 创建按钮
    document.getElementById('dq-create-btn').addEventListener('click', () => openDQEditor(null));
    
    // 返回按钮
    document.getElementById('dq-back-btn').addEventListener('click', backToDQMain);
    
    // 保存按钮
    document.getElementById('dq-save-btn').addEventListener('click', saveDQ);
    
    // 发送按钮
    document.getElementById('dq-send-btn').addEventListener('click', sendDQ);
    
    // 关闭按钮
    document.getElementById('close-dq-modal').addEventListener('click', () => {
        hideModal(document.getElementById('dream-questionnaire-modal'));
    });
    
    // 类型按钮
    document.querySelectorAll('.dq-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            dqCurrentType = btn.dataset.type;
            updateDQTypeButtons();
            renderDQQuestions();
        });
    });
    
    // 回复时间按钮
    document.querySelectorAll('.dq-reply-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            dqCurrentReplyTime = btn.dataset.time;
            updateDQReplyTimeButtons();
        });
    });
    
    // 添加题目按钮
    document.getElementById('dq-add-question-btn').addEventListener('click', addDQQuestion);
    
    // 高级功能入口
    const dqEntry = document.getElementById('dream-questionnaire-function');
    if (dqEntry) {
        dqEntry.addEventListener('click', async () => {
            if (DOMElements.advancedModal && DOMElements.advancedModal.modal) {
                hideModal(DOMElements.advancedModal.modal);
            }
            await loadDQData();
            renderDQList();
            showModal(document.getElementById('dream-questionnaire-modal'));
        });
    }
}

// 在 DOMContentLoaded 中初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDQListeners, 500);
});
// ==================== 修改后的书架功能 ====================
let bookshelf = [];
let currentReaderBook = null;
let readerPageSize = 800;
let readerFontSize = 15;
let readerCurrentPage = 0;
let readerPages = [];
let readerIsMinimized = false;  // 是否最小化

const BOOKSHELF_STORAGE_KEY = 'userBookshelf';
const READER_WINDOW_STATE_KEY = 'readerWindowState';

// 加载书架数据
async function loadBookshelf() {
    try {
        const saved = await localforage.getItem(BOOKSHELF_STORAGE_KEY);
        if (saved && Array.isArray(saved)) {
            bookshelf = saved;
        }
    } catch(e) {
        bookshelf = [];
    }
    
    // 恢复阅读器状态（如果之前有打开的书籍）
    await restoreReaderState();
}

// 恢复阅读器状态
async function restoreReaderState() {
    try {
        const state = await localforage.getItem(READER_WINDOW_STATE_KEY);
        if (state && state.bookId && state.isMinimized) {
            const book = bookshelf.find(b => b.id === state.bookId);
            if (book) {
                currentReaderBook = book;
                readerCurrentPage = state.currentPage || 0;
                readerFontSize = state.fontSize || 15;
                readerIsMinimized = true;
                
                paginateBook(book);
                updateMiniPill();
                showMiniPill();
                
                // 设置阅读器内容（为展开做准备）
                document.getElementById('reader-title').textContent = book.name;
                document.getElementById('reader-content').style.fontSize = readerFontSize + 'px';
                document.getElementById('reader-font-size').textContent = readerFontSize + 'px';
                if (readerCurrentPage >= readerPages.length) readerCurrentPage = 0;
                renderCurrentPage();
                updateReaderNav();
                updateReaderProgress();
            }
        }
    } catch(e) {
        // 忽略恢复错误
    }
}

// 保存阅读器状态
function saveReaderState() {
    if (currentReaderBook && readerIsMinimized) {
        localforage.setItem(READER_WINDOW_STATE_KEY, {
            bookId: currentReaderBook.id,
            currentPage: readerCurrentPage,
            fontSize: readerFontSize,
            isMinimized: true,
            timestamp: Date.now()
        }).catch(() => {});
    } else {
        localforage.removeItem(READER_WINDOW_STATE_KEY).catch(() => {});
    }
}

// 保存书架数据
function saveBookshelf() {
    localforage.setItem(BOOKSHELF_STORAGE_KEY, bookshelf).catch(() => {});
}

// 渲染书架
function renderBookshelf() {
    const grid = document.getElementById('bookshelf-grid');
    if (!grid) return;

    if (bookshelf.length === 0) {
        grid.innerHTML = `
            <div class="bookshelf-empty" style="grid-column: 1 / -1;">
                <i class="fas fa-book-open"></i>
                <p>书架空空如也</p>
                <span>点击"导入小说"添加你的第一本书吧~</span>
            </div>`;
        return;
    }

    grid.innerHTML = bookshelf.map((book, index) => {
        const progress = book.totalPages > 0 
            ? Math.round((book.currentPage / book.totalPages) * 100) 
            : 0;
        const coverHtml = book.cover 
            ? `<img src="${book.cover}" alt="${escapeHtml(book.name)}">`
            : `<i class="fas fa-book book-cover-icon"></i>`;

        // 标记当前正在阅读的书籍
        const isReading = currentReaderBook && currentReaderBook.id === book.id;
        const readingBadge = isReading ? `<span style="position:absolute;top:6px;left:6px;background:var(--accent-color);color:#fff;font-size:9px;padding:2px 6px;border-radius:10px;z-index:2;">阅读中</span>` : '';

        return `
            <div class="book-item" onclick="openReader('${book.id}')">
                <div class="book-cover">
                    ${coverHtml}
                    ${readingBadge}
                    <div class="book-item-actions">
                        <button class="book-action-btn" onclick="event.stopPropagation(); editBookName('${book.id}')" title="修改书名">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="book-action-btn" onclick="event.stopPropagation(); changeBookCover('${book.id}')" title="更换封面">
                            <i class="fas fa-image"></i>
                        </button>
                        <button class="book-action-btn danger" onclick="event.stopPropagation(); deleteBook('${book.id}')" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="book-name">${escapeHtml(book.name)}</div>
                ${book.totalPages > 0 ? `<div class="book-progress">${progress}%</div>` : ''}
            </div>`;
    }).join('');
}

// 导入TXT小说
function importBook(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
        showNotification('请选择 TXT 文件', 'error');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showNotification('文件太大，请选择 10MB 以内的文件', 'error');
        return;
    }

    showNotification('正在处理文件...', 'info', 1500);

    const reader = new FileReader();
    reader.onload = function(e) {
        let content = e.target.result;
        
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }

        const bookName = file.name.replace(/\.txt$/i, '');
        
        const book = {
            id: 'book_' + Date.now(),
            name: bookName,
            cover: null,
            content: content,
            currentPage: 0,
            totalPages: 0,
            addedAt: Date.now()
        };

        book.totalPages = Math.ceil(content.length / readerPageSize);
        bookshelf.unshift(book);
        saveBookshelf();
        renderBookshelf();
        showNotification(`「${bookName}」已添加到书架 ✨`, 'success');
    };
    
    reader.onerror = function() {
        showNotification('文件读取失败，请重试', 'error');
    };

    reader.readAsText(file, 'UTF-8');
}

// 打开阅读器
function openReader(bookId) {
    const book = bookshelf.find(b => b.id === bookId);
    if (!book) return;

    currentReaderBook = book;
    readerIsMinimized = false;

    // 如果书架模态框打开，关闭它
    const bsModal = document.getElementById('bookshelf-modal');
    if (bsModal && bsModal.style.display !== 'none') {
        hideModal(bsModal);
    }

    // 分页
    paginateBook(book);

    // 设置阅读器
    document.getElementById('reader-title').textContent = book.name;
    document.getElementById('reader-content').style.fontSize = readerFontSize + 'px';
    document.getElementById('reader-font-size').textContent = readerFontSize + 'px';

    // 定位到上次阅读位置
    readerCurrentPage = book.currentPage || 0;
    if (readerCurrentPage >= readerPages.length) readerCurrentPage = 0;

    renderCurrentPage();
    updateReaderNav();
    updateReaderProgress();

    // 显示阅读器窗口，隐藏悬浮球
    const readerWindow = document.getElementById('reader-window');
    positionReaderWindow();
    readerWindow.classList.add('visible');
    hideMiniPill();

    // 关闭书架模态框
    hideModal(document.getElementById('bookshelf-modal'));

    // 保存状态
    saveReaderState();
}

// 分页处理
function paginateBook(book) {
    const content = book.content || '';
    readerPages = [];
    
    let start = 0;
    while (start < content.length) {
        let end = start + readerPageSize;
        if (end < content.length) {
            const searchEnd = Math.min(end + 200, content.length);
            const breakPos = content.indexOf('\n', end);
            if (breakPos !== -1 && breakPos < searchEnd) {
                end = breakPos + 1;
            }
        }
        readerPages.push(content.slice(start, Math.min(end, content.length)));
        start = end;
    }

    book.totalPages = readerPages.length;
}

// 渲染当前页
function renderCurrentPage() {
    const contentEl = document.getElementById('reader-content');
    if (!contentEl) return;

    if (readerPages.length === 0) {
        contentEl.textContent = '(无内容)';
        return;
    }

    const pageContent = readerPages[Math.min(readerCurrentPage, readerPages.length - 1)] || '';
    contentEl.textContent = pageContent;
    contentEl.scrollTop = 0;
}

// 更新阅读器导航按钮
function updateReaderNav() {
    const prevBtn = document.getElementById('reader-prev-btn');
    const nextBtn = document.getElementById('reader-next-btn');
    const pageInfo = document.getElementById('reader-page-info');

    if (prevBtn) prevBtn.disabled = readerCurrentPage <= 0;
    if (nextBtn) nextBtn.disabled = readerCurrentPage >= readerPages.length - 1;
    if (pageInfo) {
        const totalPages = readerPages.length || 1;
        pageInfo.textContent = `第 ${Math.min(readerCurrentPage + 1, totalPages)}/${totalPages} 页`;
    }
}

// 更新进度条
function updateReaderProgress() {
    const progressBar = document.getElementById('reader-progress-bar');
    if (progressBar && readerPages.length > 0) {
        const percent = ((readerCurrentPage + 1) / readerPages.length) * 100;
        progressBar.style.width = percent + '%';
    }
}

// 翻页
function readerNextPage() {
    if (readerCurrentPage < readerPages.length - 1) {
        readerCurrentPage++;
        renderCurrentPage();
        updateReaderNav();
        updateReaderProgress();
        saveReadingProgress();
        updateMiniPill();  // 更新悬浮球信息
    }
}

function readerPrevPage() {
    if (readerCurrentPage > 0) {
        readerCurrentPage--;
        renderCurrentPage();
        updateReaderNav();
        updateReaderProgress();
        saveReadingProgress();
        updateMiniPill();  // 更新悬浮球信息
    }
}

// 保存阅读进度
function saveReadingProgress() {
    if (currentReaderBook) {
        currentReaderBook.currentPage = readerCurrentPage;
        saveBookshelf();
        saveReaderState();
    }
}

// 定位阅读器窗口
function positionReaderWindow() {
    const readerWindow = document.getElementById('reader-window');
    if (!readerWindow) return;

    const w = Math.min(420, window.innerWidth - 40);
    const h = Math.min(560, window.innerHeight - 100);
    const left = Math.max(20, (window.innerWidth - w) / 2);
    const top = Math.max(60, (window.innerHeight - h) / 2);

    readerWindow.style.width = w + 'px';
    readerWindow.style.height = h + 'px';
    readerWindow.style.left = left + 'px';
    readerWindow.style.top = top + 'px';
    readerWindow.style.right = 'auto';
    readerWindow.style.bottom = 'auto';
}

// ==================== 最小化/恢复功能 ====================

// 显示最小化悬浮球
function showMiniPill() {
    const pill = document.getElementById('reader-mini-pill');
    if (pill) {
        pill.classList.add('visible');
        updateMiniPill();
    }
}

// 隐藏最小化悬浮球
function hideMiniPill() {
    const pill = document.getElementById('reader-mini-pill');
    if (pill) {
        pill.classList.remove('visible');
    }
}

// 更新悬浮球信息
function updateMiniPill() {
    if (!currentReaderBook) return;
    
    const titleEl = document.getElementById('reader-mini-title');
    const pageEl = document.getElementById('reader-mini-page');
    
    if (titleEl) {
        titleEl.textContent = currentReaderBook.name;
    }
    if (pageEl) {
        const totalPages = readerPages.length || 1;
        pageEl.textContent = `第 ${Math.min(readerCurrentPage + 1, totalPages)}/${totalPages} 页`;
    }
}

// 关闭阅读器（从悬浮球关闭）
function closeReaderFromPill() {
    if (confirm('确定要关闭阅读器吗？阅读进度已自动保存。')) {
        saveReadingProgress();
        currentReaderBook = null;
        readerPages = [];
        readerIsMinimized = false;
        hideMiniPill();
        
        // 清除阅读器内容
        const readerWindow = document.getElementById('reader-window');
        if (readerWindow) {
            readerWindow.classList.remove('visible');
        }
        document.getElementById('reader-content').textContent = '';
        
        saveReaderState();
    }
}

function closeReader() {
    if (!currentReaderBook) return;
    
    saveReadingProgress();
    
    // 隐藏阅读器窗口
    const readerWindow = document.getElementById('reader-window');
    if (readerWindow) {
        readerWindow.classList.remove('visible');
    }
    
    // 隐藏悬浮球
    hideMiniPill();
    
    // 清除阅读状态
    currentReaderBook = null;
    readerPages = [];
    readerIsMinimized = false;
    
    // 清除阅读器内容
    const contentEl = document.getElementById('reader-content');
    if (contentEl) {
        contentEl.textContent = '';
    }
    document.getElementById('reader-title').textContent = '小说名称';
    
    // 清除持久化状态
    saveReaderState();
    
    showNotification('阅读器已关闭', 'info');
}

function minimizeReader() {
    if (!currentReaderBook) return;
    
    saveReadingProgress();
    
    // 隐藏阅读器窗口
    const readerWindow = document.getElementById('reader-window');
    if (readerWindow) {
        readerWindow.classList.remove('visible');
    }
    
    // 设置为最小化状态
    readerIsMinimized = true;
    
    // 更新并显示悬浮球
    updateMiniPill();
    showMiniPill();
    saveReaderState();
    
    showNotification('阅读器已最小化，点击悬浮球继续阅读', 'success');
}

// 从悬浮球恢复阅读器
function restoreReader() {
    if (!currentReaderBook) return;
    
    readerIsMinimized = false;
    hideMiniPill();

    // 确保阅读器内容已设置
    document.getElementById('reader-title').textContent = currentReaderBook.name;
    document.getElementById('reader-content').style.fontSize = readerFontSize + 'px';
    document.getElementById('reader-font-size').textContent = readerFontSize + 'px';
    
    if (readerCurrentPage >= readerPages.length) readerCurrentPage = 0;
    renderCurrentPage();
    updateReaderNav();
    updateReaderProgress();

    // 显示阅读器窗口
    const readerWindow = document.getElementById('reader-window');
    positionReaderWindow();
    readerWindow.classList.add('visible');
    
    saveReaderState();
}

// 修改书名
function editBookName(bookId) {
    const book = bookshelf.find(b => b.id === bookId);
    if (!book) return;

    const newName = prompt('请输入新书名：', book.name);
    if (newName !== null && newName.trim()) {
        book.name = newName.trim();
        saveBookshelf();
        renderBookshelf();
        
        // 如果正在阅读这本书，更新标题
        if (currentReaderBook && currentReaderBook.id === bookId) {
            document.getElementById('reader-title').textContent = book.name;
            updateMiniPill();
        }
        
        showNotification('书名已更新', 'success');
    }
}

// 更换封面
function changeBookCover(bookId) {
    const book = bookshelf.find(b => b.id === bookId);
    if (!book) return;

    const coverInput = document.getElementById('bs-cover-input');
    if (!coverInput) return;

    coverInput.dataset.bookId = bookId;
    coverInput.click();
}

// 处理封面图片上传
function handleBookCoverUpload(file) {
    const coverInput = document.getElementById('bs-cover-input');
    const bookId = coverInput ? coverInput.dataset.bookId : null;
    if (!bookId || !file) return;

    const book = bookshelf.find(b => b.id === bookId);
    if (!book) return;

    if (file.size > 2 * 1024 * 1024) {
        showNotification('封面图片不能超过 2MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        book.cover = e.target.result;
        saveBookshelf();
        renderBookshelf();
        showNotification('封面已更新 ✨', 'success');
    };
    reader.readAsDataURL(file);

    if (coverInput) {
        coverInput.value = '';
        delete coverInput.dataset.bookId;
    }
}

// 删除书籍
function deleteBook(bookId) {
    if (!confirm('确定要删除这本书吗？此操作不可恢复。')) return;

    bookshelf = bookshelf.filter(b => b.id !== bookId);

    // 如果正在阅读这本书，关闭阅读器
    if (currentReaderBook && currentReaderBook.id === bookId) {
        currentReaderBook = null;
        readerPages = [];
        readerIsMinimized = false;
        hideMiniPill();
        document.getElementById('reader-window')?.classList.remove('visible');
        document.getElementById('reader-content').textContent = '';
        saveReaderState();
    }

    saveBookshelf();
    renderBookshelf();
    showNotification('书籍已删除', 'success');
}

// 阅读器拖拽功能
function initReaderDrag() {
    const readerWindow = document.getElementById('reader-window');
    const header = document.getElementById('reader-header');
    if (!readerWindow || !header) return;

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const onStart = function(e) {
        if (e.target.closest('.reader-header-btn') || e.target.closest('.reader-font-controls')) return;
        
        isDragging = true;
        readerWindow.style.transition = 'none';
        
        const point = e.touches ? e.touches[0] : e;
        const rect = readerWindow.getBoundingClientRect();
        startX = point.clientX;
        startY = point.clientY;
        initialLeft = rect.left;
        initialTop = rect.top;
        
        e.preventDefault();
    };

    const onMove = function(e) {
        if (!isDragging) return;
        
        const point = e.touches ? e.touches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;
        
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;
        
        const maxLeft = window.innerWidth - readerWindow.offsetWidth;
        const maxTop = window.innerHeight - readerWindow.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        readerWindow.style.left = newLeft + 'px';
        readerWindow.style.top = newTop + 'px';
        readerWindow.style.right = 'auto';
        readerWindow.style.bottom = 'auto';
    };

    const onEnd = function() {
        if (isDragging) {
            isDragging = false;
            readerWindow.style.transition = '';
        }
    };

    header.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    header.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// 初始化悬浮球点击事件
function initMiniPillEvents() {
    const pill = document.getElementById('reader-mini-pill');
    if (!pill) return;

    // 点击悬浮球恢复阅读器
    pill.addEventListener('click', function(e) {
        // 如果点击的是关闭按钮，不触发恢复
        if (e.target.closest('#reader-mini-close-btn')) return;
        restoreReader();
    });

    // 关闭按钮
    const closeBtn = document.getElementById('reader-mini-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeReaderFromPill();
        });
    }

    // 禁止拖拽时触发点击
    let hasMoved = false;
    let startX, startY;

    pill.addEventListener('pointerdown', function(e) {
        if (e.target.closest('#reader-mini-close-btn')) return;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
    });

    pill.addEventListener('pointermove', function(e) {
        if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
            hasMoved = true;
        }
    });

    pill.addEventListener('pointerup', function(e) {
        // 如果移动了就不触发点击
        if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// 初始化书架功能
function initBookshelf() {
    // 高级功能入口
    const entryBtn = document.getElementById('bookshelf-function');
    if (entryBtn) {
        entryBtn.addEventListener('click', async () => {
            if (DOMElements.advancedModal && DOMElements.advancedModal.modal) {
                hideModal(DOMElements.advancedModal.modal);
            }
            await loadBookshelf();
            renderBookshelf();
            showModal(document.getElementById('bookshelf-modal'));
        });
    }

    // 关闭书架按钮
    const closeBtn = document.getElementById('close-bookshelf');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideModal(document.getElementById('bookshelf-modal'));
        });
    }

    // 导入按钮
    const importBtn = document.getElementById('bs-import-btn');
    const txtInput = document.getElementById('bs-txt-input');
    if (importBtn && txtInput) {
        importBtn.addEventListener('click', () => txtInput.click());
        txtInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importBook(file);
                e.target.value = '';
            }
        });
    }

    // 封面上传
    const coverInput = document.getElementById('bs-cover-input');
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleBookCoverUpload(file);
            }
        });
    }

   // 阅读器控制按钮 - 修正的事件绑定
document.getElementById('reader-prev-btn')?.addEventListener('click', readerPrevPage);
document.getElementById('reader-next-btn')?.addEventListener('click', readerNextPage);

// 【重要】关闭按钮 → 完全关闭
document.getElementById('reader-close-btn')?.addEventListener('click', () => {
    closeReader();  // 完全关闭，不显示悬浮球
});

// 【重要】最小化按钮 → 缩成悬浮球
document.getElementById('reader-minimize-btn')?.addEventListener('click', () => {
    minimizeReader();  // 最小化，显示悬浮球
});

    // 字体大小调整
    document.getElementById('reader-font-plus')?.addEventListener('click', () => {
        if (readerFontSize < 24) {
            readerFontSize += 2;
            document.getElementById('reader-content').style.fontSize = readerFontSize + 'px';
            document.getElementById('reader-font-size').textContent = readerFontSize + 'px';
            if (currentReaderBook) {
                readerPageSize = Math.round(800 * (15 / readerFontSize));
                paginateBook(currentReaderBook);
                if (readerCurrentPage >= readerPages.length) readerCurrentPage = 0;
                renderCurrentPage();
                updateReaderNav();
                updateReaderProgress();
            }
        }
    });

    document.getElementById('reader-font-minus')?.addEventListener('click', () => {
        if (readerFontSize > 10) {
            readerFontSize -= 2;
            document.getElementById('reader-content').style.fontSize = readerFontSize + 'px';
            document.getElementById('reader-font-size').textContent = readerFontSize + 'px';
            if (currentReaderBook) {
                readerPageSize = Math.round(800 * (15 / readerFontSize));
                paginateBook(currentReaderBook);
                if (readerCurrentPage >= readerPages.length) readerCurrentPage = 0;
                renderCurrentPage();
                updateReaderNav();
                updateReaderProgress();
            }
        }
    });

    // 键盘翻页
    document.addEventListener('keydown', (e) => {
        const readerWindow = document.getElementById('reader-window');
        if (!readerWindow || !readerWindow.classList.contains('visible')) return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            readerNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            readerPrevPage();
        } else if (e.key === 'Escape') {
            closeReader();
        }
    });

    // 初始化拖拽
    initReaderDrag();
    
    // 初始化悬浮球事件
    initMiniPillEvents();

    // 页面加载时恢复阅读器状态
    loadBookshelf().then(() => {
        // 状态已在 loadBookshelf -> restoreReaderState 中恢复
    });
}

// 在DOMContentLoaded中初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initBookshelf, 600);
});
