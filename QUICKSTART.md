# Quick Start Guide

Get Afrinet Insight running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- Google Cloud account with BigQuery access
- Service account JSON credentials file

## Step 1: Get Your Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable BigQuery API
4. Create a service account with "BigQuery Data Viewer" role
5. Download the JSON credentials file

## Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set credentials path
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"

# Start the server
python app.py
```

Backend will run at: http://localhost:5000

## Step 3: Setup Frontend (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run at: http://localhost:5173

## Step 4: Open Dashboard

Open your browser and go to: **http://localhost:5173**

You should see:
- ✅ Interactive map of Africa
- ✅ Country statistics cards
- ✅ Filter panel on the left
- ✅ Trend charts

## Test the Features

1. **View Overview**: See all African countries on the map
2. **Select Country**: Click "South Africa" in the dropdown
3. **Select City**: Choose "Cape Town" from the cities dropdown
4. **View Trends**: See download speed trends over time
5. **Compare ISPs**: If multiple ISPs available, compare them side-by-side

## Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on port 5000
- Check terminal for error messages

### "No data showing"
- Wait a few seconds (BigQuery queries take time)
- Check backend terminal for errors
- Verify your credentials are correct

### "Module not found" (Backend)
- Activate virtual environment: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`

### "Command not found: npm"
- Install Node.js from https://nodejs.org/

## Next Steps

- Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Need Help?

- Check the [README.md](README.md) for more information
- Review error messages in both terminal windows
- Ensure all prerequisites are installed

Enjoy exploring internet performance across Africa! 🌍
