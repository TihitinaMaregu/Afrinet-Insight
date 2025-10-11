# Afrinet Insight - Complete Setup Guide

This guide will walk you through setting up the Afrinet Insight dashboard from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- **Google Cloud Account** - [Sign up here](https://cloud.google.com/)

## Part 1: Google Cloud & BigQuery Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name your project (e.g., "afrinet-insight")
4. Click "Create"

### Step 2: Enable BigQuery API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "BigQuery API"
3. Click on it and press "Enable"

### Step 3: Create Service Account Credentials

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name it (e.g., "afrinet-bigquery-reader")
4. Click "Create and Continue"
5. Grant the role: "BigQuery Data Viewer" and "BigQuery Job User"
6. Click "Continue" → "Done"
7. Click on the newly created service account
8. Go to the "Keys" tab
9. Click "Add Key" → "Create New Key"
10. Choose "JSON" format
11. Click "Create" - this downloads your credentials file
12. **Important**: Save this file securely and never commit it to version control

### Step 4: Verify BigQuery Access

1. Go to BigQuery in the Google Cloud Console
2. In the Explorer panel, search for: `measurement-lab.ndt.unified_downloads`
3. You should see the M-Lab dataset - this confirms you have access

## Part 2: Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set your credentials path
# Replace /path/to/your/credentials.json with the actual path to your downloaded JSON file
```

Example `.env` file:
```
GOOGLE_APPLICATION_CREDENTIALS=/Users/yourname/Downloads/afrinet-bigquery-credentials.json
FLASK_ENV=development
PORT=5000
```

### Step 5: Test the Backend

```bash
python app.py
```

You should see:
```
* Running on http://0.0.0.0:5000
```

Test the API by visiting: http://localhost:5000/api/health

You should see: `{"status": "healthy", "service": "afrinet-insight-api"}`

## Part 3: Frontend Setup

### Step 1: Open a New Terminal

Keep the backend running in the first terminal, and open a new terminal window.

### Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including React, Recharts, Leaflet, and TailwindCSS.

### Step 4: Configure Environment (Optional)

If your backend is running on a different port or host:

```bash
cp .env.example .env
# Edit .env if needed
```

### Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 6: Open the Dashboard

Open your browser and navigate to: http://localhost:5173

## Part 4: Verify Everything Works

### Test the Dashboard Features

1. **Map View**: You should see a map of Africa with colored markers
2. **Country Selection**: Click on a country marker or use the dropdown filter
3. **City Filtering**: Select a country, then choose a city from the dropdown
4. **ISP Filtering**: Select an ISP to see specific provider data
5. **Time Range**: Adjust the date range to see different time periods
6. **Trend Charts**: Switch between Speed, Latency, and Packet Loss metrics
7. **ISP Comparison**: Select a city with multiple ISPs and compare them

### Troubleshooting

#### Backend Issues

**Error: "Could not find credentials"**
- Verify your `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Ensure the JSON file exists and is readable
- Try using an absolute path

**Error: "Permission denied" on BigQuery**
- Verify your service account has "BigQuery Data Viewer" role
- Check that the BigQuery API is enabled in your project

**Error: "Module not found"**
- Ensure you activated the virtual environment
- Run `pip install -r requirements.txt` again

#### Frontend Issues

**Error: "Cannot connect to API"**
- Verify the backend is running on port 5000
- Check the browser console for CORS errors
- Ensure `VITE_API_URL` is set correctly if you changed it

**Map not displaying**
- Check browser console for errors
- Ensure you have an internet connection (map tiles are loaded from OpenStreetMap)

**No data showing**
- Wait a few seconds - BigQuery queries can take time
- Check the backend terminal for error messages
- Verify your date range isn't too restrictive

## Part 5: Building for Production

### Backend Production Deployment

```bash
# Install gunicorn (production server)
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist/` folder.

To preview the production build:
```bash
npm run preview
```

## Part 6: Deployment Options

### Option 1: Deploy to Google Cloud Run (Recommended)

**Backend:**
1. Create a `Dockerfile` in the backend directory
2. Build and push to Google Container Registry
3. Deploy to Cloud Run

**Frontend:**
1. Build the frontend: `npm run build`
2. Deploy to Firebase Hosting or Google Cloud Storage + Cloud CDN

### Option 2: Deploy to Heroku

**Backend:**
- Add a `Procfile`: `web: gunicorn app:app`
- Push to Heroku
- Set environment variables in Heroku dashboard

**Frontend:**
- Deploy to Vercel, Netlify, or similar platforms
- Set the API URL environment variable

### Option 3: VPS Deployment

- Use nginx as a reverse proxy
- Set up SSL with Let's Encrypt
- Use PM2 or systemd to manage processes

## Data Usage & Costs

### BigQuery Costs

- M-Lab dataset is **free to query** (Google provides free access)
- You get **1 TB of free queries per month**
- Each query in this app typically processes 10-100 MB
- Monitor usage in Google Cloud Console → BigQuery → Query History

### Optimization Tips

1. **Cache responses**: Implement Redis or similar caching
2. **Limit date ranges**: Shorter ranges = less data processed
3. **Aggregate data**: Pre-compute common queries
4. **Use materialized views**: Store frequently accessed results

## Next Steps

### Enhancements You Can Add

1. **User Authentication**: Add login to save favorite views
2. **Export Features**: Allow users to download data as CSV/PDF
3. **Real-time Updates**: Add WebSocket support for live data
4. **Mobile App**: Create React Native version
5. **Advanced Analytics**: Add ML-based predictions
6. **Custom Reports**: Let users create and save custom reports
7. **Alerts**: Email notifications for performance changes
8. **More Metrics**: Add upload speeds, jitter, etc.

### Contributing

Feel free to fork this project and submit pull requests with improvements!

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error messages in browser console and terminal
3. Verify all prerequisites are installed correctly
4. Check that your Google Cloud credentials are valid

## License

MIT License - See LICENSE file for details
