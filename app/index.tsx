import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/(patient)' as any);
            } else {
                router.replace('/(auth)/login' as any);
            }
        }
    }, [isAuthenticated, isLoading]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FB',
    },
});
