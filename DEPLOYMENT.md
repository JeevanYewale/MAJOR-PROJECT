# Deployment Guide

## Prerequisites

- Node.js 14+
- MongoDB Atlas account
- Cloudinary account
- Email service (Gmail/SendGrid)
- Hosting platform (Heroku/AWS/DigitalOcean)

## Environment Setup

1. Create `.env` file with production variables:
```
NODE_ENV=production
MONGO_URL=your_mongodb_atlas_url
SESSION_SECRET=strong_random_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
PORT=8080
```

## Local Testing

```bash
npm install
npm run setup
npm test
npm start
```

## Deployment Steps

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create app-name`
4. Set environment: `heroku config:set NODE_ENV=production`
5. Deploy: `git push heroku main`
6. View logs: `heroku logs --tail`

### AWS EC2

1. Launch Ubuntu instance
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Start with PM2: `pm2 start app.js`
7. Setup Nginx reverse proxy

### DigitalOcean

1. Create Droplet (Ubuntu)
2. SSH into droplet
3. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -`
4. Clone and setup project
5. Use PM2 for process management
6. Configure Nginx

## Database Migration

```bash
# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/wanderlust"

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/wanderlust" dump/
```

## SSL Certificate

Use Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

## Monitoring

- Use PM2 Plus for monitoring
- Setup error tracking (Sentry)
- Monitor database performance
- Setup uptime monitoring

## Backup Strategy

- Daily MongoDB backups
- Weekly full backups
- Store in S3/Cloud Storage
- Test restore procedures

## Performance Optimization

- Enable gzip compression
- Use CDN for static files
- Implement caching
- Optimize database queries
- Use load balancing

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation active
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Regular security updates

## Rollback Plan

1. Keep previous version deployed
2. Use blue-green deployment
3. Have database backups ready
4. Document rollback procedures
5. Test rollback process regularly
