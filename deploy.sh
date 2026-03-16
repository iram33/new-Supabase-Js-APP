#!/bin/bash

# Production Deployment Script for Ubuntu
# This script deploys the Todo App with Supabase in Docker containers

set -e

echo "🚀 Starting Todo App Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    print_warning "This script is optimized for Ubuntu. Continue anyway? (y/n)"
    read -r response
    if [[ ! $response =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    htop \
    ufw

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
    print_success "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_success "Docker Compose is already installed"
fi

# Add user to docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker $USER

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create application directory
print_status "Creating application directory..."
APP_DIR="/opt/todo-app"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Create necessary directories
print_status "Creating data directories..."
mkdir -p volumes/db/data
mkdir -p volumes/storage/data
mkdir -p logs
mkdir -p frontend
mkdir -p ssl

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f .env ]; then
    cp production.env .env
    print_warning "Please edit .env file with your production values before continuing!"
    print_warning "Press Enter to continue or Ctrl+C to exit and edit the file..."
    read -r
fi

# Build and start containers
print_status "Building and starting containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
for service in db auth rest storage realtime todo-backend; do
    if docker-compose ps $service | grep -q "Up (healthy)"; then
        print_success "$service is healthy"
    else
        print_error "$service is not healthy"
        docker-compose logs $service
    fi
done

# Run database migrations
print_status "Running database migrations..."
# Add your migration commands here if needed

# Set up SSL certificates (optional)
print_status "Setting up SSL certificates..."
read -p "Do you want to set up SSL certificates with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    # Update docker-compose.yml to uncomment SSL configuration
fi

# Set up automatic backups
print_status "Setting up automatic backups..."
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/todo-app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U supabase_admin postgres > $BACKUP_DIR/db_backup_$DATE.sql

# Backup storage
tar -czf $BACKUP_DIR/storage_backup_$DATE.tar.gz volumes/storage/data/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/todo-app << 'EOF'
/opt/todo-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart todo-backend
    endscript
}
EOF

# Print deployment summary
print_success "Deployment completed successfully!"
echo
echo "🎉 Todo App is now running in production!"
echo
echo "📋 Service URLs:"
echo "   - Frontend: http://localhost"
echo "   - API: http://localhost/api"
echo "   - Supabase Studio: http://localhost:4000"
echo
echo "🔧 Management Commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Update app: git pull && docker-compose build && docker-compose up -d"
echo
echo "📁 Important Files:"
echo "   - Configuration: $APP_DIR/.env"
echo "   - Logs: $APP_DIR/logs/"
echo "   - Data: $APP_DIR/volumes/"
echo "   - Backups: $APP_DIR/backups/"
echo
echo "🔒 Security Notes:"
echo "   - Change default passwords in .env"
echo "   - Configure SSL certificates for production"
echo "   - Regularly update Docker images"
echo "   - Monitor logs for suspicious activity"
echo
print_warning "Remember to log out and log back in to apply docker group membership!"
