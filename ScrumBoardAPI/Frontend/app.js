// ========================================
// برنامه تخته‌ی اسکراب - نسخه حرفه‌ای
// Scrum Board Frontend Application v1.0
// ========================================

// تنظیمات API
const API_BASE_URL = 'https://localhost:7125/api';

// وضعیت برنامه
const appState = {
    boards: [],
    selectedBoardId: null,
    columns: [],
    tasks: {},
    currentColumnForTask: null,
    currentTaskId: null,
    filters: {
        priority: '',
        assignee: '',
        status: '',
        overdue: false
    },
    settings: {
        theme: localStorage.getItem('theme') || 'dark',
        showCompleted: JSON.parse(localStorage.getItem('showCompleted') ?? 'true'),
        autoRefresh: JSON.parse(localStorage.getItem('autoRefresh') ?? 'true')
    }
};

// موادال
const modals = {
    addBoard: document.getElementById('addBoardModal'),
    addColumn: document.getElementById('addColumnModal'),
    addTask: document.getElementById('addTaskModal'),
    editTask: document.getElementById('editTaskModal'),
    settings: document.getElementById('settingsModal'),
    stats: document.getElementById('statsModal'),
    filter: document.getElementById('filterModal')
};

// ========================================
// توابع معرفی شده
// ========================================

/**
 * تابع محافظ برای fetch API
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`خطا در API: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('خطای API:', error);
        showNotification(`خطا: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * نمایش اعلان Toast
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');

    text.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3500);
}

/**
 * تبدیل تاریخ به رشته‌ی خوانای فارسی
 */
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const persianMonths = ['ژانویه', 'فوریه', 'مارس', 'آپریل', 'مه', 'ژوئن', 'ژوئیه', 'اگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];
    return `${date.getDate()} ${persianMonths[date.getMonth()]}`;
}

/**
 * بررسی آیا تاریخ سررسید گذشته است
 */
function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && true;
}

/**
 * باز کردن موادال
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * بستن موادال
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * پاک کردن فرم
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }
}

/**
 * محافظت در برابر XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// مدیریت تخته‌ها
// ========================================

/**
 * حذف تخته
 */
async function deleteBoard(boardId) {
    if (!confirm('آیا مطمئن هستید؟ این عمل برگشت‌ناپذیر است!')) {
        return;
    }
    try {
        await fetchAPI(`/boards/${boardId}`, { method: 'DELETE' });
        showNotification('تخته با موفقیت حذف شد! ✅', 'success');
        // اگر حذف شد، اگر همان تخته انتخاب شده بود، selection را پاک کنیم
        if (appState.selectedBoardId === boardId) {
            appState.selectedBoardId = null;
            document.getElementById('selectedBoardName').textContent = 'انتخاب یک تخته';
            document.getElementById('selectedBoardDesc').textContent = '';
            document.getElementById('columnsContainer').innerHTML = '';
            updateStats();
        }
        await loadBoards();
    } catch (error) {
        console.error('خطا در حذف تخته:', error);
    }
}

/**
 * بارگیری تمام تخته‌ها
 */
async function loadBoards() {
    try {
        appState.boards = await fetchAPI('/boards');
        renderBoardsList();
    } catch (error) {
        console.error('خطا در بارگیری تخته‌ها:', error);
    }
}

/**
 * نمایش تخته‌ها در sidebar
 */
function renderBoardsList() {
    const container = document.getElementById('boardsList');
    container.innerHTML = '';

    if (appState.boards.length === 0) {
        container.innerHTML = '<p style="color: var(--text-tertiary); padding: 20px; text-align: center; font-size: 13px;">هنوز تخته‌ای ایجاد نشده است</p>';
        return;
    }

    appState.boards.forEach(board => {
        const boardElement = document.createElement('div');
        boardElement.className = `board-item ${board.id === appState.selectedBoardId ? 'active' : ''}`;
        boardElement.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
                <div class="board-item-info">
                    <div class="board-item-title">${escapeHtml(board.title)}</div>
                    <div class="board-item-desc">${board.description ? escapeHtml(board.description) : 'بدون توضیح'}</div>
                </div>
                <button class="btn btn-outline" title="حذف تخته" onclick="event.stopPropagation(); deleteBoard(${board.id})" style="margin-left:8px;">🗑️</button>
            </div>`;
        boardElement.addEventListener('click', () => selectBoard(board.id));
        container.appendChild(boardElement);
    });
}

/**
 * انتخاب تخته
 */
async function selectBoard(boardId) {
    appState.selectedBoardId = boardId;
    const selectedBoard = appState.boards.find(b => b.id === boardId);

    document.getElementById('selectedBoardName').textContent = selectedBoard.title;
    document.getElementById('selectedBoardDesc').textContent = selectedBoard.description || '';

    await loadColumns();
    renderBoardsList();
    updateStats();
}

/**
 * ایجاد تخته جدید
 */
async function createBoard() {
    const title = document.getElementById('boardTitle').value.trim();
    const description = document.getElementById('boardDescription').value.trim();

    if (!title) {
        showNotification('لطفاً نام تخته را وارد کنید', 'error');
        return;
    }

    try {
        const newBoard = await fetchAPI('/boards', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
        });

        showNotification('تخته جدید با موفقیت ایجاد شد! ✅', 'success');
        closeModal('addBoardModal');
        clearForm('boardTitle');
        await loadBoards();
        selectBoard(newBoard.id);
    } catch (error) {
        console.error('خطا در ایجاد تخته:', error);
    }
}

// ========================================
// مدیریت ستون‌ها
// ========================================

/**
 * بارگیری ستون‌های تخته
 */
async function loadColumns() {
    if (!appState.selectedBoardId) return;

    try {
        appState.columns = await fetchAPI(`/columns/board/${appState.selectedBoardId}`);
        await loadAllTasks();
        renderColumns();
    } catch (error) {
        console.error('خطا در بارگیری ستون‌ها:', error);
    }
}

/**
 * بارگیری تمام تسک‌ها
 */
async function loadAllTasks() {
    appState.tasks = {};

    for (const column of appState.columns) {
        try {
            const tasks = await fetchAPI(`/taskcards/column/${column.id}`);
            appState.tasks[column.id] = tasks || [];
        } catch (error) {
            console.error(`خطا در بارگیری تسک‌های ستون ${column.id}:`, error);
            appState.tasks[column.id] = [];
        }
    }
}

/**
 * نمایش ستون‌ها و تسک‌ها
 */
function renderColumns() {
    const container = document.getElementById('columnsContainer');
    container.innerHTML = '';

    if (!appState.selectedBoardId) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📌</div>
                <p class="empty-text">یک تخته انتخاب کنید تا شروع کنید</p>
            </div>
        `;
        return;
    }

    if (appState.columns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p class="empty-text">ستونی وجود ندارد. یکی ایجاد کنید!</p>
            </div>
        `;
        return;
    }

    const sortedColumns = [...appState.columns].sort((a, b) => a.position - b.position);

    sortedColumns.forEach(column => {
        const columnElement = createColumnElement(column);
        container.appendChild(columnElement);
    });

    initializeDragListeners();
}

/**
 * ایجاد عنصر ستون
 */
function createColumnElement(column) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column';
    columnDiv.dataset.columnId = column.id;

    const tasks = (appState.tasks[column.id] || []).filter(task => {
        // اعمال فیلتر
        if (appState.filters.priority && task.priority !== appState.filters.priority) return false;
        if (appState.filters.assignee && task.assignee !== appState.filters.assignee) return false;
        if (appState.filters.overdue && !isOverdue(task.dueDate)) return false;
        return true;
    });

    const tasksHtml = tasks.map(task => createTaskElement(task)).join('');

    columnDiv.innerHTML = `
        <div class="column-header">
            <div class="column-title-section">
                <div class="column-title">${escapeHtml(column.title)}</div>
                <span class="column-count">${tasks.length}</span>
            </div>
            <div class="column-actions">
                <button class="btn-icon-only" title="افزودن تسک" onclick="openAddTaskModal(${column.id})">➕</button>
                <button class="btn-icon-only" title="حذف ستون" onclick="deleteColumn(${column.id})">🗑️</button>
            </div>
        </div>
        <div class="tasks-list" data-column-id="${column.id}">
            ${tasksHtml || '<div style="color: var(--text-muted); text-align: center; padding: 20px; font-size: 12px;">هنوز تسکی نیست</div>'}
        </div>
    `;

    const tasksList = columnDiv.querySelector('.tasks-list');
    setupDropZone(tasksList);

    return columnDiv;
}

/**
 * ایجاد عنصر تسک
 */
function createTaskElement(task) {
    const dueDateStr = task.dueDate ? formatDate(task.dueDate) : null;
    const isOverdueTask = task.dueDate && isOverdue(task.dueDate);

    return `
        <div class="task-card" draggable="true" data-task-id="${task.id}">
            <div class="task-card-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-priority priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            ${task.assignee ? `<div class="task-assignee">👤 ${escapeHtml(task.assignee)}</div>` : ''}
            <div class="task-meta">
                <div class="task-due-date ${isOverdueTask ? 'overdue' : ''}">
                    ${dueDateStr ? `📅 ${dueDateStr}` : ''}
                </div>
                <div class="task-estimate">
                    ${task.estimate ? `⏱️ ${task.estimate}س` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn" title="ویرایش" onclick="openEditTaskModal(${task.id})">✏️</button>
                <button class="task-btn" title="حذف" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        </div>
    `;
}

/**
 * ترجمه اولویت
 */
function getPriorityLabel(priority) {
    const labels = {
        'Low': 'کم',
        'Medium': 'متوسط',
        'High': 'بالا',
        'Critical': 'بسیار'
    };
    return labels[priority] || priority;
}

/**
 * ایجاد ستون جدید
 */
async function createColumn() {
    if (!appState.selectedBoardId) {
        showNotification('لطفاً ابتدا یک تخته انتخاب کنید', 'error');
        return;
    }

    const title = document.getElementById('columnTitle').value.trim();
    const position = parseInt(document.getElementById('columnPosition').value) || 0;

    if (!title) {
        showNotification('لطفاً نام ستون را وارد کنید', 'error');
        return;
    }

    try {
        await fetchAPI('/columns', {
            method: 'POST',
            body: JSON.stringify({
                title,
                position,
                boardId: appState.selectedBoardId,
            }),
        });

        showNotification('ستون جدید با موفقیت ایجاد شد! ✅', 'success');
        closeModal('addColumnModal');
        clearForm('columnTitle');
        await loadColumns();
    } catch (error) {
        console.error('خطا در ایجاد ستون:', error);
    }
}

/**
 * حذف ستون
 */
async function deleteColumn(columnId) {
    if (!confirm('آیا مطمئن هستید؟ این عمل برگشت‌ناپذیر است!')) {
        return;
    }

    try {
        await fetchAPI(`/columns/${columnId}`, { method: 'DELETE' });
        showNotification('ستون با موفقیت حذف شد! ✅', 'success');
        await loadColumns();
    } catch (error) {
        console.error('خطا در حذف ستون:', error);
    }
}

// ========================================
// مدیریت تسک‌ها
// ========================================

/**
 * باز کردن موادال افزودن تسک
 */
function openAddTaskModal(columnId) {
    appState.currentColumnForTask = columnId;
    clearForm('addTaskModal');
    document.getElementById('taskPriority').value = 'Medium';
    openModal('addTaskModal');
}

/**
 * ایجاد تسک جدید
 */
async function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const assignee = document.getElementById('taskAssignee').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const estimate = parseFloat(document.getElementById('taskEstimate').value) || 0;

    if (!title) {
        showNotification('لطفاً عنوان تسک را وارد کنید', 'error');
        return;
    }

    if (!appState.currentColumnForTask) {
        showNotification('ستونی انتخاب نشده است', 'error');
        return;
    }

    try {
        await fetchAPI('/taskcards', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description,
                priority,
                dueDate: dueDate || null,
                columnId: appState.currentColumnForTask,
                assignee,
                estimate
            }),
        });

        showNotification('تسک جدید با موفقیت ایجاد شد! ✅', 'success');
        closeModal('addTaskModal');
        await loadAllTasks();
        renderColumns();
        updateStats();
    } catch (error) {
        console.error('خطا در ایجاد تسک:', error);
    }
}

/**
 * باز کردن موادال ویرایش تسک
 */
function openEditTaskModal(taskId) {
    const task = findTaskById(taskId);
    if (!task) return;

    appState.currentTaskId = taskId;

    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';
    document.getElementById('editTaskAssignee').value = task.assignee || '';
    document.getElementById('editTaskEstimate').value = task.estimate || 0;

    openModal('editTaskModal');
}

/**
 * به‌روزرسانی تسک
 */
async function updateTask() {
    const taskId = appState.currentTaskId;
    const task = findTaskById(taskId);
    if (!task) return;

    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDescription').value.trim();
    const priority = document.getElementById('editTaskPriority').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    const assignee = document.getElementById('editTaskAssignee').value.trim();
    const estimate = parseFloat(document.getElementById('editTaskEstimate').value) || 0;

    if (!title) {
        showNotification('لطفاً عنوان تسک را وارد کنید', 'error');
        return;
    }

    try {
        await fetchAPI(`/taskcards/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title,
                description,
                priority,
                dueDate: dueDate || null,
                columnId: task.columnId,
                assignee,
                estimate
            }),
        });

        showNotification('تسک با موفقیت به‌روزرسانی شد! ✅', 'success');
        closeModal('editTaskModal');
        await loadAllTasks();
        renderColumns();
        updateStats();
    } catch (error) {
        console.error('خطا در به‌روزرسانی تسک:', error);
    }
}

/**
 * حذف تسک
 */
async function deleteTask(taskId) {
    if (!confirm('آیا مطمئن هستید؟')) {
        return;
    }

    try {
        await fetchAPI(`/taskcards/${taskId}`, { method: 'DELETE' });
        showNotification('تسک با موفقیت حذف شد! ✅', 'success');
        closeModal('editTaskModal');
        await loadAllTasks();
        renderColumns();
        updateStats();
    } catch (error) {
        console.error('خطا در حذف تسک:', error);
    }
}

/**
 * جستجو تسک توسط ID
 */
function findTaskById(taskId) {
    for (const columnId in appState.tasks) {
        const task = appState.tasks[columnId].find(t => t.id === taskId);
        if (task) return task;
    }
    return null;
}

// ========================================
// Drag & Drop
// ========================================

let draggedTaskId = null;
let draggedTaskColumnId = null;

/**
 * تنظیم Drop Zone
 */
function setupDropZone(tasksList) {
    tasksList.addEventListener('dragover', handleDragOver);
    tasksList.addEventListener('drop', handleDrop);
    tasksList.addEventListener('dragleave', handleDragLeave);
}

/**
 * تهیه Drag Listeners
 */
function initializeDragListeners() {
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

/**
 * شروع Drag
 */
function handleDragStart(e) {
    draggedTaskId = parseInt(e.target.closest('.task-card').dataset.taskId);
    draggedTaskColumnId = parseInt(e.target.closest('.tasks-list').dataset.columnId);
    e.target.closest('.task-card').classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * پایان Drag
 */
function handleDragEnd(e) {
    e.target.closest('.task-card')?.classList.remove('dragging');
    document.querySelectorAll('.column.drag-over').forEach(col => {
        col.classList.remove('drag-over');
    });
}

/**
 * پروازی روی Drag
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const tasksList = e.target.closest('.tasks-list');
    if (tasksList) {
        tasksList.closest('.column').classList.add('drag-over');
    }
}

/**
 * ترک Drag
 */
function handleDragLeave(e) {
    if (!e.target.closest('.tasks-list')?.contains(e.relatedTarget)) {
        e.target.closest('.column')?.classList.remove('drag-over');
    }
}

/**
 * افت (Drop)
 */
async function handleDrop(e) {
    e.preventDefault();
    const tasksList = e.target.closest('.tasks-list');
    if (!tasksList) return;

    tasksList.closest('.column').classList.remove('drag-over');

    const targetColumnId = parseInt(tasksList.dataset.columnId);

    if (draggedTaskId === null) return;

    const task = findTaskById(draggedTaskId);
    if (!task) return;

    if (targetColumnId !== draggedTaskColumnId) {
        try {
            await fetchAPI(`/taskcards/${draggedTaskId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    columnId: targetColumnId,
                    assignee: task.assignee,
                    estimate: task.estimate
                }),
            });

            showNotification('تسک با موفقیت منتقل شد! ✅', 'success');
            await loadAllTasks();
            renderColumns();
            updateStats();
        } catch (error) {
            console.error('خطا در منتقل کردن تسک:', error);
        }
    }

    draggedTaskId = null;
    draggedTaskColumnId = null;
}

// ========================================
// آمار و نمودار
// ========================================

/**
 * به‌روزرسانی آمار
 */
function updateStats() {
    const allTasks = Object.values(appState.tasks).flat();

    const totalTasks = allTasks.length;
    const inProgressCount = allTasks.filter(t => t.columnId === appState.selectedBoardId).length;
    const completedCount = allTasks.filter(t => t.columnId).length;
    const highPriorityCount = allTasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;

    document.getElementById('totalTasksCount').textContent = totalTasks;
    document.getElementById('inProgressCount').textContent = inProgressCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('highPriorityCount').textContent = highPriorityCount;

    // آمار موادال
    document.getElementById('statsTotalTasks').textContent = totalTasks;
    document.getElementById('statsInProgress').textContent = inProgressCount;
    document.getElementById('statsCompleted').textContent = completedCount;
    document.getElementById('statsHighPriority').textContent = highPriorityCount;

    // توزیع اولویت
    const lowCount = allTasks.filter(t => t.priority === 'Low').length;
    const mediumCount = allTasks.filter(t => t.priority === 'Medium').length;
    const highCount = allTasks.filter(t => t.priority === 'High').length;
    const criticalCount = allTasks.filter(t => t.priority === 'Critical').length;

    const totalForPercentage = lowCount + mediumCount + highCount + criticalCount;
    if (totalForPercentage > 0) {
        document.getElementById('priorityLow').style.width = `${(lowCount / totalForPercentage) * 100}%`;
        document.getElementById('priorityMedium').style.width = `${(mediumCount / totalForPercentage) * 100}%`;
        document.getElementById('priorityHigh').style.width = `${(highCount / totalForPercentage) * 100}%`;
        document.getElementById('priorityCritical').style.width = `${(criticalCount / totalForPercentage) * 100}%`;
    }
}

/**
 * اعمال فیلتر
 */
function applyFilters() {
    appState.filters.priority = document.getElementById('filterPriority').value;
    appState.filters.assignee = document.getElementById('filterAssignee').value;
    appState.filters.status = document.getElementById('filterStatus').value;
    appState.filters.overdue = document.getElementById('filterOverdue').checked;

    renderColumns();
    closeModal('filterModal');
    showNotification('فیلتر‌ها اعمال شد! ✅', 'success');
}

/**
 * بازنشانی فیلتر
 */
function resetFilters() {
    appState.filters = {
        priority: '',
        assignee: '',
        status: '',
        overdue: false
    };
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterAssignee').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterOverdue').checked = false;
    renderColumns();
    showNotification('فیلتر‌ها بازنشانی شدند! ✅', 'success');
}

// ========================================
// تنظیمات
// ========================================

/**
 * ذخیره تنظیمات
 */
function saveSettings() {
    appState.settings.theme = document.getElementById('themeSelect').value;
    appState.settings.showCompleted = document.getElementById('showCompleted').checked;
    appState.settings.autoRefresh = document.getElementById('autoRefresh').checked;

    localStorage.setItem('theme', appState.settings.theme);
    localStorage.setItem('showCompleted', appState.settings.showCompleted);
    localStorage.setItem('autoRefresh', appState.settings.autoRefresh);

    applyTheme();
    showNotification('تنظیمات ذخیره شدند! ✅', 'success');
    closeModal('settingsModal');
}

/**
 * اعمال تم
 */
function applyTheme() {
    const theme = appState.settings.theme;
    if (theme === 'light') {
        document.body.style.filter = 'invert(0.95)';
    } else {
        document.body.style.filter = 'none';
    }
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // دکمه‌های Board
    document.getElementById('addBoardBtn').addEventListener('click', () => openModal('addBoardModal'));
    document.getElementById('createBoardBtn').addEventListener('click', createBoard);

    // دکمه‌های Column
    document.getElementById('addColumnBtn').addEventListener('click', () => {
        if (!appState.selectedBoardId) {
            showNotification('لطفاً ابتدا یک تخته انتخاب کنید', 'error');
            return;
        }
        openModal('addColumnModal');
    });
    document.getElementById('createColumnBtn').addEventListener('click', createColumn);

    // دکمه‌های Task
    document.getElementById('createTaskBtn').addEventListener('click', createTask);
    document.getElementById('updateTaskBtn').addEventListener('click', updateTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', () => {
        if (appState.currentTaskId) {
            deleteTask(appState.currentTaskId);
        }
    });

    // دکمه‌های تنظیمات و آمار
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('themeSelect').value = appState.settings.theme;
        document.getElementById('showCompleted').checked = appState.settings.showCompleted;
        document.getElementById('autoRefresh').checked = appState.settings.autoRefresh;
        openModal('settingsModal');
    });

    document.getElementById('statsBtn').addEventListener('click', () => {
        updateStats();
        openModal('statsModal');
    });

    document.getElementById('filterBtn').addEventListener('click', () => openModal('filterModal'));
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);

    // بستن موادال
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal;
            closeModal(modalId);
        });
    });

    // بستن موادال با کلیک پس‌زمینه
    Object.values(modals).forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // دکمه‌های Cancel
    document.querySelectorAll('.modal-footer .btn-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // جستجو در تخته‌ها
    const boardSearchInput = document.getElementById('boardSearchInput');
    boardSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.board-item').forEach(item => {
            const title = item.querySelector('.board-item-title').textContent.toLowerCase();
            item.style.display = title.includes(query) ? 'block' : 'none';
        });
    });
}

// ========================================
// Initialization
// ========================================

async function initializeApp() {
    console.log('🚀 برنامه تخته‌ی اسکراب در حال شروع...');
    await loadBoards();
    setupEventListeners();
    applyTheme();

    // Auto-refresh اگر فعال باشد
    if (appState.settings.autoRefresh) {
        setInterval(() => {
            if (appState.selectedBoardId) {
                loadColumns();
            }
        }, 30000); // هر ۳۰ ثانیه
    }
}

// شروع برنامه
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// مراقب تغییرات DOMبرای Drag & Drop
const observer = new MutationObserver(() => {
    initializeDragListeners();
});

observer.observe(document.getElementById('columnsContainer'), {
    childList: true,
    subtree: true,
});
