import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getSpeedColor, formatSpeed } from '../lib/utils';
import 'leaflet/dist/leaflet.css';

// African country coordinates (approximate centroids)
const COUNTRY_COORDS = {
  'ZA': [-30.5595, 22.9375],
  'EG': [26.8206, 30.8025],
  'NG': [9.0820, 8.6753],
  'KE': [-0.0236, 37.9062],
  'GH': [7.9465, -1.0232],
  'TZ': [-6.3690, 34.8888],
  'UG': [1.3733, 32.2903],
  'MA': [31.7917, -7.0926],
  'DZ': [28.0339, 1.6596],
  'TN': [33.8869, 9.5375],
  'ET': [9.1450, 40.4897],
  'ZM': [-13.1339, 27.8493],
  'ZW': [-19.0154, 29.1549],
  'BW': [-22.3285, 24.6849],
  'SN': [14.4974, -14.4524],
  'CI': [7.5400, -5.5471],
  'CM': [7.3697, 12.3547],
  'MZ': [-18.6657, 35.5296],
  'RW': [-1.9403, 29.8739],
  'MW': [-13.2543, 34.3015],
};

function MapUpdater({ countries }) {
  const map = useMap();
  
  useEffect(() => {
    if (countries && countries.length > 0) {
      // Fit bounds to show all of Africa
      map.setView([0, 20], 3);
    }
  }, [countries, map]);
  
  return null;
}

export function AfricaMap({ countries, onCountryClick }) {
  const [mapReady, setMapReady] = useState(false);

  const getMarkerSize = (speed) => {
    if (speed >= 50) return 12;
    if (speed >= 25) return 10;
    if (speed >= 10) return 8;
    return 6;
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[0, 20]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater countries={countries} />
        
        {countries && countries.map((country) => {
          const coords = COUNTRY_COORDS[country.country_code];
          if (!coords) return null;
          
          const speed = country.avg_download_speed || 0;
          
          return (
            <CircleMarker
              key={country.country_code}
              center={coords}
              radius={getMarkerSize(speed)}
              fillColor={getSpeedColor(speed)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
              eventHandlers={{
                click: () => onCountryClick && onCountryClick(country),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold text-base mb-1">{country.country_name}</h3>
                  <p><strong>Avg Speed:</strong> {formatSpeed(speed)}</p>
                  <p><strong>Tests:</strong> {country.test_count?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
