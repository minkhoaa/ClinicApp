import axios, {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { router } from 'expo-router';
import { clearAuthData, getToken } from './storage';

/**
 * BACKEND URL CONFIGURATION
 *
 * - Android Emulator: use 10.0.2.2 (maps to localhost on host machine)
 * - iOS Simulator: use localhost
 * - Physical Device: use your computer's local IP (e.g., 192.168.1.xxx)
 *
 * Check your IP with: hostname -I (Linux) or ipconfig (Windows)
 */
const BACKEND_URL = 'http://192.168.1.20:5000';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    async (error) => {
        // Handle 401 Unauthorized
        if (error?.response?.status === 401) {
            await clearAuthData();
            router.replace('/(auth)/login' as any);
        }

        // Return error with proper message
        if (error?.response?.data) {
            return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
    }
);

// Type for backend response
export interface IBackendRes<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}

export default api;
