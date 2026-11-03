"use strict";

// TaskFlow - Task creation and rendering

const addTaskButton = document.querySelector(".add-task-btn");
const taskList = document.querySelector(".task-list");
const statsCards = document.querySelectorAll(".stat-card");

const tasks = [];

// Create the task form dynamically.
const taskForm = document.createElement("form");
taskForm.className = "add-task-form";
taskForm.hidden = true;

taskForm.innerHTML = `
    <div class="form-group">
        <label for="task-title">Task title</label>
        <input
            type="text"
            id="task-title"
            name="title"
            placeholder="What do you need to do?"
            maxlength="100"
            required
        >
    </div>

    <div class="form-group">
        <label for="task-priority">Priority</label>
        <select id="task-priority" name="priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
        </select>
    </div>

    <div class="form-actions">
        <button type="submit" class="submit-task-btn">Add Task</button>
        <button type="button" class="cancel-task-btn">Cancel</button>
    </div>
`;

if (taskList) {
    taskList.before(taskForm);
}

// Read the existing dashboard tasks.
function getExistingTaskCount() {
    return taskList ? taskList.querySelectorAll(".task-item").length : 0;
}

// Create a task object.
function createTask(title, priority) {
    return {
        id: Date.now(),
        title: title,
        priority: priority,
        completed: false
    };
}

// Render one task in the dashboard.
function renderTask(task) {
    const taskElement = document.createElement("div");
    taskElement.className = "task-item";
    taskElement.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("span");
    title.textContent = task.title;

    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = "Added just now";

    details.append(title, date);

    const priority = document.createElement("span");
    priority.className = `priority priority-${task.priority}`;
    priority.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    taskElement.append(checkbox, details, priority);
    taskList.appendChild(taskElement);
}

// Update the dashboard statistics.
function updateStatistics() {
    if (statsCards.length < 3 || !taskList) {
        return;
    }

    const allTaskElements = taskList.querySelectorAll(".task-item");
    const total = allTaskElements.length;

    const completed = Array.from(allTaskElements).filter((taskElement) => {
        const checkbox = taskElement.querySelector(".task-check");
        return checkbox && checkbox.checked;
    }).length;

    const pending = total - completed;

    const values = [total, completed, pending];

    statsCards.forEach((card, index) => {
        const valueElement = card.querySelector(
            "h2, h3, .stat-number, .stat-value, .stat-count, strong"
        );

        if (valueElement && values[index] !== undefined) {
            valueElement.textContent = values[index];
        }
    });
}

// Show or hide the task form.
function toggleTaskForm(show) {
    taskForm.hidden = !show;

    if (show) {
        document.querySelector("#task-title").focus();
    } else {
        taskForm.reset();
    }
}

// Open the form.
if (addTaskButton && taskList) {
    addTaskButton.addEventListener("click", () => {
        toggleTaskForm(true);
    });
}

// Close the form.
const cancelButton = taskForm.querySelector(".cancel-task-btn");

cancelButton.addEventListener("click", () => {
    toggleTaskForm(false);
});

// Handle task submission.
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const titleInput = taskForm.querySelector("#task-title");
    const priorityInput = taskForm.querySelector("#task-priority");

    const title = titleInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
        titleInput.focus();
        return;
    }

    const newTask = createTask(title, priority);

    tasks.push(newTask);
    renderTask(newTask);
    updateStatistics();

    toggleTaskForm(false);
});

// Initialize dashboard statistics.
updateStatistics();

console.log("TaskFlow is ready!");