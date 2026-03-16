// Backend API Configuration
const API_BASE_URL = "http://localhost:3001/api";

// Initialize app
const initializeApp = () => {
  console.log("App initialized with backend API");
  console.log("Backend URL:", API_BASE_URL);
  return true;
};

// DOM elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const addButton = document.querySelector('button');

// Fetch tasks from backend API
const fetchTasks = async () => {
  try {
    console.log("Fetching tasks from backend API...");
    console.log("Request URL:", `${API_BASE_URL}/todos`);
    
    const response = await fetch(`${API_BASE_URL}/todos?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Tasks fetched:", data);
    
    taskList.innerHTML = "";
    if (data && data.length > 0) {
      data.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="task-content">
            <span class="task-text">${task.task || 'No task text'}</span>
            <span class="meta">Task #${task.id}</span>
          </div>
          <div class="task-actions">
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
          </div>
        `;
        li.dataset.id = task.id;
        taskList.appendChild(li);
      });
      document.getElementById('emptyState').style.display = 'none';
    } else {
      document.getElementById('emptyState').style.display = 'block';
    }
  } catch (err) {
    console.error("Error fetching tasks:", err);
    console.error("Full error details:", err.stack);
    
    // Show more detailed error in UI
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'background: #fee; color: #c00; padding: 10px; margin: 10px 0; border-radius: 5px; border: 1px solid #fcc;';
    errorMsg.innerHTML = `<strong>Error:</strong> ${err.message}<br><small>Check console for details</small>`;
    taskList.appendChild(errorMsg);
    
    // Also show alert
    alert(`❌ Error fetching tasks: ${err.message}\n\nCheck browser console (F12) for more details.`);
  }
};

// Add a new task via backend API
const addTask = async () => {
  const text = taskInput.value.trim();
  
  if (!text) {
    console.warn("Task input is empty");
    alert("Please enter a task!");
    return;
  }
  
  try {
    addButton.disabled = true;
    addButton.textContent = "Adding...";
    
    console.log("Adding task:", text);
    console.log("Request URL:", `${API_BASE_URL}/todos`);
    
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ task: text })
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Task added successfully:", data);
    
    taskInput.value = "";
    taskInput.focus();
    document.getElementById('emptyState').style.display = 'none';
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.textContent = 'Task added successfully!';
    successMsg.className = 'success-message';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
    
    await fetchTasks();
  } catch (err) {
    console.error("Error adding task:", err);
    alert(`Error: ${err.message}`);
  } finally {
    addButton.disabled = false;
    addButton.textContent = "Add Task";
  }
};

// Delete a task via backend API
const deleteTask = async (taskId) => {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }
  
  try {
    console.log("Deleting task:", taskId);
    
    const response = await fetch(`${API_BASE_URL}/todos/${taskId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Task deleted successfully:", data);
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.textContent = 'Task deleted successfully!';
    successMsg.className = 'success-message';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
    
    await fetchTasks();
  } catch (err) {
    console.error("Error deleting task:", err);
    alert(`Error: ${err.message}`);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (initializeApp()) {
    fetchTasks();
  }
});

// Allow Enter key to add task
taskInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// expose functions for easier testing and legacy onclick handlers
window.addTask = addTask;
window.fetchTasks = fetchTasks;
window.deleteTask = deleteTask;
