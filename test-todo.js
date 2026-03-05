const fs = require('fs');
const { JSDOM } = require('jsdom');

// load html
const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

// expose global to simulate browser environment
const window = dom.window;
const document = window.document;

// provide a fake Supabase client so no network call is needed
function createFakeClient() {
  let tasks = [];
  let nextId = 1;
  return {
    from: (table) => {
      const query = {
        _where: null,
        select() { return this; },
        async order(field, opts) { return { data: tasks, error: null }; },
        async insert(rows) {
          rows.forEach(r => { r.id = nextId++; tasks.push(r); });
          return { error: null };
        },
        async update(updates) {
          if (this._where !== null) {
            tasks = tasks.map(t => t.id === this._where ? { ...t, ...updates } : t);
          }
          return { error: null };
        },
        async delete() {
          if (this._where !== null) {
            tasks = tasks.filter(t => t.id !== this._where);
          }
          return { error: null };
        },
        eq(field, value) {
          if (field === 'id') this._where = value;
          return this;
        }
      };
      return query;
    }
  };
}

// attach fake supabase to window before loading app script
window.supabase = { createClient: () => createFakeClient() };

// load app.js manually
const script = fs.readFileSync('app.js', 'utf-8');
console.log('app.js snippet', script.slice(-200));
dom.window.eval(script);

// trigger DOMContentLoaded to allow initialization
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
console.log('available globals', {
  addTask: typeof window.addTask,
  fetchTasks: typeof window.fetchTasks,
  updateTask: typeof window.updateTask,
  deleteTask: typeof window.deleteTask
});

// simulate adding a task inside an async wrapper
(async () => {
  window.document.getElementById('taskInput').value = 'Test task';
  await window.addTask();

  let items = [...document.querySelectorAll('#taskList li')].map(li => li.textContent);
  console.log('Items after addTask:', items);

  if (!items.includes('Test task')) {
    console.error('❌ Add test failed');
    process.exit(1);
  }

  // grab id from first list item for subsequent operations
  const firstLi = document.querySelector('#taskList li');
  const id = firstLi.dataset.id;

  console.log(`Task ID for update: ${id}`);

  // update the task
  await window.updateTask(id, 'Updated task');
  items = [...document.querySelectorAll('#taskList li')].map(li => li.textContent);
  console.log('Items after updateTask:', items);
  if (!items.includes('Updated task')) {
    console.error('❌ Update test failed');
    process.exit(1);
  }

  // delete the task
  await window.deleteTask(id);
  items = [...document.querySelectorAll('#taskList li')].map(li => li.textContent);
  console.log('Items after deleteTask:', items);
  if (items.length === 0) {
    console.log('✅ All tests passed');
    process.exit(0);
  } else {
    console.error('❌ Delete test failed');
    process.exit(1);
  }
})();