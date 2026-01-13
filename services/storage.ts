import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

// ============ Token Storage (SecureStore for sensitive data) ============

export const getToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

export const setToken = async (token: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
    }
};

export const removeToken = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
    }
};

// ============ User Data Storage (AsyncStorage for non-sensitive data) ============

export interface StoredUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export const getUser = async (): Promise<StoredUser | null> => {
    try {
        const data = await AsyncStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

export const setUser = async (user: StoredUser): Promise<void> => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
    }
};

export const removeUser = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
    }
};

// ============ Clear All Auth Data ============

export const clearAuthData = async (): Promise<void> => {
    await Promise.all([removeToken(), removeUser()]);
};
