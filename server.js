require('dotenv').config(); // 1. Load environment variables first
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(require('cors')({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
  credentials: true
}));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log(' Supabase URL:', process.env.SUPABASE_URL);
console.log(' Supabase connected:', !!supabase);

// Middleware to check Supabase connection
app.use((req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not connected' });
  }
  next();
});

// --- CRUD Operations ---

// READ - Get all tasks
app.get('/api/todos', async (req, res) => {
  try {
    console.log('Fetching all tasks...');
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Fetched ${data.length} tasks`);
    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE - Add new task
app.post('/api/todos', async (req, res) => {
  try {
    const { task } = req.body;

    if (!task || task.trim() === '') {
      return res.status(400).json({ error: 'Task text is required' });
    }

    console.log('Adding new task:', task);

    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: task.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Task added successfully:', data);
    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE - Update task (mark as complete or update text)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, completed } = req.body;

    console.log('Updating task:', id, req.body);

    const updateData = {};
    if (task !== undefined) updateData.task = task.trim();
    if (completed !== undefined) updateData.completed = completed;

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('Task updated successfully:', data);
    res.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Remove task
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting task:', id);

    const { data, error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('Task deleted successfully:', data);
    res.json({ message: 'Task deleted successfully', deletedTask: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Todo API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Todo API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET    /api/todos     - Get all tasks`);
  console.log(`   POST   /api/todos     - Create new task`);
  console.log(`   PUT    /api/todos/:id - Update task`);
  console.log(`   DELETE /api/todos/:id - Delete task`);
});

module.exports = app;