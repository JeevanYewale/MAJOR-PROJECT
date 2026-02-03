# Docker Setup Guide

## Prerequisites

- Docker installed
- Docker Compose installed

## Development with Docker

### Start Services

```bash
docker-compose up
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f app
```

### Run Commands

```bash
# Run tests
docker-compose exec app npm test

# Initialize database
docker-compose exec app npm run init-db

# Access MongoDB
docker-compose exec mongo mongosh
```

## Production Deployment

### Build Image

```bash
docker build -t travelstay:latest .
```

### Run Container

```bash
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e MONGO_URL=mongodb://mongo:27017/wanderlust \
  -e SESSION_SECRET=your_secret \
  --name travelstay \
  travelstay:latest
```

### Push to Registry

```bash
# Docker Hub
docker tag travelstay:latest username/travelstay:latest
docker push username/travelstay:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag travelstay:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/travelstay:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/travelstay:latest
```

## Kubernetes Deployment

### Create Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: travelstay
spec:
  replicas: 3
  selector:
    matchLabels:
      app: travelstay
  template:
    metadata:
      labels:
        app: travelstay
    spec:
      containers:
      - name: travelstay
        image: travelstay:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: travelstay-secrets
              key: mongo-url
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs app
```

### Port already in use
```bash
docker-compose down
# or change port in docker-compose.yml
```

### Database connection issues
```bash
docker-compose exec mongo mongosh
```

## Best Practices

- Use specific Node.js versions
- Keep images small (Alpine Linux)
- Use environment variables for config
- Implement health checks
- Use volumes for persistent data
- Tag images with versions
- Use private registries for production
