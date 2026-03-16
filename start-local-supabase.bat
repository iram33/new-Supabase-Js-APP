@echo off
echo 🚀 Starting Local Supabase...

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose -f local-supabase.yml down

REM Create necessary directories
echo 📁 Creating directories...
if not exist "volumes\db\data" mkdir "volumes\db\data"
if not exist "volumes\storage\data" mkdir "volumes\storage\data"
if not exist "volumes\kong" mkdir "volumes\kong"

REM Create Kong configuration
echo 🔧 Setting up Kong configuration...
(
echo _format_version: "3.0"
echo _transform: true
echo.
echo services:
echo   - name: auth
echo     url: http://auth:9999
echo     routes:
echo       - name: auth
echo         paths: ["/auth/v1/"]
echo     plugins:
echo       - name: cors
echo   - name: rest
echo     url: http://rest:3000
echo     routes:
echo       - name: rest
echo         paths: ["/rest/v1/"]
echo     plugins:
echo       - name: cors
echo   - name: storage
echo     url: http://storage:5000
echo     routes:
echo       - name: storage
echo         paths: ["/storage/v1/"]
echo     plugins:
echo       - name: cors
echo   - name: realtime
echo     url: http://realtime:4000
echo     routes:
echo       - name: realtime
echo         paths: ["/realtime/v1/"]
echo     plugins:
echo       - name: cors
echo.
echo plugins:
echo   - name: cors
echo     config:
echo       origins: ["*"]
echo       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
echo       headers: ["Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Auth-Token", "Host", "Origin", "Referer", "User-Agent"]
echo       exposed_headers: ["X-Total-Count", "Link"]
echo       credentials: true
echo       max_age: 86400
) > volumes\kong\kong.yml

REM Start Supabase services
echo 🐳 Starting Supabase containers...
docker-compose -f local-supabase.yml up -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check service status
echo 🔍 Checking service status...
docker-compose -f local-supabase.yml ps

echo.
echo 🎉 Local Supabase is starting up!
echo.
echo 📊 Access URLs:
echo    🌐 Supabase Studio: http://localhost:54323
echo    🔗 API Gateway: http://localhost:8000
echo    🗄️  Database: postgresql://postgres:postgres@localhost:54322/postgres
echo    📡 REST API: http://localhost:8000/rest/v1/
echo    🔐 Auth: http://localhost:8000/auth/v1/
echo    📁 Storage: http://localhost:8000/storage/v1/
echo    ⚡ Realtime: ws://localhost:8000/realtime/v1/
echo.
echo 🔑 API Keys:
echo    🔓 Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
echo    🔑 Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EaIMWDU452oP1ORhkP4Ipt5osk8d9y2yqEIthBkGn3M
echo.
echo 📋 Next Steps:
echo    1. Wait 30 seconds for all services to start
echo    2. Open http://localhost:54323 to access Supabase Studio
echo    3. Update your .env file with:
echo       SUPABASE_URL=http://localhost:8000
echo       SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EaIMWDU452oP1ORhkP4Ipt5osk8d9y2yqEIthBkGn3M
echo    4. Restart your backend server
echo.
echo 🔍 To check logs: docker-compose -f local-supabase.yml logs -f
echo 🛑 To stop: docker-compose -f local-supabase.yml down
pause
