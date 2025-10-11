import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { AfricaMap } from './components/AfricaMap';
import { TrendChart } from './components/TrendChart';
import { ISPComparison } from './components/ISPComparison';
import { StatsCard } from './components/StatsCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './components/Card';
import { fetchCountries, fetchCities, fetchISPs, fetchTimeSeries } from './lib/api';
import { formatSpeed, formatLatency, formatPacketLoss } from './lib/utils';
import { Loader2, Wifi, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

function App() {
  // State management
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [isps, setISPs] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedISP, setSelectedISP] = useState('');
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMetric, setActiveMetric] = useState('speed');

  // Load initial country data
  useEffect(() => {
    loadCountries();
  }, [startDate, endDate]);

  // Load cities when country is selected
  useEffect(() => {
    if (selectedCountry) {
      loadCities();
      loadISPs();
    } else {
      setCities([]);
      setISPs([]);
      setSelectedCity('');
      setSelectedISP('');
    }
  }, [selectedCountry, startDate, endDate]);

  // Load ISPs when city is selected
  useEffect(() => {
    if (selectedCountry && selectedCity) {
      loadISPs();
    }
  }, [selectedCity]);

  // Load time series data when filters change
  useEffect(() => {
    loadTimeSeries();
  }, [selectedCountry, selectedCity, selectedISP, startDate, endDate]);

  const loadCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCountries(startDate, endDate);
      setCountries(result.data || []);
    } catch (err) {
      setError('Failed to load country data. Please check your API connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const result = await fetchCities(selectedCountry, startDate, endDate);
      setCities(result.cities || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  const loadISPs = async () => {
    try {
      const result = await fetchISPs(selectedCountry, selectedCity, startDate, endDate);
      setISPs(result.isps || []);
    } catch (err) {
      console.error('Failed to load ISPs:', err);
    }
  };

  const loadTimeSeries = async () => {
    try {
      const result = await fetchTimeSeries({
        countryCode: selectedCountry,
        city: selectedCity,
        isp: selectedISP,
        startDate,
        endDate,
      });
      setTimeSeriesData(result.data || []);
    } catch (err) {
      console.error('Failed to load time series:', err);
    }
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country.country_code);
    setSelectedCity('');
    setSelectedISP('');
  };

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedCity('');
    setSelectedISP('');
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!countries || countries.length === 0) {
      return {
        avgSpeed: 0,
        avgLatency: 0,
        avgPacketLoss: 0,
        totalTests: 0,
      };
    }

    let data = countries;
    
    if (selectedCountry) {
      data = countries.filter(c => c.country_code === selectedCountry);
    }

    const avgSpeed = data.reduce((sum, c) => sum + (c.avg_download_speed || 0), 0) / data.length;
    const avgLatency = data.reduce((sum, c) => sum + (c.avg_latency || 0), 0) / data.length;
    const avgPacketLoss = data.reduce((sum, c) => sum + (c.avg_packet_loss || 0), 0) / data.length;
    const totalTests = data.reduce((sum, c) => sum + (c.test_count || 0), 0);

    return { avgSpeed, avgLatency, avgPacketLoss, totalTests };
  };

  const stats = calculateStats();

  if (loading && countries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading data from BigQuery...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && countries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Error Loading Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">{error}</p>
                  <p className="text-xs text-muted-foreground">
                    Make sure the backend API is running and BigQuery credentials are configured.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Average Download Speed"
            value={formatSpeed(stats.avgSpeed)}
            subtitle={selectedCountry ? `in ${countries.find(c => c.country_code === selectedCountry)?.country_name}` : 'across Africa'}
            icon={Wifi}
          />
          <StatsCard
            title="Average Latency"
            value={formatLatency(stats.avgLatency)}
            subtitle="Lower is better"
            icon={Clock}
          />
          <StatsCard
            title="Packet Loss"
            value={formatPacketLoss(stats.avgPacketLoss)}
            subtitle="Network reliability"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Total Tests"
            value={stats.totalTests.toLocaleString()}
            subtitle="Data points analyzed"
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              countries={countries}
              cities={cities}
              isps={isps}
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              selectedISP={selectedISP}
              startDate={startDate}
              endDate={endDate}
              onCountryChange={setSelectedCountry}
              onCityChange={setSelectedCity}
              onISPChange={setSelectedISP}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onReset={handleReset}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Internet Speed Across Africa</CardTitle>
                <CardDescription>
                  Click on a country to view detailed statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <AfricaMap
                    countries={countries}
                    onCountryClick={handleCountryClick}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trend Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  {selectedCountry
                    ? `Showing data for ${countries.find(c => c.country_code === selectedCountry)?.country_name}${selectedCity ? ` - ${selectedCity}` : ''}${selectedISP ? ` - ${selectedISP}` : ''}`
                    : 'Showing data for all of Africa'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Metric Selector */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveMetric('speed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMetric === 'speed'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Download Speed
                  </button>
                  <button
                    onClick={() => setActiveMetric('latency')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMetric === 'latency'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Latency
                  </button>
                  <button
                    onClick={() => setActiveMetric('packet_loss')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMetric === 'packet_loss'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Packet Loss
                  </button>
                </div>

                <TrendChart data={timeSeriesData} metric={activeMetric} />
              </CardContent>
            </Card>

            {/* ISP Comparison */}
            {selectedCountry && selectedCity && isps && isps.length >= 2 && (
              <ISPComparison
                countryCode={selectedCountry}
                city={selectedCity}
                availableISPs={isps}
                startDate={startDate}
                endDate={endDate}
              />
            )}

            {/* Data Source Info */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Data Source:</strong> This dashboard uses data from{' '}
                  <a
                    href="https://www.measurementlab.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Measurement Lab (M-Lab)
                  </a>
                  , the largest open internet performance dataset, hosted on Google BigQuery.
                  Data is updated regularly and represents real-world internet performance measurements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ for making internet performance data accessible across Africa
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
