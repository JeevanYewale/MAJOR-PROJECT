# 🚀 TravelStay Deployment Guide

Complete guide to deploy your TravelStay application to production.

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database seeded with initial data
- [ ] Error handling implemented
- [ ] Security middleware enabled
- [ ] Performance optimizations applied

### ✅ Production Requirements
- [ ] Domain name registered
- [ ] SSL certificate obtained
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account configured
- [ ] Email service configured
- [ ] Server/hosting platform selected

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for beginners)

#### Step 1: Prepare for Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name
```

#### Step 2: Configure Environment Variables
```bash
# Set all environment variables
heroku config:set MONGO_URL="your-mongodb-atlas-url"
heroku config:set SESSION_SECRET="your-session-secret"
heroku config:set CLOUD_NAME="your-cloudinary-name"
heroku config:set CLOUD_API_KEY="your-cloudinary-key"
heroku config:set CLOUD_API_SECRET="your-cloudinary-secret"
heroku config:set EMAIL_USER="your-email"
heroku config:set EMAIL_PASS="your-email-password"
heroku config:set NODE_ENV="production"
```

#### Step 3: Deploy
```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/your-app-name.git

# Deploy
git add .
git commit -m "Deploy to production"
git push heroku main
```

### Option 2: DigitalOcean Droplet

#### Step 1: Create Droplet
1. Create Ubuntu 20.04 droplet
2. Connect via SSH
3. Update system packages

```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 2: Install Dependencies
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MongoDB (optional - use Atlas instead)
# Follow MongoDB installation guide
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone your-repository-url
cd MAJOR PROJECT

# Install dependencies
npm install --production

# Create environment file
sudo nano .env
# Add all production environment variables

# Start with PM2
pm2 start app.js --name "travelstay"
pm2 startup
pm2 save
```

#### Step 4: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/travelstay
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/travelstay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 3: AWS EC2

#### Step 1: Launch EC2 Instance
1. Choose Ubuntu 20.04 AMI
2. Select t2.micro (free tier)
3. Configure security groups (HTTP, HTTPS, SSH)
4. Launch with key pair

#### Step 2: Connect and Setup
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js, PM2, Nginx (same as DigitalOcean)
```

#### Step 3: Configure Domain and SSL
```bash
# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

#### Step 1: Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Choose cloud provider and region
4. Create database user
5. Whitelist IP addresses (0.0.0.0/0 for all)

#### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password

#### Step 3: Seed Database
```bash
# Update MONGO_URL in .env with Atlas connection string
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/wanderlust"

# Run database initialization
node init-db.js
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password in EMAIL_PASS

### SendGrid (Alternative)
```bash
npm install @sendgrid/mail

# Update email service in utils/emailService.js
```

## 🖼️ Image Storage

### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com)
2. Get API credentials from dashboard
3. Configure upload presets
4. Set environment variables

## 🔒 Security Configuration

### SSL Certificate
```bash
# Using Let's Encrypt (free)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Setup
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Environment Security
```bash
# Secure .env file
chmod 600 .env
chown root:root .env
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs travelstay

# Monitor processes
pm2 monit

# Restart application
pm2 restart travelstay
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Performance Optimization

### Enable Gzip Compression
```nginx
# Add to Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Static File Caching
```nginx
# Add to Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Indexing
```javascript
// Add indexes for better performance
db.listings.createIndex({ location: "text", title: "text" })
db.listings.createIndex({ price: 1 })
db.listings.createIndex({ createdAt: -1 })
db.bookings.createIndex({ user: 1, createdAt: -1 })
```

## 🚨 Backup Strategy

### Database Backup
```bash
# MongoDB Atlas automatic backups enabled by default

# Manual backup
mongodump --uri="your-mongodb-atlas-uri" --out=backup-$(date +%Y%m%d)
```

### File Backup
```bash
# Create backup script
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/your/app
# Upload to cloud storage
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Multiple server instances
- Session store (Redis)
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching (Redis)
- Use database read replicas

## 🔍 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs travelstay

# Check environment variables
pm2 env 0

# Restart application
pm2 restart travelstay
```

#### Database Connection Issues
```bash
# Test MongoDB connection
node -e "require('mongoose').connect('your-mongo-url').then(() => console.log('Connected')).catch(err => console.log(err))"
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

### Performance Issues
```bash
# Monitor server resources
htop
df -h
free -m

# Check application performance
pm2 monit
```

## 📞 Support

### Deployment Support
- Check server logs first
- Verify environment variables
- Test database connectivity
- Check firewall settings

### Monitoring Tools
- PM2 for process monitoring
- Nginx logs for web server issues
- MongoDB Atlas monitoring
- Cloudinary usage dashboard

## 🎯 Post-Deployment

### Final Checklist
- [ ] Application accessible via domain
- [ ] SSL certificate working
- [ ] All features functional
- [ ] Database populated
- [ ] Email notifications working
- [ ] Image uploads working
- [ ] Admin panel accessible
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Backups scheduled

### Maintenance
- Regular security updates
- Monitor server resources
- Check application logs
- Update dependencies
- Backup data regularly

---

**🎉 Congratulations! Your TravelStay application is now live in production!**