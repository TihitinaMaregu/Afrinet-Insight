import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Select } from './Select';
import { Input } from './Input';
import { Button } from './Button';
import { Filter, X } from 'lucide-react';

export function FilterPanel({
  countries,
  cities,
  isps,
  selectedCountry,
  selectedCity,
  selectedISP,
  startDate,
  endDate,
  onCountryChange,
  onCityChange,
  onISPChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
          {(selectedCountry || selectedCity || selectedISP) && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Country Filter */}
        <div>
          <label className="text-sm font-medium mb-1 block">Country</label>
          <Select
            value={selectedCountry || ''}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries?.map((country) => (
              <option key={country.country_code} value={country.country_code}>
                {country.country_name}
              </option>
            ))}
          </Select>
        </div>

        {/* City Filter */}
        {selectedCountry && cities && cities.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">City</label>
            <Select
              value={selectedCity || ''}
              onChange={(e) => onCityChange(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* ISP Filter */}
        {selectedCountry && isps && isps.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">ISP</label>
            <Select
              value={selectedISP || ''}
              onChange={(e) => onISPChange(e.target.value)}
            >
              <option value="">All ISPs</option>
              {isps.map((isp) => (
                <option key={isp.isp} value={isp.isp}>
                  {isp.isp}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Date Range */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-sm font-medium">Time Period</h4>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              max={endDate}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
