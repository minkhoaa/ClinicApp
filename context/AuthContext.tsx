import { router } from 'expo-router';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { authService } from '../services/auth';
import { getToken, getUser, StoredUser } from '../services/storage';

// ==================== TYPES ====================

interface AuthContextType {
    user: StoredUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

// ==================== CONTEXT ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<StoredUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const userData = await getUser();

            if (token && userData) {
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Check auth error:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authService.login(username, password);

            // Re-fetch user from storage (auth service saves it)
            const userData = await getUser();
            setUser(userData);

            // Navigate to patient home (this app is patient-only)
            router.replace('/(patient)' as any);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
            router.replace('/(auth)/login' as any);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// ==================== HOOK ====================

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
