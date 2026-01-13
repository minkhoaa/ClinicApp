import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
} from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { StyleSheet, Text, View } from 'react-native';

function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { user, logout } = useAuth();

    return (
        <DrawerContentScrollView {...props} style={styles.drawer}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.fullName?.charAt(0).toUpperCase() || 'P'}
                    </Text>
                </View>
                <Text style={styles.userName}>
                    {user?.fullName || 'Bệnh nhân'}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
                <DrawerItem
                    label="Trang chủ"
                    icon={({ size }) => (
                        <Ionicons name="home" size={size} color="#2563EB" />
                    )}
                    onPress={() => props.navigation.navigate('index')}
                    labelStyle={styles.menuLabel}
                />
                <DrawerItem
                    label="Lịch hẹn"
                    icon={({ size }) => (
                        <Ionicons name="calendar" size={size} color="#2563EB" />
                    )}
                    onPress={() => props.navigation.navigate('appointments')}
                    labelStyle={styles.menuLabel}
                />
                <DrawerItem
                    label="Hồ sơ bệnh án"
                    icon={({ size }) => (
                        <Ionicons
                            name="document-text"
                            size={size}
                            color="#2563EB"
                        />
                    )}
                    onPress={() => props.navigation.navigate('history')}
                    labelStyle={styles.menuLabel}
                />
                <DrawerItem
                    label="Thông tin cá nhân"
                    icon={({ size }) => (
                        <Ionicons name="person" size={size} color="#2563EB" />
                    )}
                    onPress={() => props.navigation.navigate('profile')}
                    labelStyle={styles.menuLabel}
                />
            </View>

            {/* Logout */}
            <View style={styles.footer}>
                <DrawerItem
                    label="Đăng xuất"
                    icon={({ size }) => (
                        <Ionicons
                            name="log-out-outline"
                            size={size}
                            color="#ef4444"
                        />
                    )}
                    onPress={logout}
                    labelStyle={[styles.menuLabel, { color: '#ef4444' }]}
                />
            </View>
        </DrawerContentScrollView>
    );
}

export default function PatientLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: '#fff' },
                headerTitleStyle: { fontWeight: '600', color: '#1e293b' },
                headerTintColor: '#2563EB',
                drawerActiveBackgroundColor: '#eff6ff',
                drawerActiveTintColor: '#2563EB',
            }}
        >
            <Drawer.Screen name="index" options={{ title: 'Trang chủ' }} />
            <Drawer.Screen
                name="appointments"
                options={{ title: 'Lịch hẹn' }}
            />
            <Drawer.Screen
                name="history"
                options={{ title: 'Hồ sơ bệnh án' }}
            />
            <Drawer.Screen
                name="profile"
                options={{ title: 'Thông tin cá nhân' }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    userEmail: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    },
    menuItems: {
        flex: 1,
        paddingTop: 10,
    },
    menuLabel: {
        fontSize: 15,
        color: '#334155',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
});
