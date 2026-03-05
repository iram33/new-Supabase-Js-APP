// Simple in-memory storage for tasks (fallback when Supabase isn't available)
let tasksStorage = JSON.parse(localStorage.getItem('tasks') || '[]');

// Supabase Configuration
// TODO: replace with your actual Supabase details
const SUPABASE_URL = "http://127.0.0.1:54321"; // local emulator API URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// Initialize Supabase client
let supabase = null;
let useLocalStorage = true;

// debug helper that writes to console and debug div
function debug(...args) {
  console.log(...args);
  const dv = document.getElementById('debug');
  if (dv) {
    dv.textContent += args.join(' ') + '\n';
  }
}

const initializeSupabase = () => {
  if (!window.supabase) {
    debug("Supabase library not loaded");
    return false;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  debug("Supabase client initialized");
  return true;
};

// DOM elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const addButton = document.querySelector('button');
const emptyState = document.getElementById('emptyState');

// helper to render a single task item
function createTaskListItem(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const textSpan = document.createElement("span");
  textSpan.textContent = task.task;
  textSpan.className = "task-text";
  li.appendChild(textSpan);

  const meta = document.createElement("div");
  meta.className = "meta";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener('click', () => editTask(task.id, task.task));
  meta.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  meta.appendChild(deleteBtn);

  li.appendChild(meta);
  return li;
}

// Fetch tasks from Supabase or localStorage
const fetchTasks = async () => {
  try {
    let data;
    
    if (useLocalStorage) {
      data = tasksStorage;
    } else if (supabase) {
      const { data: sbData, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      data = sbData;
    } else {
      data = tasksStorage;
    }
    
    taskList.innerHTML = "";
    emptyState.style.display = "none";

    if (data && data.length > 0) {
      data.forEach(task => {
        taskList.appendChild(createTaskListItem(task));
      });
    } else {
      emptyState.style.display = "block";
    }
  } catch (err) {
    console.error("Error fetching tasks:", err);
    debug("Error fetching tasks: " + err.message);
  }
};

// Add a new task to Supabase or localStorage
const addTask = async () => {
  debug('addTask called');
  const text = taskInput.value.trim();
  
  if (!text) {
    debug('Task input is empty');
    return;
  }
  
  try {
    addButton.disabled = true;
    
    if (useLocalStorage) {
      const newTask = {
        id: Date.now(),
        task: text,
        created_at: new Date().toISOString()
      };
      tasksStorage.unshift(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasksStorage));
    } else if (supabase) {
      const { error } = await supabase
        .from("todos")
        .insert([{ task: text }]);
      
      if (error) throw error;
    } else {
      throw new Error('No storage backend available');
    }
    
    taskInput.value = "";
    taskInput.focus();
    await fetchTasks();
  } catch (err) {
    debug("Error adding task: " + err.message);
  } finally {
    addButton.disabled = false;
  }
};

// Update an existing task
const updateTask = async (id, newText) => {
  try {
    if (useLocalStorage) {
      const task = tasksStorage.find(t => t.id === id);
      if (task) {
        task.task = newText;
        localStorage.setItem('tasks', JSON.stringify(tasksStorage));
      }
    } else if (supabase) {
      const { error } = await supabase
        .from("todos")
        .update({ task: newText })
        .eq("id", id);
      if (error) throw error;
    }
    await fetchTasks();
  } catch (err) {
    debug("Error updating task: " + err.message);
  }
};

// Prompt user to edit a task
const editTask = (id, currentText) => {
  const newText = prompt("Edit task", currentText);
  if (newText && newText.trim() && newText !== currentText) {
    updateTask(id, newText.trim());
  }
};

// Delete a task
const deleteTask = async (id) => {
  if (!confirm("Remove this task?")) return;
  try {
    if (useLocalStorage) {
      tasksStorage = tasksStorage.filter(t => t.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasksStorage));
    } else if (supabase) {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    }
    await fetchTasks();
  } catch (err) {
    debug("Error deleting task: " + err.message);
  }
};

// subscribe to realtime changes
const subscribeToChanges = () => {
  if (!supabase) return;
  supabase
    .from('todos')
    .on('*', payload => {
      fetchTasks();
    })
    .subscribe();
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  debug('DOM loaded, running initialization');
  debug('Using localStorage for tasks storage');
  
  if (initializeSupabase()) {
    // Try to use Supabase if available
    useLocalStorage = false;
    fetchTasks();
    subscribeToChanges();
  } else {
    // Fall back to localStorage
    debug('Supabase not available, using localStorage');
    useLocalStorage = true;
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
window.updateTask = updateTask;
window.deleteTask = deleteTask;
