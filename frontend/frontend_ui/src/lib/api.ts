import axios from 'axios';

// Intention Store API client
export const intentionApi = axios.create({
  baseURL: import.meta.env.VITE_INTENTION_STORE_URL ?? 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Sync Service API client
export const syncApi = axios.create({
  baseURL: import.meta.env.VITE_SYNC_SERVICE_URL ?? 'http://localhost:8081',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

function normaliseError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return Promise.reject({
      status: error.response?.status,
      code: error.response?.data?.errorCode,
      message:
        error.response?.data?.message ??
        error.response?.data?.error?.message ??
        error.message,
    });
  }
  return Promise.reject(error);
}

intentionApi.interceptors.response.use(
  (response) => response.data,
  normaliseError,
);

syncApi.interceptors.response.use(
  (response) => response.data,
  normaliseError,
);

/** Attach a Bearer token to both API clients. */
export function setAuthToken(token: string | null) {
  const header = token ? `Bearer ${token}` : '';
  intentionApi.defaults.headers.common['Authorization'] = header;
  syncApi.defaults.headers.common['Authorization'] = header;
}
