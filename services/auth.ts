/**
 * AUTH SERVICE - Mobile version
 * Converted from: se100/src/services/auth.service.ts
 */

import api, { IBackendRes } from './api';
import { clearAuthData, setToken, setUser, StoredUser } from './storage';

// ==================== INTERFACES ====================

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    id: string;
    accessToken: string;
    fullName?: string;
    email?: string;
    role?: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
}

export interface RegisterResponse {
    isSuccess: boolean;
    message: string;
    userId: string;
}

// ==================== AUTH SERVICE ====================

export const authService = {
    /**
     * Đăng nhập
     */
    login: async (
        username: string,
        password: string
    ): Promise<LoginResponse> => {
        try {
            const response = await api.post('/api/auth/login', {
                username,
                password,
            });

            // Handle response - api.ts interceptor returns data directly
            // BE returns: { isSuccess, message, data: { id, accessToken } }
            const result = response as unknown as IBackendRes<LoginResponse>;

            if (result.isSuccess && result.data) {
                // Save token
                await setToken(result.data.accessToken);

                // Save user data
                const user: StoredUser = {
                    id: result.data.id,
                    fullName: result.data.fullName || '',
                    email: result.data.email || username,
                    role: result.data.role || 'Patient',
                };
                await setUser(user);

                return result.data;
            }

            // If result doesn't have isSuccess wrapper, it might be direct data
            const directResponse = response as unknown as LoginResponse;
            if (directResponse.accessToken) {
                await setToken(directResponse.accessToken);
                const user: StoredUser = {
                    id: directResponse.id,
                    fullName: directResponse.fullName || '',
                    email: directResponse.email || username,
                    role: directResponse.role || 'Patient',
                };
                await setUser(user);
                return directResponse;
            }

            throw new Error(result.message || 'Đăng nhập thất bại');
        } catch (error: any) {
            // Handle different error types
            if (
                error.message === 'Network Error' ||
                error.code === 'ERR_NETWORK'
            ) {
                throw new Error(
                    'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
                );
            }

            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw new Error(error.message || 'Đăng nhập thất bại');
        }
    },

    /**
     * Đăng ký
     */
    register: async (
        username: string,
        password: string
    ): Promise<RegisterResponse> => {
        try {
            const response = await api.post('/api/auth/register', {
                username,
                password,
            });

            const result = response as unknown as IBackendRes<RegisterResponse>;

            if (result.isSuccess) {
                return result.data;
            }

            throw new Error(result.message || 'Đăng ký thất bại');
        } catch (error: any) {
            if (error.message === 'Network Error') {
                throw new Error('Không thể kết nối đến server.');
            }

            throw new Error(error.message || 'Đăng ký thất bại');
        }
    },

    /**
     * Đăng xuất
     */
    logout: async (): Promise<void> => {
        await clearAuthData();
    },
};
