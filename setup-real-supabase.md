# Setting Up Real Supabase Database

## Option 1: Supabase Cloud (Easiest)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/login with GitHub
4. Create new project:
   - **Organization**: Your name
   - **Project Name**: todo-app
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you

### Step 2: Get Your Credentials
After project creation, go to:
- **Settings** → **API** → Copy your:
  - **Project URL** (https://xxx.supabase.co)
  - **anon key** (public)
  - **service_role key** (secret)

### Step 3: Create Database Table
In Supabase Dashboard:
1. Go to **Table Editor**
2. Click **Create a new table**
3. Set up:
   - **Name**: todos
   - **Enable RLS**: ON (for security)
   - **Columns**:
     - `id` (int8, primary key, default: identity)
     - `task` (text, not null)
     - `completed` (bool, default: false)
     - `created_at` (timestamptz, default: now())

### Step 4: Set Up RLS (Row Level Security)
In **SQL Editor**, run:
```sql
-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all todos
CREATE POLICY "Allow anonymous read" ON todos
  FOR SELECT USING (auth.role() = 'anon');

-- Allow anonymous users to insert todos
CREATE POLICY "Allow anonymous insert" ON todos
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Allow anonymous users to update their own todos
CREATE POLICY "Allow anonymous update" ON todos
  FOR UPDATE USING (auth.role() = 'anon');

-- Allow anonymous users to delete their own todos
CREATE POLICY "Allow anonymous delete" ON todos
  FOR DELETE USING (auth.role() = 'anon');
```

### Step 5: Update Your .env File
Replace your current .env with real Supabase credentials:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### Step 6: Restart Your Backend
```bash
# Stop current servers
taskkill /F /IM node.exe

# Start with real Supabase
npm start
```

## Option 2: Local Supabase with Docker

### Step 1: Install Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Or download binary
# https://github.com/supabase/cli/releases
```

### Step 2: Initialize Local Supabase
```bash
# In your project directory
supabase init

# Start local Supabase
supabase start
```

### Step 3: Update .env for Local
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_KEY=your-local-service-key
```

### Step 4: Create Table
```bash
# Generate migration
supabase db push
```

## Testing Real Supabase

### Check Your Database
1. **Supabase Dashboard**: Table Editor
2. **Direct API**: `https://your-project.supabase.co/rest/v1/todos`
3. **Your Backend**: `http://localhost:3001/api/todos`

### Verify Data Flow
1. Add task in frontend
2. Check in Supabase Dashboard
3. Check via API call
4. Verify persistence across restarts

## Troubleshooting

### Common Issues
1. **CORS errors**: Add your domain to Supabase CORS settings
2. **RLS policies**: Make sure policies allow anonymous access
3. **API keys**: Use service_role key for backend operations

### Debug Commands
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/todos

# Check backend API
curl http://localhost:3001/api/todos
```

## Next Steps

Once you have real Supabase:
1. ✅ Persistent data storage
2. ✅ Real Supabase Dashboard
3. ✅ Full database features
4. ✅ Real-time subscriptions
5. ✅ Authentication integration
6. ✅ Storage capabilities
