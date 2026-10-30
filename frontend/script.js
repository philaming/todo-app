const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const incompleteButton = document.getElementById("show-incomplete");
const allButton = document.getElementById("show-all");

taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        return;
    }

    const response = await fetch("http://127.0.0.1:8000/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: title })
    });

    if (!response.ok) {
        alert("Failed to create task.");
        return;
    }

    const task = await response.json();

    alert("Task created: " + task.title);
    taskInput.value = "";
});


async function updateTask(taskId) {
    const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}?completed=true`,
        { method: "PATCH" }
    );

    if (!response.ok) {
        alert("Failed to update task.");
        return;
    }

    loadTasks();
}


async function deleteTask(taskId) {
    const response = await fetch(
        `http://127.0.0.1:8000/tasks/${taskId}`,
        { method: "DELETE" }
    );

    if (!response.ok) {
        alert("Failed to delete task.");
        return;
    }

    loadTasks();
}

async function loadTasks() {
    const response = await fetch("http://127.0.0.1:8000/tasks");
    const tasks = await response.json();

    console.log(tasks.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed
    })));

    taskList.innerHTML = "";

    tasks.forEach(function (task) {
        const item = document.createElement("li");

        const taskText = document.createElement("span");
        taskText.textContent = 'ID ' + task.id + ' : ' + task.title + ' | ' + task.completed;

        const completeButton = document.createElement("button");
        completeButton.textContent = "Complete";
        completeButton.addEventListener("click", function () {
            updateTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        item.appendChild(taskText);
        item.appendChild(completeButton);
        item.appendChild(deleteButton);
        taskList.appendChild(item);

    });
}
loadTasks()

allButton.addEventListener("click", loadTasks); 


async function loadIncompleteTasks() {
    const response = await fetch("http://127.0.0.1:8000/not_completed");
    const tasks = await response.json();

    taskList.innerHTML = "";

    tasks.forEach(function (task) {
        
        const item = document.createElement("li");

        const taskText = document.createElement("span");
        taskText.textContent = 'ID ' + task.id + ' : ' + task.title +  ' | ' + task.completed;

        const completeButton = document.createElement("button");
        completeButton.textContent = "Complete";
        completeButton.addEventListener("click", function () {
            updateTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        item.appendChild(taskText);
        item.appendChild(completeButton);
        item.appendChild(deleteButton);
        taskList.appendChild(item);

    });
}

incompleteButton.addEventListener("click", loadIncompleteTasks);