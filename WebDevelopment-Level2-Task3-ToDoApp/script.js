const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");
const formMessage = document.getElementById("formMessage");

const STORAGE_KEY = "taskflow_tasks_v1";

// Load previously saved tasks.
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((task) =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean" &&
            typeof task.createdAt === "string"
        ).map((task) => ({
            id: task.id,
            text: task.text,
            completed: task.completed,
            createdAt: task.createdAt,
            completedAt:
                typeof task.completedAt === "string"
                    ? task.completedAt
                    : null
        }));
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

let tasks = loadTasks();

// Save task data in the browser.
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);
        showMessage(
            "Could not save changes in this browser. Check your browser storage.",
            true
        );
        return false;
    }
}

// Show a status or error message.
function showMessage(text, isError = false) {
    formMessage.textContent = text;
    formMessage.style.color = isError ? "#dc2626" : "#15803d";
}

// Create unique task IDs.
function createTaskId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Format timestamps for display.
function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

// Add a task.
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        showMessage("Please enter a task description.", true);
        taskInput.focus();
        return;
    }

    if (text.length > 200) {
        showMessage("A task must be 200 characters or fewer.", true);
        return;
    }

    tasks.unshift({
        id: createTaskId(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();

    showMessage("Task added successfully.");
});

// Create a button with an action.
function createActionButton(label, action, className, taskId) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = taskId;

    if (className) {
        button.className = className;
    }

    return button;
}

// Build one task item safely using textContent.
function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
        item.classList.add("completed");
    }

    item.dataset.id = task.id;

    const content = document.createElement("div");
    content.className = "task-content";

    const taskText = document.createElement("p");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const taskTime = document.createElement("small");
    taskTime.className = "task-time";

    const addedTime = formatTimestamp(task.createdAt);
    const completedTime = formatTimestamp(task.completedAt);

    taskTime.textContent = task.completed
        ? `Added: ${addedTime} · Completed: ${completedTime}`
        : `Added: ${addedTime}`;

    content.append(taskText, taskTime);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    actions.append(
        createActionButton(
            task.completed ? "Undo" : "Mark Complete",
            "toggle-complete",
            "complete-btn",
            task.id
        ),
        createActionButton("Edit", "edit", "", task.id),
        createActionButton("Delete", "delete", "delete-btn", task.id)
    );

    item.append(content, actions);

    return item;
}

// Update both lists, counters and empty-state messages.
function renderTasks() {
    const pendingTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    pendingList.replaceChildren();
    completedList.replaceChildren();

    pendingTasks.forEach((task) => {
        pendingList.appendChild(createTaskElement(task));
    });

    completedTasks.forEach((task) => {
        completedList.appendChild(createTaskElement(task));
    });

    pendingCount.textContent =
        `${pendingTasks.length} pending`;

    completedCount.textContent =
        `${completedTasks.length} completed`;

    pendingEmpty.hidden = pendingTasks.length > 0;
    completedEmpty.hidden = completedTasks.length > 0;
}

// Find the task associated with a clicked button.
function findTask(id) {
    return tasks.find((task) => task.id === id);
}

// Handle buttons in both task lists.
function handleTaskAction(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;
    const task = findTask(id);

    if (!task) {
        return;
    }

    if (action === "toggle-complete") {
        task.completed = !task.completed;
        task.completedAt = task.completed
            ? new Date().toISOString()
            : null;

        saveTasks();
        renderTasks();

        showMessage(
            task.completed
                ? "Task marked as completed."
                : "Task moved back to pending."
        );

        return;
    }

    if (action === "delete") {
        tasks = tasks.filter((item) => item.id !== id);

        saveTasks();
        renderTasks();

        showMessage("Task deleted.");
        return;
    }

    if (action === "edit") {
        enableEdit(button.closest(".task-item"), task);
        return;
    }

    if (action === "save-edit") {
        saveEdit(button.closest(".task-item"), task);
        return;
    }

    if (action === "cancel-edit") {
        renderTasks();
    }
}

// Replace task text with an inline editor.
function enableEdit(item, task) {
    const content = item.querySelector(".task-content");
    const actions = item.querySelector(".task-actions");

    content.replaceChildren();

    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-edit-input";
    input.value = task.text;
    input.maxLength = 200;
    input.setAttribute("aria-label", "Edit task");

    const time = document.createElement("small");
    time.className = "task-time";
    time.textContent = `Added: ${formatTimestamp(task.createdAt)}`;

    content.append(input, time);

    actions.replaceChildren(
        createActionButton("Save", "save-edit", "complete-btn", task.id),
        createActionButton("Cancel", "cancel-edit", "", task.id)
    );

    input.focus();
    input.select();
}

// Validate and save an edited task.
function saveEdit(item, task) {
    const input = item.querySelector(".task-edit-input");
    const updatedText = input.value.trim();

    if (!updatedText) {
        showMessage("Task description cannot be empty.", true);
        input.focus();
        return;
    }

    if (updatedText.length > 200) {
        showMessage("A task must be 200 characters or fewer.", true);
        input.focus();
        return;
    }

    task.text = updatedText;

    saveTasks();
    renderTasks();

    showMessage("Task updated successfully.");
}

// Use event delegation for dynamically created buttons.
pendingList.addEventListener("click", handleTaskAction);
completedList.addEventListener("click", handleTaskAction);

// Support Enter to save and Escape to cancel an edit.
function handleEditKeyboard(event) {
    if (!event.target.classList.contains("task-edit-input")) {
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();

        const item = event.target.closest(".task-item");
        const task = findTask(item.dataset.id);

        if (task) {
            saveEdit(item, task);
        }
    }

    if (event.key === "Escape") {
        const item = event.target.closest(".task-item");
        const task = findTask(item.dataset.id);

        if (task) {
            renderTasks();
        }
    }
}

pendingList.addEventListener("keydown", handleEditKeyboard);
completedList.addEventListener("keydown", handleEditKeyboard);

// Display saved tasks when the page opens.
renderTasks();