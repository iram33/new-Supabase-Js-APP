# Todo App - Production Deployment Guide

This guide explains how to deploy the Todo App on Ubuntu with Supabase in Docker containers.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80)    │    │ Todo Backend    │    │  Supabase Stack │
│   (Frontend)    │◄──►│   (API:3001)    │◄──►│   (Multi-Port)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                      ┌─────────────────┐            │
                      │   PostgreSQL    │◄───────────┘
                      │    (5432)      │
                      └─────────────────┘
```

## 📦 Services Included

### Supabase Components:
- **PostgreSQL Database** (Port 5432)
- **Supabase Auth** (Port 9999)
- **PostgREST API** (Port 3000)
- **Supabase Storage** (Port 5000)
- **Supabase Realtime** (Port 4000)

### Application Components:
- **Todo Backend API** (Port 3001)
- **Nginx Reverse Proxy** (Port 80/443)

## 🚀 Quick Deployment

### Prerequisites
- Ubuntu 20.04+ or 22.04+
- Docker & Docker Compose
- Git
- SSH access (for remote deployment)

### Option 1: Automated Deployment
```bash
# Clone the repository
git clone https://github.com/iram33/new-Supabase-Js-APP.git
cd new-Supabase-Js-APP

# Make the deploy script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone and setup
git clone https://github.com/iram33/new-Supabase-Js-APP.git
cd new-Supabase-Js-APP

# 4. Configure environment
cp production.env .env
# Edit .env with your production values

# 5. Deploy
docker-compose up -d
```

## ⚙️ Configuration

### Environment Variables (.env)
```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-token-32-chars

# Supabase
SUPABASE_URL=http://rest:3000
SUPABASE_SERVICE_KEY=your-service-key

# Application
NODE_ENV=production
PORT=3001
```

### Security Configuration
```bash
# Generate secure passwords
openssl rand -base64 32  # For JWT secret
openssl rand -base64 16  # For database password
```

## 🔧 Management Commands

### Docker Compose Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f todo-backend

# Restart services
docker-compose restart

# Update application
git pull
docker-compose build
docker-compose up -d
```

### Database Management
```bash
# Connect to database
docker-compose exec db psql -U supabase_admin postgres

# Backup database
docker-compose exec db pg_dump -U supabase_admin postgres > backup.sql

# Restore database
docker-compose exec -T db psql -U supabase_admin postgres < backup.sql
```

## 🔒 Security Setup

### SSL/TLS Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Security Best Practices
1. **Change default passwords** in production
2. **Use environment variables** for secrets
3. **Enable SSL** in production
4. **Regular updates** of Docker images
5. **Monitor logs** for suspicious activity
6. **Implement rate limiting** (included in Nginx)

## 📊 Monitoring & Logging

### Log Locations
```
/opt/todo-app/logs/
├── app.log              # Application logs
├── nginx-access.log      # Nginx access logs
└── nginx-error.log       # Nginx error logs
```

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service
curl http://localhost/api/health

# Check Supabase services
curl http://localhost:3000/health    # PostgREST
curl http://localhost:9999/health    # Auth
curl http://localhost:5000/status    # Storage
```

## 🔄 Backup Strategy

### Automated Backups
```bash
# Backup script runs daily at 2 AM
0 2 * * * /opt/todo-app/backup.sh

# Manual backup
./backup.sh
```

### Backup Contents
- Database dumps (SQL)
- Storage files (tar.gz)
- Configuration files

### Restore Process
```bash
# Stop services
docker-compose down

# Restore database
docker-compose up -d db
docker-compose exec -T db psql -U supabase_admin postgres < backup.sql

# Restore storage
tar -xzf storage_backup.tar.gz -C volumes/storage/

# Start all services
docker-compose up -d
```

## 🌐 Domain Configuration

### DNS Settings
```
A Record: yourdomain.com → YOUR_SERVER_IP
AAAA Record: yourdomain.com → YOUR_IPV6_ADDRESS (optional)
```

### Nginx Configuration
Edit `nginx.conf` to update:
- `server_name` directive
- SSL certificate paths
- Domain-specific settings

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_todos_created_at ON todos(created_at);
CREATE INDEX idx_todos_completed ON todos(completed);

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Nginx Caching
- Static assets cached for 1 year
- Gzip compression enabled
- Rate limiting configured

### Docker Optimization
- Multi-stage builds in Dockerfile
- Health checks for all services
- Resource limits configured

## 🐛 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check logs
docker-compose logs service-name

# Check port conflicts
sudo netstat -tulpn | grep :PORT

# Check disk space
df -h
```

#### Database Connection Issues
```bash
# Check database health
docker-compose exec db pg_isready -U supabase_admin

# Check network connectivity
docker-compose exec todo-backend ping db
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check database performance
docker-compose exec db psql -U supabase_admin -c "SELECT * FROM pg_stat_activity;"
```

## 📞 Support

### Getting Help
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `.env` file
3. Check system resources: `df -h`, `free -h`
4. Network connectivity: `curl -I http://localhost`

### Useful Commands
```bash
# System overview
docker-compose ps
docker stats
docker system df

# Clean up
docker system prune -f
docker volume prune -f
```

## 🔄 Updates & Maintenance

### Monthly Maintenance
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# System updates
sudo apt update && sudo apt upgrade

# Log rotation (automatic)
sudo logrotate -f /etc/logrotate.d/todo-app
```

### Application Updates
```bash
# Update code
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

## 📋 Production Checklist

- [ ] Change all default passwords
- [ ] Configure SSL certificates
- [ ] Set up domain DNS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all services
- [ ] Document procedures
- [ ] Set up alerts
- [ ] Performance testing

---

**Note**: This deployment guide assumes you have root/sudo privileges on the Ubuntu server. Adjust paths and configurations based on your specific setup.
