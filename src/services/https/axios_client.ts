import axios, { AxiosError } from 'axios';
import { IError } from 'models/error';
import { localStorageToken } from 'services/cache';
import { handleTokenError } from '../cache/index';
import { renewToken } from './renew_token';

// Define the refresh URL and base URL
export const refreshURL = '/api/v1/auth/refresh';
export const baseURL = (typeof process !== 'undefined' && process.env?.VITE_BASE_URL) || 'http://localhost:8080';

// Function to set up axios instance with interceptors
const createAxiosInstance = (headers: Record<string, string>) => {
  const instance = axios.create({
    baseURL: baseURL,
    headers: headers,
  });

  let retryCounter = 0; // Counter to track the number of retry attempts

  // Add a request interceptor to include token in requests
  instance.interceptors.request.use(
    async (config) => {
      if (localStorageToken.getAccessToken() && config.url !== refreshURL) {
        config.headers['Authorization'] =
          `Bearer ${localStorageToken.getAccessToken()}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercept responses to handle token refresh and logout on UNAUTHENTICATED errors
  instance.interceptors.response.use(
    async (response) => {
      return response;
    },
    async (error) => {
      const axiosError = error as AxiosError<IError>;
      // Handle UNAUTHENTICATED errors
      if (axios.isAxiosError(error) || error.response) {
        const originalRequest = error?.config;
        const errStatus = axiosError?.response?.data?.error?.status;
        const errNetWorking = axiosError.message;

        if (
          errNetWorking === 'timeout exceeded' ||
          errNetWorking === 'Network Error'
        ) {
          handleTokenError();
          // createBrowserHistory().push('/login');
          return Promise.reject(axiosError);
        }

        if (
          errStatus === 'UNAUTHENTICATED' &&
          !localStorageToken.getRefreshToken()
        ) {
          handleTokenError();
          // createBrowserHistory().push('/login');
          return Promise.reject(error);
        }

        if (
          errStatus === 'UNAUTHENTICATED' &&
          retryCounter <= 1 && // Maximum number of retry attempts
          !originalRequest._retry &&
          originalRequest.url !== refreshURL &&
          localStorageToken.getRefreshToken() &&
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login' &&
          errNetWorking !== 'Network Error'
        ) {
          retryCounter++; // Increment the retry counter
          originalRequest._retry = true;
          try {
            const resResNewToken = await renewToken({
              refreshToken: localStorageToken.getRefreshToken(),
            });
            localStorageToken.setToken(resResNewToken);
            originalRequest._retry = false;
            return instance(originalRequest);
          } catch (error) {
            handleTokenError();
            // createBrowserHistory().push('/login');
            return Promise.reject(error);
          }
        }
      }

      // Reset retry counter if the request is not retried
      retryCounter = 0;
      return Promise.reject(axiosError);
    }
  );

  return instance;
};

// Create baseInstance with JSON headers
const baseInstance = createAxiosInstance({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

// Create baseInstanceFormData with form data headers
const baseInstanceFormData = createAxiosInstance({
  Accept: 'application/json',
  'Content-Type': 'multipart/form-data',
});

export { baseInstance, baseInstanceFormData };
