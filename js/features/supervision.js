/* ============================================
 * 监督功能 - 待办提醒 + 催语字卡库
 * 温柔宠溺风格的待办监督小助手
 * ============================================ */

(function() {
  'use strict';

  // ==================== 预设催语字卡库 ====================
  const DEFAULT_URGE_WORDS = [
    '宝宝呀，我们是不是该做这件事情了？',
    '乖，去把这件事做完好不好～',
    '快点做完就能来陪我了哦',
    '再拖下去我可要生气啦',
    '我陪着你，我们一起完成好不好',
    '做完这件事，奖励你一个抱抱～',
    '别刷手机啦，快去做事',
    '你可以的，我相信你',
    '一点点来，先做五分钟',
    '做完我们一起去玩好不好',
    '宝贝，该动起来咯',
    '我知道你很累，但再坚持一下下嘛',
    '不许偷懒哦，我在看着你呢',
    '乖宝宝，把待办清一清好不好',
    '我等你做完哦，不急但要做呀',
    '摸摸头，去做事吧，我陪着你',
    '再拖的话，今晚可要罚你哦',
    '听话，先把这件事做完再说',
    '宝宝最棒了，一定可以做完的',
    '来，我们一起加油好不好'
  ];

  // ==================== 预设夸夸的话 ====================
  const DEFAULT_PRAISE_WORDS = [
    '宝宝今天也超棒的！',
    '你怎么这么厉害呀',
    '我家宝宝最棒了',
    '看到你努力的样子，我好心疼也好骄傲',
    '你真的已经做得很好了',
    '抱抱我的宝贝，辛苦啦',
    '你认真的样子真好看',
    '我怎么这么喜欢你呀',
    '你已经很棒了，别太逼自己哦',
    '不管怎么样我都陪着你',
    '你笑起来的时候，整个世界都亮了',
    '能遇到你真是太好了',
    '你是我见过最努力的人',
    '累了就歇会儿，我陪着你',
    '你值得所有最好的',
    '有你在真好',
    '你做得比你想象的要好得多',
    '我一直都在，不用怕',
    '你超级可爱的知不知道',
    '今天也超级喜欢你呀'
  ];

  // ==================== 数据结构 ====================
  let supervisionData = {
    todos: [],          // 待办列表 [{id, text, done, createdAt}]
    urgeWords: [],      // 催语字卡库
    praiseWords: [],    // 夸夸字卡库
    remindRecords: [],  // 催促/夸奖记录 [{id, text, todoText, todoId, type, timestamp}]
    remindEnabled: true, // 提醒开关
    lastRemindTime: 0   // 上次提醒时间
  };

  // 当前状态
  let currentTab = 'todos'; // todos / urges / words
  let currentFilterTodoId = null; // 当前筛选的待办ID（查看某个待办的历史时）

  // ==================== 工具函数 ====================
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function generateId() {
    return 'sv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
  }

  // ==================== 数据加载与保存 ====================
  function loadData() {
    try {
      const saved = localStorage.getItem('supervision_data');
      if (saved) {
        const data = JSON.parse(saved);
        supervisionData.todos = data.todos || [];
        supervisionData.urgeWords = data.urgeWords && data.urgeWords.length > 0
          ? data.urgeWords : [...DEFAULT_URGE_WORDS];
        supervisionData.praiseWords = data.praiseWords && data.praiseWords.length > 0
          ? data.praiseWords : [...DEFAULT_PRAISE_WORDS];
        supervisionData.remindRecords = data.remindRecords || [];
        supervisionData.remindEnabled = data.remindEnabled !== false;
        supervisionData.lastRemindTime = data.lastRemindTime || 0;
      } else {
        supervisionData.todos = [];
        supervisionData.urgeWords = [...DEFAULT_URGE_WORDS];
        supervisionData.praiseWords = [...DEFAULT_PRAISE_WORDS];
        supervisionData.remindRecords = [];
        supervisionData.remindEnabled = true;
        supervisionData.lastRemindTime = 0;
        saveData();
      }
    } catch (e) {
      console.error('加载监督数据失败:', e);
      supervisionData.todos = [];
      supervisionData.urgeWords = [...DEFAULT_URGE_WORDS];
      supervisionData.praiseWords = [...DEFAULT_PRAISE_WORDS];
      supervisionData.remindRecords = [];
      supervisionData.remindEnabled = true;
      supervisionData.lastRemindTime = 0;
    }
  }

  function saveData() {
    try {
      localStorage.setItem('supervision_data', JSON.stringify(supervisionData));
    } catch (e) {
      console.error('保存监督数据失败:', e);
    }
  }

  // ==================== 待办增删改查 ====================
  function addTodo(text) {
    if (!text || !text.trim()) return false;
    const todo = {
      id: generateId(),
      text: text.trim(),
      done: false,
      createdAt: Date.now()
    };
    supervisionData.todos.unshift(todo);
    saveData();
    return todo;
  }

  function toggleTodo(id) {
    const todo = supervisionData.todos.find(t => t.id === id);
    if (!todo) return false;
    todo.done = !todo.done;
    saveData();
    return todo;
  }

  function deleteTodo(id) {
    const index = supervisionData.todos.findIndex(t => t.id === id);
    if (index === -1) return false;
    supervisionData.todos.splice(index, 1);
    saveData();
    return true;
  }

  function getPendingTodos() {
    return supervisionData.todos.filter(t => !t.done);
  }

  function getDoneTodos() {
    return supervisionData.todos.filter(t => t.done);
  }

  function getNextPendingTodo() {
    const pending = getPendingTodos();
    return pending.length > 0 ? pending[pending.length - 1] : null;
  }

  // ==================== 催语库增删 ====================
  function addUrgeWord(text) {
    if (!text || !text.trim()) return false;
    const word = text.trim();
    if (supervisionData.urgeWords.includes(word)) return false;
    supervisionData.urgeWords.push(word);
    saveData();
    return true;
  }

  function deleteUrgeWord(index) {
    if (index < 0 || index >= supervisionData.urgeWords.length) return false;
    supervisionData.urgeWords.splice(index, 1);
    saveData();
    return true;
  }

  function getRandomUrgeWord() {
    if (supervisionData.urgeWords.length === 0) return '宝宝，该做事啦';
    return supervisionData.urgeWords[Math.floor(Math.random() * supervisionData.urgeWords.length)];
  }

  // ==================== 夸夸库 ====================
  function getRandomPraiseWord() {
    if (supervisionData.praiseWords.length === 0) return '宝宝今天也超棒的！';
    return supervisionData.praiseWords[Math.floor(Math.random() * supervisionData.praiseWords.length)];
  }

  // ==================== 催促记录 ====================
  function addRemindRecord(text, todoText, type, todoId) {
    const record = {
      id: generateId(),
      text: text,
      todoText: todoText || '',
      todoId: todoId || '',
      type: type || 'urge', // urge / praise
      timestamp: Date.now()
    };
    supervisionData.remindRecords.unshift(record);
    // 最多保留50条记录
    if (supervisionData.remindRecords.length > 50) {
      supervisionData.remindRecords = supervisionData.remindRecords.slice(0, 50);
    }
    saveData();
    return record;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  }

  // ==================== 提醒逻辑 ====================
  // 他看到就提醒：每次页面可见 / 打开功能时，有一定概率触发
  const REMIND_PROBABILITY = 0.06; // 6% 概率
  const MIN_COOLDOWN = 5 * 60 * 1000; // 最短冷却5分钟，防止刷屏

  function tryTriggerReminder() {
    if (!supervisionData.remindEnabled) return false;

    const nextTodo = getNextPendingTodo();
    if (!nextTodo) return false; // 没有未完成的待办就不提醒

    // 冷却检查
    const now = Date.now();
    if (now - supervisionData.lastRemindTime < MIN_COOLDOWN) return false;

    // 概率判断
    if (Math.random() >= REMIND_PROBABILITY) return false;

    // 触发提醒
    const urgeWord = getRandomUrgeWord();
    const message = urgeWord + '\n\n' + '别忘了：' + nextTodo.text;

    if (typeof window.showNotification === 'function') {
      window.showNotification(message, 'info', 5000);
    }

    // 记录到历史
    addRemindRecord(urgeWord, nextTodo.text, 'urge', nextTodo.id);

    supervisionData.lastRemindTime = now;
    saveData();
    return true;
  }

  function toggleRemind(enabled) {
    supervisionData.remindEnabled = enabled;
    saveData();
  }

  // ==================== 渲染完整界面 ====================
  function renderFullUI() {
    const content = document.getElementById('supervision-content');
    if (!content) return;

    content.innerHTML = `
      <div class="supervision-inner">
        <div class="supervision-tabs">
          <button class="supervision-tab supervision-tab-todos ${currentTab === 'todos' ? 'supervision-tab-active' : ''}" data-tab="todos">
            <i class="fas fa-list-check"></i> 待办
          </button>
          <button class="supervision-tab supervision-tab-urges ${currentTab === 'urges' ? 'supervision-tab-active' : ''}" data-tab="urges">
            <i class="fas fa-heart"></i> 催语库
          </button>
          <button class="supervision-tab supervision-tab-words ${currentTab === 'words' ? 'supervision-tab-active' : ''}" data-tab="words">
            <i class="fas fa-comment-dots"></i> 他的话
          </button>
        </div>
        <div class="supervision-content-area" id="supervision-content-area"></div>
        <div class="supervision-footer">
          <label class="supervision-remind-switch">
            <input type="checkbox" id="supervision-remind-toggle" ${supervisionData.remindEnabled ? 'checked' : ''}>
            <span class="supervision-remind-slider"></span>
            <span class="supervision-remind-label">
              <i class="fas fa-heart"></i> 他的提醒
            </span>
          </label>
          <span class="supervision-interval-hint">看到了就会催你～</span>
        </div>
      </div>
    `;

    // 绑定tab切换
    content.querySelectorAll('.supervision-tab').forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // 绑定提醒开关
    const toggle = document.getElementById('supervision-remind-toggle');
    if (toggle) {
      toggle.onchange = function() {
        toggleRemind(this.checked);
        if (typeof window.showNotification === 'function') {
          window.showNotification(
            this.checked ? '提醒已开启，我会督促你的哦～' : '提醒已关闭，偷懒可别怪我哦',
            'info', 2000
          );
        }
      };
    }

    // 渲染当前 tab 内容
    renderCurrentTab();
  }

  function renderCurrentTab() {
    const container = document.getElementById('supervision-content-area');
    if (!container) return;

    if (currentTab === 'todos') {
      renderTodos(container);
    } else if (currentTab === 'urges') {
      renderUrges(container);
    } else {
      renderWords(container);
    }
  }

  // ==================== 渲染函数 ====================
  function render() {
    renderCurrentTab();
  }

  function renderTodos(container) {
    const pending = getPendingTodos();
    const done = getDoneTodos();

    container.innerHTML = `
      <!-- 添加待办 -->
      <div class="supervision-add-row">
        <input type="text" id="supervision-todo-input" class="supervision-input"
          placeholder="添加一个待办事项..." maxlength="100">
        <button class="supervision-add-btn" onclick="window.SupervisionApp.handleAddTodo()">
          <i class="fas fa-plus"></i> 添加
        </button>
      </div>

      <!-- 未完成待办 -->
      <div class="supervision-todo-section">
        <div class="supervision-section-title">
          <i class="fas fa-circle-dot"></i> 未完成
          <span class="supervision-count-badge">${pending.length}</span>
        </div>
        ${pending.length === 0 ? `
          <div class="supervision-empty">
            <i class="fas fa-seedling"></i>
            <p>暂无待办事项</p>
            <span>添加一个小目标吧～</span>
          </div>
        ` : `
          <div class="supervision-todo-list">
            ${pending.map(todo => renderTodoItem(todo)).join('')}
          </div>
        `}
      </div>

      <!-- 已完成待办 -->
      <div class="supervision-todo-section supervision-done-section">
        <div class="supervision-section-title supervision-done-title" onclick="window.SupervisionApp.toggleDoneSection()">
          <i class="fas fa-check-circle"></i> 已完成
          <span class="supervision-count-badge">${done.length}</span>
          <i class="fas fa-chevron-down supervision-collapse-icon" id="supervision-collapse-icon"></i>
        </div>
        <div class="supervision-done-list" id="supervision-done-list">
          ${done.length === 0 ? `
            <div class="supervision-empty supervision-empty-small">
              <span>还没有完成任何事哦</span>
            </div>
          ` : `
            ${done.map(todo => renderTodoItem(todo)).join('')}
          `}
        </div>
      </div>
    `;

    // 绑定回车添加
    const input = document.getElementById('supervision-todo-input');
    if (input) {
      input.onkeydown = function(e) {
        if (e.key === 'Enter') {
          window.SupervisionApp.handleAddTodo();
        }
      };
    }
  }

  function renderTodoItem(todo) {
    // 已完成的待办，右边显示历史记录按钮；未完成的显示删除按钮
    const rightBtn = todo.done
      ? `<button class="supervision-todo-history" onclick="window.SupervisionApp.handleViewTodoHistory('${todo.id}')" title="查看他催我的记录">
           <i class="fas fa-clock-rotate-left"></i>
         </button>`
      : `<button class="supervision-todo-delete" onclick="window.SupervisionApp.handleDeleteTodo('${todo.id}')">
           <i class="fas fa-trash-can"></i>
         </button>`;

    return `
      <div class="supervision-todo-item ${todo.done ? 'supervision-todo-done' : ''}" data-id="${todo.id}">
        <button class="supervision-todo-check" onclick="window.SupervisionApp.handleToggleTodo('${todo.id}')">
          <i class="fas ${todo.done ? 'fa-check' : 'fa-circle'}"></i>
        </button>
        <span class="supervision-todo-text">${escapeHtml(todo.text)}</span>
        ${rightBtn}
      </div>
    `;
  }

  function renderUrges(container) {
    const words = supervisionData.urgeWords;

    container.innerHTML = `
      <!-- 添加催语 -->
      <div class="supervision-add-row">
        <input type="text" id="supervision-urge-input" class="supervision-input"
          placeholder="添加一句温柔的催语..." maxlength="100">
        <button class="supervision-add-btn" onclick="window.SupervisionApp.handleAddUrge()">
          <i class="fas fa-plus"></i> 添加
        </button>
      </div>

      <div class="supervision-urge-header">
        <div class="supervision-section-title">
          <i class="fas fa-heart"></i> 催语字卡库
          <span class="supervision-count-badge">${words.length}</span>
        </div>
        <button class="supervision-reset-btn" onclick="window.SupervisionApp.handleResetUrges()">
          <i class="fas fa-rotate-left"></i> 恢复预设
        </button>
      </div>

      ${words.length === 0 ? `
        <div class="supervision-empty">
          <i class="fas fa-heart-crack"></i>
          <p>催语库空空的</p>
          <span>加点温柔的话来督促自己吧～</span>
        </div>
      ` : `
        <div class="supervision-urge-list">
          ${words.map((word, index) => `
            <div class="supervision-urge-item">
              <span class="supervision-urge-text">${escapeHtml(word)}</span>
              <button class="supervision-urge-delete" onclick="window.SupervisionApp.handleDeleteUrge(${index})">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `}
    `;

    // 绑定回车添加
    const input = document.getElementById('supervision-urge-input');
    if (input) {
      input.onkeydown = function(e) {
        if (e.key === 'Enter') {
          window.SupervisionApp.handleAddUrge();
        }
      };
    }
  }

  // ==================== 渲染：他的话 ====================
  function renderWords(container) {
    // 如果有筛选条件，只显示该待办的记录
    let records = supervisionData.remindRecords;
    let filterTodo = null;

    if (currentFilterTodoId) {
      filterTodo = supervisionData.todos.find(t => t.id === currentFilterTodoId);
      records = records.filter(r => r.todoId === currentFilterTodoId);
    }

    const hasRecords = records.length > 0;

    if (hasRecords || filterTodo) {
      // 有筛选或有记录时，显示列表
      container.innerHTML = `
        <div class="supervision-words-header">
          <div class="supervision-section-title">
            ${filterTodo ? `
              <i class="fas fa-arrow-left supervision-back-btn" onclick="window.SupervisionApp.handleBackToAllRecords()"></i>
              <span>${escapeHtml(filterTodo.text)}</span>
              <span class="supervision-count-badge">${records.length}</span>
            ` : `
              <i class="fas fa-clock-rotate-left"></i> 他催过我的
              <span class="supervision-count-badge">${records.length}</span>
            `}
          </div>
          ${!filterTodo ? `
            <button class="supervision-reset-btn" onclick="window.SupervisionApp.handleClearRecords()">
              <i class="fas fa-trash-can"></i> 清空
            </button>
          ` : ''}
        </div>
        ${hasRecords ? `
          <div class="supervision-words-list">
            ${records.map(record => `
              <div class="supervision-words-item supervision-words-urge">
                <div class="supervision-words-time">
                  <i class="fas fa-clock"></i> ${formatTime(record.timestamp)}
                </div>
                <div class="supervision-words-text">${escapeHtml(record.text)}</div>
                ${record.todoText && !filterTodo ? `<div class="supervision-words-todo">📝 关于：${escapeHtml(record.todoText)}</div>` : ''}
                <button class="supervision-record-delete" onclick="window.SupervisionApp.handleDeleteRecord('${record.id}')" title="删除这条记录">
                  <i class="fas fa-trash-can"></i>
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="supervision-empty">
            <i class="fas fa-comment-slash"></i>
            <p>这件事他还没催过你</p>
            <span>说不定他正在偷偷心疼你呢～</span>
          </div>
        `}
      `;
    } else {
      // 没有催促记录也没有筛选时，显示夸夸的话
      const praiseWord = getRandomPraiseWord();
      container.innerHTML = `
        <div class="supervision-words-praise">
          <div class="supervision-praise-icon">
            <i class="fas fa-heart"></i>
          </div>
          <div class="supervision-praise-text" id="supervision-praise-text">
            "${praiseWord}"
          </div>
          <div class="supervision-praise-from">—— 他想对你说</div>
          <button class="supervision-praise-btn" onclick="window.SupervisionApp.handleRefreshPraise()">
            <i class="fas fa-rotate"></i> 换一句
          </button>
        </div>
      `;
    }
  }

  // ==================== 事件处理 ====================
  function handleAddTodo() {
    const input = document.getElementById('supervision-todo-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    addTodo(text);
    input.value = '';
    render();

    if (typeof window.showNotification === 'function') {
      window.showNotification('已添加待办，加油哦～', 'success', 1500);
    }
  }

  function handleToggleTodo(id) {
    const todo = toggleTodo(id);
    if (!todo) return;
    render();

    if (typeof window.showNotification === 'function') {
      if (todo.done) {
        window.showNotification('太棒了！又完成了一件事 💕', 'success', 2000);
      } else {
        window.showNotification('已恢复，慢慢来没关系的', 'info', 1500);
      }
    }
  }

  function handleDeleteTodo(id) {
    const todo = supervisionData.todos.find(t => t.id === id);
    if (!todo) return;
    if (!confirm('确定要删除这个待办吗？')) return;

    deleteTodo(id);
    render();

    if (typeof window.showNotification === 'function') {
      window.showNotification('已删除', 'info', 1200);
    }
  }

  function handleAddUrge() {
    const input = document.getElementById('supervision-urge-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    if (supervisionData.urgeWords.includes(text)) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('这句话已经有啦~', 'info', 1500);
      }
      return;
    }

    addUrgeWord(text);
    input.value = '';
    render();

    if (typeof window.showNotification === 'function') {
      window.showNotification('添加成功，这话真温柔～', 'success', 1500);
    }
  }

  function handleDeleteUrge(index) {
    if (!confirm('确定要删除这句催语吗？')) return;
    deleteUrgeWord(index);
    render();
  }

  function handleResetUrges() {
    if (!confirm('确定要恢复预设催语吗？\n（自定义的催语会被替换掉哦）')) return;
    supervisionData.urgeWords = [...DEFAULT_URGE_WORDS];
    saveData();
    render();

    if (typeof window.showNotification === 'function') {
      window.showNotification('已恢复预设催语～', 'success', 1500);
    }
  }

  function handleClearRecords() {
    if (!confirm('确定要清空所有催促记录吗？')) return;
    supervisionData.remindRecords = [];
    saveData();
    render();

    if (typeof window.showNotification === 'function') {
      window.showNotification('已清空记录～', 'success', 1500);
    }
  }

  function handleRefreshPraise() {
    const praiseText = document.getElementById('supervision-praise-text');
    if (praiseText) {
      const newWord = getRandomPraiseWord();
      praiseText.style.opacity = '0';
      setTimeout(() => {
        praiseText.textContent = `"${newWord}"`;
        praiseText.style.opacity = '1';
      }, 200);
    }
  }

  function handleViewTodoHistory(todoId) {
    currentFilterTodoId = todoId;
    currentTab = 'words';
    // 更新tab样式
    document.querySelectorAll('.supervision-tab').forEach(btn => {
      btn.classList.toggle('supervision-tab-active', btn.dataset.tab === 'words');
    });
    render();
  }

  function handleBackToAllRecords() {
    currentFilterTodoId = null;
    render();
  }

  function handleDeleteRecord(recordId) {
    if (!confirm('确定要删除这条记录吗？')) return;
    const index = supervisionData.remindRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
      supervisionData.remindRecords.splice(index, 1);
      saveData();
      render();
    }
  }

  function toggleDoneSection() {
    const list = document.getElementById('supervision-done-list');
    const icon = document.getElementById('supervision-collapse-icon');
    if (!list || !icon) return;

    if (list.style.display === 'none') {
      list.style.display = 'block';
      icon.style.transform = 'rotate(0deg)';
    } else {
      list.style.display = 'none';
      icon.style.transform = 'rotate(-90deg)';
    }
  }

  // ==================== Tab 切换 ====================
  function switchTab(tab) {
    currentTab = tab;

    // 更新tab样式
    document.querySelectorAll('.supervision-tab').forEach(btn => {
      btn.classList.toggle('supervision-tab-active', btn.dataset.tab === tab);
    });

    render();
  }

  // ==================== 打开 / 关闭 ====================
  function open() {
    const modal = document.getElementById('supervision-modal');
    if (modal) {
      if (typeof window.showModal === 'function') {
        window.showModal(modal);
      } else if (typeof window.homeShowModal === 'function') {
        window.homeShowModal(modal);
      } else {
        modal.style.display = 'flex';
      }
      currentTab = 'todos';
      currentFilterTodoId = null;
      renderFullUI();
      // 打开时有概率触发他的提醒
      tryTriggerReminder();
    }
  }

  function close() {
    const modal = document.getElementById('supervision-modal');
    if (modal) {
      if (typeof window.hideModal === 'function') {
        window.hideModal(modal);
      } else if (typeof window.homeHideModal === 'function') {
        window.homeHideModal(modal);
      } else {
        modal.style.display = 'none';
      }
    }
  }

  // ==================== 样式注入 ====================
  function injectStyles() {
    if (document.getElementById('supervision-styles')) return;
    const style = document.createElement('style');
    style.id = 'supervision-styles';
    style.textContent = `
      /* 监督内部样式 */
      #supervision-modal .modal-content {
        background: #2a1a2e !important;
        border: 1px solid #4a2d52 !important;
        color: #e8d5e8 !important;
        max-width: 460px !important;
      }
      #supervision-modal .modal-title {
        color: #ffb6c1 !important;
        border-bottom: 1px solid #4a2d52 !important;
      }
      .supervision-inner {
        display: flex;
        flex-direction: column;
        max-height: 70vh;
      }

      /* Tab 切换 */
      .supervision-tabs {
        display: flex;
        gap: 4px;
        background: #3a2240;
        border-radius: 10px;
        padding: 3px;
        margin-bottom: 16px;
        align-self: center;
      }
      .supervision-tab {
        padding: 7px 20px;
        border: none;
        background: transparent;
        color: #b89ac0;
        font-size: 14px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }
      .supervision-tab:hover { color: #e8c8ef; }
      .supervision-tab.supervision-tab-active {
        background: #5d3a66;
        color: #ffb6c1;
        box-shadow: 0 2px 8px rgba(255, 182, 193, 0.2);
      }

      /* 内容区 */
      .supervision-content-area {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }
      .supervision-content::-webkit-scrollbar { width: 6px; }
      .supervision-content::-webkit-scrollbar-track { background: transparent; }
      .supervision-content::-webkit-scrollbar-thumb {
        background: #5d3a66;
        border-radius: 3px;
      }

      /* 底部 */
      .supervision-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: #1f1223;
        border-top: 1px solid #4a2d52;
        flex-shrink: 0;
      }
      .supervision-remind-switch {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        user-select: none;
      }
      .supervision-remind-switch input { display: none; }
      .supervision-remind-slider {
        position: relative;
        width: 40px;
        height: 22px;
        background: #4a2d52;
        border-radius: 11px;
        transition: background 0.3s;
      }
      .supervision-remind-slider::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        background: #b89ac0;
        border-radius: 50%;
        transition: all 0.3s;
      }
      .supervision-remind-switch input:checked + .supervision-remind-slider {
        background: #5d3a66;
      }
      .supervision-remind-switch input:checked + .supervision-remind-slider::before {
        left: 21px;
        background: #ffb6c1;
        box-shadow: 0 0 8px rgba(255, 182, 193, 0.5);
      }
      .supervision-remind-label {
        color: #d4b8dc;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .supervision-remind-label i { color: #ffb6c1; }
      .supervision-interval-hint {
        font-size: 11px;
        color: #8a6e94;
      }

      /* 添加行 */
      .supervision-add-row {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .supervision-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #4a2d52;
        border-radius: 10px;
        font-size: 14px;
        background: #1f1223;
        color: #e8d8ed;
        outline: none;
        transition: border-color 0.2s;
      }
      .supervision-input:focus { border-color: #ffb6c1; }
      .supervision-input::placeholder { color: #7a5e84; }
      .supervision-add-btn {
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, #ffb6c1, #e89ab0);
        color: #2a1a2e;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .supervision-add-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
      }
      .supervision-add-btn:active { transform: translateY(0); }

      /* 区块标题 */
      .supervision-section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #e8d8ed;
        margin-bottom: 10px;
      }
      .supervision-section-title i { color: #ffb6c1; font-size: 12px; }
      .supervision-count-badge {
        background: #3a2240;
        color: #ffb6c1;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 500;
      }

      /* 待办区块 */
      .supervision-todo-section {
        margin-bottom: 18px;
      }
      .supervision-todo-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .supervision-todo-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #3a2240;
        border-radius: 10px;
        border: 1px solid #4a2d52;
        transition: all 0.2s;
      }
      .supervision-todo-item:hover {
        border-color: #5d3a66;
        background: #422848;
      }
      .supervision-todo-check {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: #ffb6c1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        transition: transform 0.2s;
      }
      .supervision-todo-check:hover { transform: scale(1.2); }
      .supervision-todo-text {
        flex: 1;
        font-size: 14px;
        color: #e8d8ed;
        line-height: 1.4;
        word-break: break-word;
      }
      .supervision-todo-done .supervision-todo-text {
        text-decoration: line-through;
        color: #7a5e84;
      }
      .supervision-todo-delete {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: #8a6e94;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .supervision-todo-delete:hover {
        background: rgba(255, 100, 100, 0.15);
        color: #ff8a9a;
      }

      /* 待办历史记录按钮 */
      .supervision-todo-history {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: #ffb6c1;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .supervision-todo-history:hover {
        background: rgba(255, 182, 193, 0.15);
        color: #ffc8d0;
        transform: scale(1.1);
      }

      /* 已完成区域 */
      .supervision-done-section { opacity: 0.7; }
      .supervision-done-title {
        cursor: pointer;
        padding: 4px 0;
      }
      .supervision-collapse-icon {
        margin-left: auto;
        font-size: 10px !important;
        color: #8a6e94 !important;
        transition: transform 0.2s;
      }
      .supervision-done-list {
        transition: all 0.3s;
      }
      .supervision-todo-done {
        background: #2a1a2e;
        border-color: #3a2240;
      }

      /* 空状态 */
      .supervision-empty {
        text-align: center;
        padding: 30px 20px;
        color: #8a6e94;
      }
      .supervision-empty i {
        font-size: 36px;
        color: #5d3a66;
        margin-bottom: 12px;
      }
      .supervision-empty p {
        font-size: 14px;
        color: #b89ac0;
        margin: 0 0 4px 0;
      }
      .supervision-empty span {
        font-size: 12px;
        color: #7a5e84;
      }
      .supervision-empty-small { padding: 16px; }
      .supervision-empty-small i { display: none; }
      .supervision-empty-small span { font-size: 12px; }

      /* 催语库 */
      .supervision-urge-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .supervision-urge-header .supervision-section-title {
        margin-bottom: 0;
      }
      .supervision-reset-btn {
        padding: 5px 12px;
        border: 1px solid #4a2d52;
        background: transparent;
        color: #b89ac0;
        font-size: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .supervision-reset-btn:hover {
        border-color: #ffb6c1;
        color: #ffb6c1;
      }
      .supervision-urge-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .supervision-urge-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #3a2240;
        border-radius: 10px;
        border: 1px solid #4a2d52;
        transition: all 0.2s;
      }
      .supervision-urge-item:hover {
        border-color: #5d3a66;
        background: #422848;
      }
      .supervision-urge-text {
        flex: 1;
        font-size: 13px;
        color: #e8d8ed;
        line-height: 1.5;
        word-break: break-word;
      }
      .supervision-urge-delete {
        width: 26px;
        height: 26px;
        border: none;
        background: transparent;
        color: #8a6e94;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .supervision-urge-delete:hover {
        background: rgba(255, 100, 100, 0.15);
        color: #ff8a9a;
      }

      /* 他的话 - 记录列表 */
      .supervision-words-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .supervision-words-header .supervision-section-title {
        margin-bottom: 0;
      }
      .supervision-words-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .supervision-words-item {
        padding: 12px 14px;
        background: #3a2240;
        border-radius: 12px;
        border: 1px solid #4a2d52;
        transition: all 0.2s;
      }
      .supervision-words-item:hover {
        border-color: #5d3a66;
        background: #422848;
      }
      .supervision-words-time {
        font-size: 11px;
        color: #8a6e94;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .supervision-words-time i { font-size: 10px; }
      .supervision-words-text {
        font-size: 14px;
        color: #e8d8ed;
        line-height: 1.5;
        margin-bottom: 6px;
      }
      .supervision-words-todo {
        font-size: 12px;
        color: #b89ac0;
        padding: 4px 8px;
        background: #2a1a2e;
        border-radius: 6px;
        display: inline-block;
      }

      /* 返回按钮 */
      .supervision-back-btn {
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px !important;
      }
      .supervision-back-btn:hover {
        color: #ffb6c1 !important;
        transform: translateX(-2px);
      }

      /* 单条记录删除按钮 */
      .supervision-words-item {
        position: relative;
      }
      .supervision-record-delete {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: #7a5e84;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        opacity: 0;
        transition: all 0.2s;
      }
      .supervision-words-item:hover .supervision-record-delete {
        opacity: 1;
      }
      .supervision-record-delete:hover {
        background: rgba(255, 100, 100, 0.15);
        color: #ff8a9a;
      }

      /* 他的话 - 夸夸状态 */
      .supervision-words-praise {
        text-align: center;
        padding: 30px 20px;
      }
      .supervision-praise-icon {
        font-size: 48px;
        color: #ffb6c1;
        margin-bottom: 20px;
        animation: supervision-pulse 2s ease-in-out infinite;
      }
      @keyframes supervision-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      .supervision-praise-text {
        font-size: 18px;
        color: #ffb6c1;
        line-height: 1.6;
        margin-bottom: 12px;
        font-weight: 500;
        transition: opacity 0.2s;
        font-style: italic;
      }
      .supervision-praise-from {
        font-size: 13px;
        color: #b89ac0;
        margin-bottom: 24px;
      }
      .supervision-praise-btn {
        padding: 8px 20px;
        border: 1px solid #5d3a66;
        background: transparent;
        color: #ffb6c1;
        font-size: 13px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .supervision-praise-btn:hover {
        background: #5d3a66;
        transform: translateY(-1px);
      }
      .supervision-praise-btn:active { transform: translateY(0); }
    `;
    document.head.appendChild(style);
  }

  // ==================== 初始化 ====================
  function init() {
    loadData();
    injectStyles();

    // 页面可见时，有概率触发他的提醒（他看到你了就会催）
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        tryTriggerReminder();
      }
    });
  }

  // ==================== 暴露到全局 ====================
  window.SupervisionApp = {
    open: open,
    close: close,
    init: init,
    switchTab: switchTab,
    handleAddTodo: handleAddTodo,
    handleToggleTodo: handleToggleTodo,
    handleDeleteTodo: handleDeleteTodo,
    handleAddUrge: handleAddUrge,
    handleDeleteUrge: handleDeleteUrge,
    handleResetUrges: handleResetUrges,
    handleClearRecords: handleClearRecords,
    handleRefreshPraise: handleRefreshPraise,
    handleViewTodoHistory: handleViewTodoHistory,
    handleBackToAllRecords: handleBackToAllRecords,
    handleDeleteRecord: handleDeleteRecord,
    toggleDoneSection: toggleDoneSection,
    getData: function() { return supervisionData; }
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
