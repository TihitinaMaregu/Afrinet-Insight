# Deployment Guide

This guide covers various deployment options for Afrinet Insight.

## Option 1: Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Google Cloud credentials JSON file

### Steps

1. **Update docker-compose.yml**
   ```yaml
   # Update the credentials path in docker-compose.yml
   volumes:
     - /absolute/path/to/credentials.json:/app/credentials.json:ro
   ```

2. **Build and run**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

## Option 2: Google Cloud Run

### Backend Deployment

1. **Build and push Docker image**
   ```bash
   cd backend
   
   # Set your project ID
   export PROJECT_ID=your-project-id
   
   # Build image
   docker build -t gcr.io/$PROJECT_ID/afrinet-backend .
   
   # Push to Container Registry
   docker push gcr.io/$PROJECT_ID/afrinet-backend
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy afrinet-backend \
     --image gcr.io/$PROJECT_ID/afrinet-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
   ```

3. **Note the service URL** (e.g., https://afrinet-backend-xxx.run.app)

### Frontend Deployment

1. **Update API URL**
   ```bash
   cd frontend
   echo "VITE_API_URL=https://afrinet-backend-xxx.run.app/api" > .env
   ```

2. **Build the frontend**
   ```bash
   npm run build
   ```

3. **Deploy to Firebase Hosting**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login
   firebase login
   
   # Initialize
   firebase init hosting
   # Select your project
   # Set public directory to: dist
   # Configure as single-page app: Yes
   
   # Deploy
   firebase deploy --only hosting
   ```

## Option 3: Heroku

### Backend

1. **Create Heroku app**
   ```bash
   cd backend
   heroku create afrinet-backend
   ```

2. **Add buildpack**
   ```bash
   heroku buildpacks:set heroku/python
   ```

3. **Set environment variables**
   ```bash
   # Upload credentials as base64
   cat credentials.json | base64 > credentials.b64
   heroku config:set GOOGLE_CREDENTIALS_BASE64="$(cat credentials.b64)"
   ```

4. **Create Procfile**
   ```
   web: gunicorn app:app
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend

Deploy to Vercel, Netlify, or similar:

**Vercel:**
```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

## Option 4: VPS (DigitalOcean, AWS EC2, etc.)

### Setup

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python
   sudo apt install -y python3 python3-pip python3-venv
   
   # Install nginx
   sudo apt install -y nginx
   
   # Install certbot for SSL
   sudo apt install -y certbot python3-certbot-nginx
   ```

3. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/afrinet-insight.git
   cd afrinet-insight
   ```

4. **Setup backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Copy credentials
   # Upload your credentials.json to the server
   
   # Create systemd service
   sudo nano /etc/systemd/system/afrinet-backend.service
   ```

   **afrinet-backend.service:**
   ```ini
   [Unit]
   Description=Afrinet Insight Backend
   After=network.target

   [Service]
   User=your-user
   WorkingDirectory=/home/your-user/afrinet-insight/backend
   Environment="PATH=/home/your-user/afrinet-insight/backend/venv/bin"
   Environment="GOOGLE_APPLICATION_CREDENTIALS=/home/your-user/afrinet-insight/backend/credentials.json"
   ExecStart=/home/your-user/afrinet-insight/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable afrinet-backend
   sudo systemctl start afrinet-backend
   ```

5. **Setup frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   
   # Copy to nginx directory
   sudo cp -r dist/* /var/www/afrinet/
   ```

6. **Configure nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/afrinet
   ```

   **nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/afrinet;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/afrinet /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Variables

### Backend
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to credentials JSON
- `FLASK_ENV`: production/development
- `PORT`: Server port (default: 5000)

### Frontend
- `VITE_API_URL`: Backend API URL

## Monitoring

### Health Checks

**Backend:**
```bash
curl http://your-backend-url/api/health
```

**Frontend:**
```bash
curl http://your-frontend-url/health
```

### Logs

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Systemd:**
```bash
sudo journalctl -u afrinet-backend -f
```

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy, or cloud load balancer)
- Deploy multiple backend instances
- Use Redis for session management

### Caching
- Implement Redis for API response caching
- Use CDN for frontend assets
- Enable browser caching

### Database
- Consider caching frequent BigQuery results
- Use materialized views for common queries
- Implement query result pagination

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] CORS configured for production domains only
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] Credentials file permissions restricted (chmod 600)
- [ ] Regular dependency updates
- [ ] Firewall configured
- [ ] Monitoring and alerting setup

## Backup

### Credentials
- Store credentials securely (e.g., Google Secret Manager)
- Keep encrypted backups

### Configuration
- Version control all configuration files
- Document environment-specific settings

## Troubleshooting

### Backend not starting
- Check credentials file path
- Verify BigQuery API is enabled
- Check service account permissions
- Review logs for errors

### Frontend can't connect to backend
- Verify CORS settings
- Check API URL configuration
- Ensure backend is running
- Check firewall rules

### Slow queries
- Review BigQuery query performance
- Implement caching
- Optimize date ranges
- Add query limits

## Cost Optimization

### BigQuery
- Monitor query costs in Google Cloud Console
- Implement caching to reduce queries
- Use appropriate date ranges
- Set up billing alerts

### Cloud Services
- Use auto-scaling based on traffic
- Implement CDN for static assets
- Choose appropriate instance sizes
- Monitor and optimize resource usage

## Support

For deployment issues, check:
1. Application logs
2. Server logs
3. Network connectivity
4. Firewall rules
5. Environment variables
6. Service status

For further assistance, open an issue on GitHub.
