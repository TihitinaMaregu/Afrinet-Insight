import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Select } from './Select';
import { compareISPs } from '../lib/api';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatSpeed, formatLatency, formatPacketLoss } from '../lib/utils';

export function ISPComparison({ countryCode, city, availableISPs, startDate, endDate }) {
  const [selectedISPs, setSelectedISPs] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleISPToggle = (isp) => {
    setSelectedISPs(prev => {
      if (prev.includes(isp)) {
        return prev.filter(i => i !== isp);
      } else if (prev.length < 5) {
        return [...prev, isp];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedISPs.length < 2) {
      setError('Please select at least 2 ISPs to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await compareISPs(countryCode, city, selectedISPs, startDate, endDate);
      setComparisonData(result.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparisonData?.map(isp => ({
    name: isp.isp.length > 20 ? isp.isp.substring(0, 20) + '...' : isp.isp,
    fullName: isp.isp,
    'Avg Speed': parseFloat(isp.avg_download_speed?.toFixed(2) || 0),
    'Median Speed': parseFloat(isp.median_download_speed?.toFixed(2) || 0),
    'Latency': parseFloat(isp.avg_latency?.toFixed(2) || 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>ISP Comparison - {city}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ISP Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select ISPs to Compare (2-5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableISPs?.slice(0, 10).map((ispData) => (
                <label
                  key={ispData.isp}
                  className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                    selectedISPs.includes(ispData.isp)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedISPs.includes(ispData.isp)}
                    onChange={() => handleISPToggle(ispData.isp)}
                    disabled={!selectedISPs.includes(ispData.isp) && selectedISPs.length >= 5}
                    className="rounded"
                  />
                  <span className="text-sm truncate">{ispData.isp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Compare Button */}
          <Button
            onClick={handleCompare}
            disabled={selectedISPs.length < 2 || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing...
              </>
            ) : (
              `Compare ${selectedISPs.length} ISPs`
            )}
          </Button>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}

          {/* Comparison Results */}
          {comparisonData && comparisonData.length > 0 && (
            <div className="space-y-6 mt-6">
              {/* Speed Comparison Chart */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Download Speed Comparison</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis label={{ value: 'Speed (Mbps)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value, name) => [value + ' Mbps', name]}
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.name === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Avg Speed" fill="#3b82f6" />
                    <Bar dataKey="Median Speed" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Metrics Table */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Detailed Metrics</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">ISP</th>
                        <th className="text-right p-2">Avg Speed</th>
                        <th className="text-right p-2">Median Speed</th>
                        <th className="text-right p-2">Latency</th>
                        <th className="text-right p-2">Packet Loss</th>
                        <th className="text-right p-2">Tests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((isp, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{isp.isp}</td>
                          <td className="text-right p-2">{formatSpeed(isp.avg_download_speed)}</td>
                          <td className="text-right p-2">{formatSpeed(isp.median_download_speed)}</td>
                          <td className="text-right p-2">{formatLatency(isp.avg_latency)}</td>
                          <td className="text-right p-2">{formatPacketLoss(isp.avg_packet_loss)}</td>
                          <td className="text-right p-2">{isp.test_count?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Winner Highlight */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Best Performer</h4>
                </div>
                <p className="text-sm">
                  <strong>{comparisonData[0]?.isp}</strong> has the highest average download speed 
                  at <strong>{formatSpeed(comparisonData[0]?.avg_download_speed)}</strong> in {city}.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
