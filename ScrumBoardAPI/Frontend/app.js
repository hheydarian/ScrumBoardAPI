// ========================================
// Scrum Board Frontend Application
// Modern Kanban Board with Drag & Drop
// ========================================

// API Configuration
const API_BASE_URL = 'https://localhost:7125/api';

// Application State
const appState = {
    boards: [],
    selectedBoardId: null,
    columns: [],
    tasks: {},
    currentColumnForTask: null,
    currentTaskId: null,
};

// Modal Management
const modals = {
    addBoard: document.getElementById('addBoardModal'),
    addColumn: document.getElementById('addColumnModal'),
    addTask: document.getElementById('addTaskModal'),
    editTask: document.getElementById('editTaskModal'),
};

// ========================================
// Utility Functions
// ========================================

/**
 * Fetch wrapper with error handling
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
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        // Handle 204 No Content response
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');

    text.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Clear form inputs
 */
function clearForm(formId) {
    const inputs = document.querySelectorAll(`#${formId} input, #${formId} textarea, #${formId} select`);
    inputs.forEach(input => {
        input.value = '';
    });
}

// ========================================
// Board Management
// ========================================

/**
 * Fetch all boards
 */
async function loadBoards() {
    try {
        appState.boards = await fetchAPI('/boards');
        renderBoardsList();
    } catch (error) {
        console.error('Failed to load boards:', error);
    }
}

/**
 * Render boards in sidebar
 */
function renderBoardsList() {
    const container = document.getElementById('boardsList');
    container.innerHTML = '';

    if (appState.boards.length === 0) {
        container.innerHTML = '<p class="text-muted" style="color: var(--text-tertiary); padding: 20px 0; text-align: center;">No boards yet. Create one to get started!</p>';
        return;
    }

    appState.boards.forEach(board => {
        const boardElement = document.createElement('div');
        boardElement.className = `board-item ${board.id === appState.selectedBoardId ? 'active' : ''}`;
        boardElement.innerHTML = `
            <div class="board-item-title">${escapeHtml(board.title)}</div>
            <div class="board-item-desc">${board.description ? escapeHtml(board.description) : 'No description'}</div>
        `;
        boardElement.addEventListener('click', () => selectBoard(board.id));
        container.appendChild(boardElement);
    });
}

/**
 * Select a board
 */
async function selectBoard(boardId) {
    appState.selectedBoardId = boardId;
    const selectedBoard = appState.boards.find(b => b.id === boardId);

    // Update header
    document.getElementById('selectedBoardName').textContent = selectedBoard.title;
    document.getElementById('selectedBoardDesc').textContent = selectedBoard.description || '';

    // Load columns
    await loadColumns();
    renderBoardsList();
}

/**
 * Create new board
 */
async function createBoard() {
    const title = document.getElementById('boardTitle').value.trim();
    const description = document.getElementById('boardDescription').value.trim();

    if (!title) {
        showNotification('Please enter a board title', 'error');
        return;
    }

    try {
        const newBoard = await fetchAPI('/boards', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
        });

        showNotification('Board created successfully!', 'success');
        closeModal('addBoardModal');
        clearForm('addBoardModal');
        await loadBoards();

        // Select the newly created board
        selectBoard(newBoard.id);
    } catch (error) {
        console.error('Failed to create board:', error);
    }
}

// ========================================
// Column Management
// ========================================

/**
 * Fetch columns for selected board
 */
async function loadColumns() {
    if (!appState.selectedBoardId) return;

    try {
        appState.columns = await fetchAPI(`/columns/board/${appState.selectedBoardId}`);
        await loadAllTasks();
        renderColumns();
    } catch (error) {
        console.error('Failed to load columns:', error);
    }
}

/**
 * Load all tasks for all columns
 */
async function loadAllTasks() {
    appState.tasks = {};

    for (const column of appState.columns) {
        try {
            const tasks = await fetchAPI(`/taskcards/column/${column.id}`);
            appState.tasks[column.id] = tasks;
        } catch (error) {
            console.error(`Failed to load tasks for column ${column.id}:`, error);
            appState.tasks[column.id] = [];
        }
    }
}

/**
 * Render all columns and tasks
 */
function renderColumns() {
    const container = document.getElementById('columnsContainer');
    container.innerHTML = '';

    if (!appState.selectedBoardId) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📌</div>
                <p class="empty-text">Select a board to get started</p>
            </div>
        `;
        return;
    }

    if (appState.columns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <p class="empty-text">No columns yet. Create one to start managing tasks!</p>
            </div>
        `;
        return;
    }

    // Sort columns by position
    const sortedColumns = [...appState.columns].sort((a, b) => a.position - b.position);

    sortedColumns.forEach(column => {
        const columnElement = createColumnElement(column);
        container.appendChild(columnElement);
    });
}

/**
 * Create column DOM element
 */
function createColumnElement(column) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column';
    columnDiv.dataset.columnId = column.id;

    const tasks = appState.tasks[column.id] || [];
    const tasksHtml = tasks.map(task => createTaskElement(task)).join('');

    columnDiv.innerHTML = `
        <div class="column-header">
            <div class="column-title-section">
                <div class="column-title">${escapeHtml(column.title)}</div>
                <span class="column-count">${tasks.length}</span>
            </div>
            <div class="column-actions">
                <button class="btn-icon-only" title="Add task" onclick="openAddTaskModal(${column.id})">
                    ➕
                </button>
                <button class="btn-icon-only" title="Edit column" onclick="editColumn(${column.id})">
                    ✏️
                </button>
                <button class="btn-icon-only" title="Delete column" onclick="deleteColumn(${column.id})">
                    🗑️
                </button>
            </div>
        </div>
        <div class="tasks-list" data-column-id="${column.id}">
            ${tasksHtml || '<div style="color: var(--text-muted); text-align: center; padding: 20px; font-size: 12px;">No tasks yet</div>'}
        </div>
    `;

    // Setup drag and drop
    const tasksList = columnDiv.querySelector('.tasks-list');
    setupDropZone(tasksList);

    return columnDiv;
}

/**
 * Create task card DOM element
 */
function createTaskElement(task) {
    const dueDateStr = task.dueDate ? formatDate(task.dueDate) : null;

    return `
        <div class="task-card" draggable="true" data-task-id="${task.id}">
            <div class="task-card-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <div class="task-due-date">
                    ${dueDateStr ? `📅 ${dueDateStr}` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-btn" title="Edit task" onclick="openEditTaskModal(${task.id})">
                        ✏️
                    </button>
                    <button class="task-btn" title="Delete task" onclick="deleteTask(${task.id})">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create new column
 */
async function createColumn() {
    if (!appState.selectedBoardId) {
        showNotification('Please select a board first', 'error');
        return;
    }

    const title = document.getElementById('columnTitle').value.trim();
    const position = parseInt(document.getElementById('columnPosition').value) || 0;

    if (!title) {
        showNotification('Please enter a column title', 'error');
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

        showNotification('Column created successfully!', 'success');
        closeModal('addColumnModal');
        clearForm('addColumnModal');
        await loadColumns();
    } catch (error) {
        console.error('Failed to create column:', error);
    }
}

/**
 * Edit column (placeholder)
 */
function editColumn(columnId) {
    showNotification('Column editing coming soon!', 'error');
}

/**
 * Delete column
 */
async function deleteColumn(columnId) {
    if (!confirm('Are you sure you want to delete this column and all its tasks?')) {
        return;
    }

    try {
        await fetchAPI(`/columns/${columnId}`, { method: 'DELETE' });
        showNotification('Column deleted successfully!', 'success');
        await loadColumns();
    } catch (error) {
        console.error('Failed to delete column:', error);
    }
}

// ========================================
// Task Management
// ========================================

/**
 * Open add task modal
 */
function openAddTaskModal(columnId) {
    appState.currentColumnForTask = columnId;
    clearForm('addTaskModal');
    openModal('addTaskModal');
}

/**
 * Create new task
 */
async function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    if (!title) {
        showNotification('Please enter a task title', 'error');
        return;
    }

    if (!appState.currentColumnForTask) {
        showNotification('No column selected', 'error');
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
            }),
        });

        showNotification('Task created successfully!', 'success');
        closeModal('addTaskModal');
        clearForm('addTaskModal');
        await loadAllTasks();
        renderColumns();
    } catch (error) {
        console.error('Failed to create task:', error);
    }
}

/**
 * Open edit task modal
 */
function openEditTaskModal(taskId) {
    const task = findTaskById(taskId);
    if (!task) return;

    appState.currentTaskId = taskId;

    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';

    openModal('editTaskModal');
}

/**
 * Update task
 */
async function updateTask() {
    const taskId = appState.currentTaskId;
    const task = findTaskById(taskId);
    if (!task) return;

    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDescription').value.trim();
    const priority = document.getElementById('editTaskPriority').value;
    const dueDate = document.getElementById('editTaskDueDate').value;

    if (!title) {
        showNotification('Please enter a task title', 'error');
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
            }),
        });

        showNotification('Task updated successfully!', 'success');
        closeModal('editTaskModal');
        await loadAllTasks();
        renderColumns();
    } catch (error) {
        console.error('Failed to update task:', error);
    }
}

/**
 * Delete task
 */
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        await fetchAPI(`/taskcards/${taskId}`, { method: 'DELETE' });
        showNotification('Task deleted successfully!', 'success');
        closeModal('editTaskModal');
        await loadAllTasks();
        renderColumns();
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

/**
 * Find task by ID
 */
function findTaskById(taskId) {
    for (const columnId in appState.tasks) {
        const task = appState.tasks[columnId].find(t => t.id === taskId);
        if (task) return task;
    }
    return null;
}

// ========================================
// Drag and Drop Implementation
// ========================================

let draggedTaskId = null;
let draggedTaskColumnId = null;

/**
 * Setup drop zone for tasks list
 */
function setupDropZone(tasksList) {
    tasksList.addEventListener('dragover', handleDragOver);
    tasksList.addEventListener('drop', handleDrop);
    tasksList.addEventListener('dragleave', handleDragLeave);
}

/**
 * Initialize drag listeners for task cards
 */
function initializeDragListeners() {
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
    draggedTaskId = parseInt(e.target.closest('.task-card').dataset.taskId);
    draggedTaskColumnId = parseInt(e.target.closest('.tasks-list').dataset.columnId);
    e.target.closest('.task-card').classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    e.target.closest('.task-card')?.classList.remove('dragging');
    document.querySelectorAll('.column.drag-over').forEach(col => {
        col.classList.remove('drag-over');
    });
}

/**
 * Handle drag over
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
 * Handle drag leave
 */
function handleDragLeave(e) {
    if (!e.target.closest('.tasks-list')?.contains(e.relatedTarget)) {
        e.target.closest('.column')?.classList.remove('drag-over');
    }
}

/**
 * Handle drop
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

    // Only update if moving to a different column
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
                }),
            });

            showNotification('Task moved successfully!', 'success');
            await loadAllTasks();
            renderColumns();
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    }

    draggedTaskId = null;
    draggedTaskColumnId = null;
}

// ========================================
// HTML Escaping for Security
// ========================================

/**
 * Escape HTML to prevent XSS
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
// Event Listeners Setup
// ========================================

function setupEventListeners() {
    // Board buttons
    document.getElementById('addBoardBtn').addEventListener('click', () => openModal('addBoardModal'));
    document.getElementById('createBoardBtn').addEventListener('click', createBoard);

    // Column buttons
    document.getElementById('addColumnBtn').addEventListener('click', () => {
        if (!appState.selectedBoardId) {
            showNotification('Please select a board first', 'error');
            return;
        }
        openModal('addColumnModal');
    });
    document.getElementById('createColumnBtn').addEventListener('click', createColumn);

    // Task buttons
    document.getElementById('createTaskBtn').addEventListener('click', createTask);
    document.getElementById('updateTaskBtn').addEventListener('click', updateTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', () => {
        if (appState.currentTaskId) {
            deleteTask(appState.currentTaskId);
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal;
            closeModal(modalId);
        });
    });

    // Modal close on background click
    Object.values(modals).forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Modal cancel buttons
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

// ========================================
// Initialize Application
// ========================================

async function initializeApp() {
    console.log('Initializing Scrum Board Application...');
    await loadBoards();
    setupEventListeners();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Re-initialize drag listeners after rendering
const observer = new MutationObserver(() => {
    initializeDragListeners();
});

observer.observe(document.getElementById('columnsContainer'), {
    childList: true,
    subtree: true,
});
