const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Mock database
let todos = [
  { id: 1, task: 'Sample task 1', completed: false, created_at: new Date().toISOString() },
  { id: 2, task: 'Sample task 2', completed: true, created_at: new Date().toISOString() }
];
let nextId = 3;

// RESTful endpoints mimicking Supabase
app.post('/rest/v1/todos', (req, res) => {
  console.log('Mock Supabase: POST request body:', req.body);
  
  // Handle Supabase client format which sends an array
  let taskData;
  if (Array.isArray(req.body) && req.body.length > 0) {
    taskData = req.body[0];
  } else {
    taskData = req.body;
  }
  
  const newTodo = { 
    ...taskData, 
    id: nextId++, 
    created_at: new Date().toISOString() 
  };
  
  todos.push(newTodo);
  console.log('Mock Supabase: Created new todo:', newTodo);
  res.json(newTodo);
});

app.get('/rest/v1/todos', (req, res) => {
  res.json(todos);
});

app.patch('/rest/v1/todos', (req, res) => {
  let { id } = req.query;
  
  // Handle Supabase client format (eq.1) and direct format (1)
  if (id && id.startsWith('eq.')) {
    id = id.substring(3); // Remove 'eq.' prefix
  }
  
  const index = todos.findIndex(t => t.id == id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...req.body };
    res.json(todos[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/rest/v1/todos', (req, res) => {
  let { id } = req.query;
  console.log('Mock Supabase: Raw ID query:', id);
  
  // Handle Supabase client format (eq.1) and direct format (1)
  if (id && id.startsWith('eq.')) {
    id = id.substring(3); // Remove 'eq.' prefix
  }
  
  console.log('Mock Supabase: Processed ID:', id);
  console.log('Mock Supabase: Current todos:', todos);
  
  const index = todos.findIndex(t => t.id == id);
  console.log('Mock Supabase: Found index:', index);
  
  if (index !== -1) {
    const deleted = todos.splice(index, 1)[0];
    console.log('Mock Supabase: Deleted task:', deleted);
    res.json(deleted);
  } else {
    console.log('Mock Supabase: Task not found');
    res.status(404).json({ error: 'Not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 54321;
app.listen(PORT, () => {
  console.log(`🟢 Mock Supabase running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   POST   /rest/v1/todos`);
  console.log(`   GET    /rest/v1/todos`);
  console.log(`   PATCH  /rest/v1/todos`);
  console.log(`   DELETE /rest/v1/todos`);
});
