# Setup Local Supabase with Docker (Production-like)

## 🚀 Quick Setup Guide

### Step 1: Install Docker Desktop (Windows)

1. **Download Docker Desktop**: https://www.docker.com/products/docker-desktop/
2. **Run the installer** with administrator privileges
3. **Restart your computer** after installation
4. **Start Docker Desktop** from the Start menu
5. **Wait for Docker to start** (green icon in system tray)

### Step 2: Verify Docker Installation

Open PowerShell/CMD and run:
```bash
docker --version
docker compose version
```

You should see version numbers for both.

### Step 3: Start Local Supabase

1. **Open PowerShell** in your project directory
2. **Run the setup script**:
   ```bash
   .\start-local-supabase.bat
   ```

Or manually:
```bash
# Create directories
mkdir -p volumes\db\data
mkdir -p volumes\storage\data
mkdir -p volumes\kong

# Start Supabase
docker compose -f local-supabase.yml up -d
```

### Step 4: Wait for Services to Start

Wait 30-60 seconds for all services to be healthy. Check status:
```bash
docker compose -f local-supabase.yml ps
```

### Step 5: Access Supabase Studio

Open your browser and go to:
**http://localhost:54323**

You'll see the Supabase Dashboard!

### Step 6: Update Your .env File

Replace your current .env content with:
```bash
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EaIMWDU452oP1ORhkP4Ipt5osk8d9y2yqEIthBkGn3M
```

### Step 7: Restart Your Backend

Stop current servers and restart:
```bash
# Stop current
taskkill /F /IM node.exe

# Start backend
& "C:\Program Files\nodejs\node.exe" server.js
```

## 📊 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Supabase Studio** | http://localhost:54323 | Dashboard/UI |
| **API Gateway** | http://localhost:8000 | Main API endpoint |
| **Database** | localhost:54322 | Direct DB access |
| **REST API** | http://localhost:8000/rest/v1/ | Your todos endpoint |
| **Auth** | http://localhost:8000/auth/v1/ | Authentication |
| **Storage** | http://localhost:8000/storage/v1/ | File storage |
| **Realtime** | ws://localhost:8000/realtime/v1/ | WebSocket |

## 🔑 API Keys

- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- **Service Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EaIMWDU452oP1ORhkP4Ipt5osk8d9y2yqEIthBkGn3M`

## 🗄️ Database Access

### Option 1: Supabase Studio (Recommended)
1. Go to http://localhost:54323
2. Click "Table Editor"
3. Select the "todos" table

### Option 2: Direct Database Connection
```bash
# Connect with psql (if you have PostgreSQL installed)
psql -h localhost -p 54322 -U postgres -d postgres

# Or use any database GUI tool with:
# Host: localhost
# Port: 54322
# Database: postgres
# Username: postgres
# Password: postgres
```

### Option 3: API Access
```bash
# View all todos
curl http://localhost:8000/rest/v1/todos

# Add a new todo
curl -X POST http://localhost:8000/rest/v1/todos \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '[{"task": "New task from API"}]'
```

## 🧪 Test Your Setup

1. **Open Supabase Studio**: http://localhost:54323
2. **Check todos table**: Should have seed data
3. **Add task via frontend**: Should appear in Studio
4. **Restart containers**: Data should persist

## 🛠️ Management Commands

```bash
# View logs
docker compose -f local-supabase.yml logs -f

# View specific service logs
docker compose -f local-supabase.yml logs -f db

# Restart all services
docker compose -f local-supabase.yml restart

# Stop all services
docker compose -f local-supabase.yml down

# Stop and remove volumes (delete data)
docker compose -f local-supabase.yml down -v

# Rebuild and start
docker compose -f local-supabase.yml up -d --build
```

## 🔧 Troubleshooting

### Docker Issues
- **Docker not found**: Install Docker Desktop
- **Permission denied**: Run PowerShell as Administrator
- **Port conflicts**: Check if ports 54322, 54323, 8000 are free

### Service Issues
- **Services not starting**: Check logs with `docker compose logs`
- **Database connection failed**: Wait longer for DB to initialize
- **API not responding**: Check Kong gateway status

### Common Fixes
```bash
# Reset everything
docker compose -f local-supabase.yml down -v
docker system prune -f
docker compose -f local-supabase.yml up -d
```

## 🎯 Production Comparison

This local setup mirrors production:

| Local | Production |
|-------|------------|
| Docker containers | Docker containers |
| PostgreSQL | PostgreSQL |
| Kong gateway | Kong gateway |
| All Supabase services | All Supabase services |
| Persistent data | Persistent data |

## 📁 File Structure

```
my-supabase-app/
├── local-supabase.yml          # Docker compose configuration
├── start-local-supabase.bat    # Windows setup script
├── supabase/
│   ├── migrations/             # Database migrations
│   └── seed.sql              # Initial data
├── volumes/
│   ├── db/data/              # Database data
│   ├── storage/data/          # Storage files
│   └── kong/                 # Gateway config
└── .env                       # Environment variables
```

## 🚀 Next Steps

1. ✅ Install Docker Desktop
2. ✅ Run `.\start-local-supabase.bat`
3. ✅ Open http://localhost:54323
4. ✅ Update .env file
5. ✅ Restart backend
6. ✅ Test with your frontend

You now have a **real PostgreSQL database** with **persistent storage** that works exactly like production Supabase!
