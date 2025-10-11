import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCountries = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/countries', { params });
  return response.data;
};

export const fetchCountryDetails = async (countryCode, startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get(`/country/${countryCode}`, { params });
  return response.data;
};

export const fetchCities = async (countryCode, startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get(`/cities/${countryCode}`, { params });
  return response.data;
};

export const fetchISPs = async (countryCode, city, startDate, endDate) => {
  const params = {};
  if (city) params.city = city;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get(`/isps/${countryCode}`, { params });
  return response.data;
};

export const fetchTimeSeries = async (filters) => {
  const params = {};
  if (filters.countryCode) params.country_code = filters.countryCode;
  if (filters.city) params.city = filters.city;
  if (filters.isp) params.isp = filters.isp;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  
  const response = await api.get('/timeseries', { params });
  return response.data;
};

export const compareISPs = async (countryCode, city, isps, startDate, endDate) => {
  const response = await api.post('/compare-isps', {
    country_code: countryCode,
    city,
    isps,
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
};

export default api;
