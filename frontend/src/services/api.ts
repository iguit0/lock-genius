import axios, { AxiosInstance } from 'axios';

import { API_BASE_URL } from '@/common/constants/env';

const API_URL = API_BASE_URL || '';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
