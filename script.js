"use strict";

// ==========================================
// TaskFlow - Complete Task Management System
// ==========================================

// DOM elements
const addTaskButton = document.querySelector(".add-task-btn");
const taskList = document.querySelector(".task-list");
const statsCards = document.querySelectorAll(".stat-card");

const searchInput = document.querySelector(".search-input");
const priorityFilter = document.querySelector(".filter-select");
const navigationLinks = document.querySelectorAll(".nav-link");
// ==========================================
// 1. Initialize the task data model
// ==========================================

// Import existing sample tasks from HTML before clearing the list.
function loadExistingTasks() {
    if (!taskList) {
        return [];
    }

    return Array.from(taskList.querySelectorAll(".task-item")).map(
        (element, index) => {
            const checkbox = element.querySelector(".task-check");
            const title = element.querySelector(".task-details h3");
            const description = element.querySelector(".task-details p");
            const priorityElement = element.querySelector(".priority");
            const dateElement = element.querySelector(".task-date");

            const priorityClass = ["high", "medium", "low"].find(
                (level) => priorityElement?.classList.contains(level)
            );

            const completed = Boolean(
                checkbox?.checked ||
                element.classList.contains("completed") ||
                element.classList.contains("completed-task")
            );

            return {
                id: `sample-${index + 1}`,
                title: title?.textContent.trim() || "Untitled task",
                description: description?.textContent.trim() || "",
                priority: priorityClass || "medium",
                completed,
                dateLabel: completed
                    ? "Today"
                    : dateElement?.textContent.trim() || "Today"
            };
        }
    );
}

const STORAGE_KEY = "taskflow_tasks";

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                return parsedTasks;
            }

            console.warn("Invalid saved tasks. Loading sample tasks.");
        }
    } catch (error) {
        console.error("Could not load saved tasks:", error);
    }

    return loadExistingTasks();
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}

// All tasks now live in one JavaScript array.
const tasks = loadTasks();
saveTasks();

// Current navigation filter.
let activeCategory = "all";

// ==========================================
// 2. Create the task form
// ==========================================

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
        <label for="task-description">Description</label>
        <input
            type="text"
            id="task-description"
            name="description"
            placeholder="Add a short description"
            maxlength="200"
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

// ==========================================
// 3. Create and render tasks
// ==========================================

function createTask(title, description, priority) {
    return {
        id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        description,
        priority,
        completed: false,
        dateLabel: "Today"
    };
}

function renderTask(task) {
    const taskElement = document.createElement("article");

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
    description.textContent = task.description;

    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = task.completed ? "Completed" : task.dateLabel;

    details.append(title, description, date);

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
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

    return taskElement;
}

// ==========================================
// 4. Filter and display tasks
// ==========================================

function getPriorityFilter() {
    if (!priorityFilter) {
        return "all";
    }

    const selectedOption = priorityFilter.selectedOptions[0];

    const value = (
        priorityFilter.value ||
        selectedOption?.textContent ||
        "all"
    ).toLowerCase();

    if (value.includes("high")) return "high";
    if (value.includes("medium")) return "medium";
    if (value.includes("low")) return "low";

    return "all";
}

function getFilteredTasks() {
    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedPriority = getPriorityFilter();

    return tasks.filter((task) => {
        // Search by title or description.
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm);

        // Apply priority filter.
        const matchesPriority =
            selectedPriority === "all" ||
            task.priority === selectedPriority;

        // Apply sidebar category.
        let matchesCategory = true;

        if (activeCategory === "today") {
            matchesCategory =
                task.dateLabel.toLowerCase() === "today";
        } else if (activeCategory === "important") {
            matchesCategory = task.priority === "high";
        } else if (activeCategory === "completed") {
            matchesCategory = task.completed;
        }

        return (
            matchesSearch &&
            matchesPriority &&
            matchesCategory
        );
    });
}

function renderTasks() {
    if (!taskList) {
        return;
    }

    const filteredTasks = getFilteredTasks();

    taskList.replaceChildren();

    filteredTasks.forEach((task) => {
        taskList.appendChild(renderTask(task));
    });

    updateStatistics();
}

// ==========================================
// 5. Update dashboard statistics
// ==========================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        (task) => task.completed
    ).length;

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

// ==========================================
// 6. Show and hide task form
// ==========================================

function toggleTaskForm(show) {
    taskForm.hidden = !show;

    if (show) {
        taskForm.querySelector("#task-title").focus();
    } else {
        taskForm.reset();
    }
}

if (addTaskButton) {
    addTaskButton.addEventListener("click", () => {
        toggleTaskForm(true);
    });
}

taskForm.querySelector(".cancel-task-btn").addEventListener(
    "click",
    () => {
        toggleTaskForm(false);
    }
);

// ==========================================
// 7. Add new tasks
// ==========================================

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const titleInput = taskForm.querySelector("#task-title");
    const descriptionInput = taskForm.querySelector("#task-description");
    const priorityInput = taskForm.querySelector("#task-priority");

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
        titleInput.focus();
        return;
    }

    const newTask = createTask(title, description, priority);

    tasks.push(newTask);
    saveTasks();
    toggleTaskForm(false);
    renderTasks();
});

// ==========================================
// 8. Complete and delete tasks
// ==========================================

if (taskList) {
    taskList.addEventListener("change", (event) => {
        if (!event.target.matches(".task-check")) {
            return;
        }

        const taskElement = event.target.closest(".task-item");
        const taskId = taskElement?.dataset.taskId;

        const task = tasks.find(
            (item) => item.id === taskId
        );

        if (task) {
            task.completed = event.target.checked;
            saveTasks();
            renderTasks();
        }
    });

    taskList.addEventListener("click", (event) => {
        const deleteButton = event.target.closest(".delete-task-btn");

        if (!deleteButton) {
            return;
        }

        const taskElement = deleteButton.closest(".task-item");
        const taskId = taskElement?.dataset.taskId;

        const taskIndex = tasks.findIndex(
            (item) => item.id === taskId
        );

        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
        }
    });
}

// ==========================================
// 9. Search functionality
// ==========================================

if (searchInput) {
    searchInput.addEventListener("input", renderTasks);
}

// ==========================================
// 10. Priority filter
// ==========================================

if (priorityFilter) {
    priorityFilter.addEventListener("change", renderTasks);
}

// ==========================================
// 11. Sidebar navigation
// ==========================================

navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const category = link.textContent.trim().toLowerCase();

        if (category.includes("all tasks")) {
            activeCategory = "all";
        } else if (category.includes("today")) {
            activeCategory = "today";
        } else if (category.includes("important")) {
            activeCategory = "important";
        } else if (category.includes("completed")) {
            activeCategory = "completed";
        } else {
            return;
        }

        navigationLinks.forEach((item) => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        renderTasks();
    });
});

// ==========================================
// 12. Initialize TaskFlow
// ==========================================

// All original HTML tasks are now rendered from JavaScript.
renderTasks();

console.log("TaskFlow is ready!");