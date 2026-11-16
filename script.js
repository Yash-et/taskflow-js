"use strict";

// TaskFlow - Task creation, completion and deletion

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

// Create a task object.
function createTask(title, priority) {
    return {
        id: Date.now() + Math.random(),
        title,
        priority,
        completed: false
    };
}

// Render one task in the dashboard.
function renderTask(task) {
    const taskElement = document.createElement("div");

    taskElement.className = "task-item";
    taskElement.dataset.taskId = task.id;

    if (task.completed) {
        taskElement.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
        "aria-label",
        `Mark ${task.title} as completed`
    );

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.description || "";

    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = task.date || "Added just now";

    details.append(title, description, date);

    const priority = document.createElement("span");
    priority.className = `priority priority-${task.priority}`;
    priority.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    taskElement.append(
        checkbox,
        details,
        priority,
        deleteButton
    );

    taskList.appendChild(taskElement);
}

// Update dashboard statistics.
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

        if (valueElement) {
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

// Open the task form.
if (addTaskButton && taskList) {
    addTaskButton.addEventListener("click", () => {
        toggleTaskForm(true);
    });
}

// Cancel task creation.
taskForm.querySelector(".cancel-task-btn").addEventListener("click", () => {
    toggleTaskForm(false);
});

// Add a new task.
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

// Handle completion and deletion using event delegation.
if (taskList) {
    taskList.addEventListener("change", (event) => {
        if (!event.target.matches(".task-check")) {
            return;
        }

        const taskElement = event.target.closest(".task-item");

        if (!taskElement) {
            return;
        }

        const taskId = taskElement.dataset.taskId;

        const task = tasks.find(
            (item) => String(item.id) === taskId
        );

        if (task) {
            task.completed = event.target.checked;
        }

        taskElement.classList.toggle(
            "completed",
            event.target.checked
        );

        updateStatistics();
    });

    taskList.addEventListener("click", (event) => {
        const deleteButton = event.target.closest(".delete-task-btn");

        if (!deleteButton) {
            return;
        }

        const taskElement = deleteButton.closest(".task-item");

        if (!taskElement) {
            return;
        }

        const taskId = taskElement.dataset.taskId;

        const taskIndex = tasks.findIndex(
            (item) => String(item.id) === taskId
        );

        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
        }

        taskElement.remove();
        updateStatistics();
    });
}

// Initialize statistics.
updateStatistics();

console.log("TaskFlow is ready!");