# Afrinet Insight 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000.svg)](https://flask.palletsprojects.com/)

An interactive dashboard for visualizing internet performance data across Africa, making Measurement Lab data from Google BigQuery accessible and easy to understand.

![Dashboard Preview](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Afrinet+Insight+Dashboard)

## Features

- 🗺️ **Interactive Map**: Visual overview of average download speeds across African countries
- 📊 **Trend Analysis**: Time-series graphs showing performance metrics over time
- 🔍 **Multi-level Filtering**: Filter by country, city, ISP, and custom timeframes
- ⚖️ **ISP Comparison**: Side-by-side comparison of internet service providers in specific cities
- 📈 **Key Metrics**: Download/upload speeds, packet loss, latency, and more

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Recharts for data visualization
- Leaflet for interactive maps
- shadcn/ui for UI components
- Lucide React for icons

### Backend
- Python Flask API
- Google BigQuery integration
- CORS support for local development



## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Google Cloud account with BigQuery access
- BigQuery API credentials

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up Google Cloud credentials:
   - Create a service account in Google Cloud Console
   - Download the JSON key file
   - Set the environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"
```

5. Run the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Usage

1. **Select a Country**: Choose from the dropdown to filter data by country (e.g., South Africa)
2. **Drill Down to Cities**: Select specific cities like Cape Town or Johannesburg
3. **Filter by ISP**: Compare performance across providers like Vodacom, MTN, or AfriHos
4. **Adjust Timeframe**: Use date pickers to analyze specific periods
5. **View Trends**: Explore graphs showing speed changes over time
6. **Compare ISPs**: Use the comparison view to see side-by-side metrics

## Data Source

This project uses data from [Measurement Lab (M-Lab)](https://www.measurementlab.net/), the largest open internet performance dataset. The data is queried from Google BigQuery's public dataset: `measurement-lab.ndt.unified_downloads`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## Acknowledgments

- Measurement Lab for providing open internet performance data
- Google BigQuery for hosting the public dataset
