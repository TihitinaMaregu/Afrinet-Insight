# Afrinet Insight - Architecture Documentation

## System Overview

Afrinet Insight is a full-stack web application that visualizes internet performance data across Africa using data from Measurement Lab (M-Lab) stored in Google BigQuery.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Application (Vite)                            │  │
│  │  - Interactive Map (Leaflet)                         │  │
│  │  - Charts (Recharts)                                 │  │
│  │  - Filters & Controls                                │  │
│  │  - ISP Comparison                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ HTTP/REST                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Flask REST API                                      │  │
│  │  - /api/countries                                    │  │
│  │  - /api/cities/:country                              │  │
│  │  - /api/isps/:country                                │  │
│  │  - /api/timeseries                                   │  │
│  │  - /api/compare-isps                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  BigQuery Client                                     │  │
│  │  - Query builder                                     │  │
│  │  - Data aggregation                                  │  │
│  │  - Result formatting                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Google BigQuery                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  M-Lab Dataset                                       │  │
│  │  measurement-lab.ndt.unified_downloads               │  │
│  │  - Download speeds                                   │  │
│  │  - Latency measurements                              │  │
│  │  - Packet loss data                                  │  │
│  │  - Geographic information                            │  │
│  │  - ISP information                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **Leaflet**: Interactive maps
- **React Leaflet**: React bindings for Leaflet
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **date-fns**: Date manipulation

### Backend
- **Flask**: Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Google Cloud BigQuery**: Data warehouse and query engine
- **Python-dotenv**: Environment variable management
- **Gunicorn**: Production WSGI server

### Data Source
- **Measurement Lab (M-Lab)**: Open internet performance dataset
- **Google BigQuery**: Public dataset hosting

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── Header.jsx              # App header with branding
│   ├── FilterPanel.jsx         # Country/City/ISP/Date filters
│   ├── AfricaMap.jsx           # Interactive Leaflet map
│   ├── TrendChart.jsx          # Time series line charts
│   ├── ISPComparison.jsx       # ISP comparison feature
│   ├── StatsCard.jsx           # Metric display cards
│   ├── Card.jsx                # Reusable card components
│   ├── Button.jsx              # Button component
│   ├── Select.jsx              # Select dropdown component
│   └── Input.jsx               # Input component
├── lib/
│   ├── api.js                  # API client functions
│   └── utils.js                # Utility functions
├── App.jsx                     # Main application component
├── main.jsx                    # Application entry point
└── index.css                   # Global styles
```

### Backend Structure

```
backend/
├── app.py                      # Flask application & routes
├── bigquery_client.py          # BigQuery query logic
├── requirements.txt            # Python dependencies
└── .env.example                # Environment variables template
```

## Data Flow

### 1. Initial Load
```
User opens dashboard
    ↓
Frontend requests /api/countries
    ↓
Backend queries BigQuery for country overview
    ↓
BigQuery aggregates data by country
    ↓
Backend returns JSON response
    ↓
Frontend renders map with country markers
```

### 2. Country Selection
```
User selects country (e.g., South Africa)
    ↓
Frontend requests /api/cities/ZA and /api/isps/ZA
    ↓
Backend queries BigQuery for cities and ISPs
    ↓
Frontend updates filter dropdowns
    ↓
Frontend requests /api/timeseries?country_code=ZA
    ↓
Backend queries time series data
    ↓
Frontend renders trend charts
```

### 3. ISP Comparison
```
User selects city and multiple ISPs
    ↓
Frontend sends POST to /api/compare-isps
    ↓
Backend queries detailed metrics for each ISP
    ↓
Frontend renders comparison charts and tables
```

## API Endpoints

### GET /api/countries
Returns overview of all African countries with average speeds.

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "country_code": "ZA",
      "country_name": "South Africa",
      "avg_download_speed": 45.23,
      "avg_latency": 28.5,
      "avg_packet_loss": 0.012,
      "test_count": 125000
    }
  ],
  "count": 54
}
```

### GET /api/cities/:country_code
Returns cities for a specific country.

**Query Parameters:**
- `start_date` (optional)
- `end_date` (optional)

### GET /api/isps/:country_code
Returns ISPs for a specific country/city.

**Query Parameters:**
- `city` (optional)
- `start_date` (optional)
- `end_date` (optional)

### GET /api/timeseries
Returns time series data for trend analysis.

**Query Parameters:**
- `country_code` (optional)
- `city` (optional)
- `isp` (optional)
- `start_date` (optional)
- `end_date` (optional)

### POST /api/compare-isps
Compares multiple ISPs in a specific city.

**Request Body:**
```json
{
  "country_code": "ZA",
  "city": "Cape Town",
  "isps": ["Vodacom", "MTN", "AfriHos"],
  "start_date": "2024-01-01",
  "end_date": "2024-07-31"
}
```

## Database Schema (BigQuery)

The M-Lab dataset uses the following relevant fields:

```sql
measurement-lab.ndt.unified_downloads
├── date                        # Test date
├── a.MeanThroughputMbps       # Download speed in Mbps
├── a.MinRTT                   # Minimum round-trip time (latency)
├── a.LossRate                 # Packet loss rate
├── client.Geo.CountryCode     # ISO country code
├── client.Geo.CountryName     # Country name
├── client.Geo.City            # City name
├── client.Geo.ContinentCode   # Continent code (AF for Africa)
└── client.Network.ASName      # ISP/Network name
```

## State Management

The application uses React's built-in state management:

- **useState**: Component-level state
- **useEffect**: Side effects and data fetching
- **Props**: Parent-to-child data flow

### Key State Variables

```javascript
// Filters
const [selectedCountry, setSelectedCountry] = useState('');
const [selectedCity, setSelectedCity] = useState('');
const [selectedISP, setSelectedISP] = useState('');
const [startDate, setStartDate] = useState(/* 3 months ago */);
const [endDate, setEndDate] = useState(/* today */);

// Data
const [countries, setCountries] = useState([]);
const [cities, setCities] = useState([]);
const [isps, setISPs] = useState([]);
const [timeSeriesData, setTimeSeriesData] = useState([]);

// UI State
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [activeMetric, setActiveMetric] = useState('speed');
```

## Performance Considerations

### Frontend Optimization
- **Code splitting**: Vite automatically splits code
- **Lazy loading**: Components loaded on demand
- **Memoization**: Use React.memo for expensive components
- **Debouncing**: Debounce filter changes to reduce API calls

### Backend Optimization
- **Query optimization**: Use appropriate WHERE clauses and LIMIT
- **Caching**: Implement Redis for frequently accessed data
- **Connection pooling**: Reuse BigQuery client connections
- **Pagination**: Limit result sizes

### BigQuery Optimization
- **Partitioning**: Queries filtered by date use partitioned tables
- **Clustering**: Data clustered by country for faster queries
- **Aggregation**: Pre-aggregate data where possible
- **LIMIT clauses**: Always limit result sizes

## Security Considerations

### Backend
- **CORS**: Configured to allow only specific origins in production
- **Environment variables**: Sensitive data stored in .env
- **Service account**: Limited permissions (read-only BigQuery access)
- **Input validation**: Validate all user inputs
- **Rate limiting**: Implement rate limiting in production

### Frontend
- **API keys**: No sensitive keys exposed in frontend code
- **XSS protection**: React automatically escapes content
- **HTTPS**: Use HTTPS in production
- **Content Security Policy**: Implement CSP headers

## Deployment Architecture

### Development
```
localhost:5173 (Frontend) → localhost:5000 (Backend) → BigQuery
```

### Production
```
CDN (Frontend) → Load Balancer → API Servers (Backend) → BigQuery
                                      ↓
                                   Cache Layer
```

## Monitoring & Logging

### Backend Logging
- Request/response logging
- Error tracking
- Query performance metrics
- BigQuery usage monitoring

### Frontend Monitoring
- Error boundary for React errors
- API call monitoring
- User interaction tracking
- Performance metrics (Core Web Vitals)

## Future Enhancements

1. **Caching Layer**: Redis for frequently accessed data
2. **Real-time Updates**: WebSocket for live data
3. **User Authentication**: Save preferences and custom views
4. **Advanced Analytics**: ML-based predictions and anomaly detection
5. **Export Features**: CSV/PDF report generation
6. **Mobile App**: React Native version
7. **Offline Support**: Service workers and local caching
8. **Multi-language**: i18n support for African languages

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to the architecture.
