import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigation = useNavigation();

    const quickActions: QuickAction[] = [
        {
            id: '1',
            title: 'Đặt lịch khám',
            description: 'Đặt lịch hẹn mới',
            icon: 'calendar-outline',
            color: '#2563EB',
            onPress: () => router.push('/booking' as any),
        },
        {
            id: '2',
            title: 'Hồ sơ bệnh án',
            description: 'Xem lịch sử khám',
            icon: 'document-text-outline',
            color: '#10b981',
            onPress: () => navigation.dispatch(DrawerActions.jumpTo('history')),
        },
        {
            id: '3',
            title: 'Lịch hẹn',
            description: 'Xem lịch hẹn',
            icon: 'time-outline',
            color: '#8b5cf6',
            onPress: () =>
                navigation.dispatch(DrawerActions.jumpTo('appointments')),
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.userName}>
                        {user?.fullName || 'Bệnh nhân'}
                    </Text>
                </View>
            </View>

            {/* Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Chăm sóc sức khỏe</Text>
                    <Text style={styles.heroSubtitle}>
                        Đặt lịch khám và theo dõi sức khỏe răng miệng của bạn
                    </Text>
                    <TouchableOpacity
                        style={styles.heroButton}
                        onPress={() => router.push('/booking' as any)}
                    >
                        <Text style={styles.heroButtonText}>Đặt lịch ngay</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.heroEmoji}>🦷</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionCard}
                            onPress={action.onPress}
                        >
                            <View
                                style={[
                                    styles.actionIcon,
                                    { backgroundColor: `${action.color}15` },
                                ]}
                            >
                                <Ionicons
                                    name={action.icon}
                                    size={24}
                                    color={action.color}
                                />
                            </View>
                            <Text style={styles.actionTitle}>
                                {action.title}
                            </Text>
                            <Text style={styles.actionDescription}>
                                {action.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color="#2563EB" />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Giờ làm việc</Text>
                        <Text style={styles.infoText}>
                            Thứ 2 - Thứ 7: 8:00 - 20:00
                        </Text>
                    </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#2563EB" />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Hotline</Text>
                        <Text style={styles.infoText}>1900 123 456</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FB' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    header: { marginBottom: 24 },
    greeting: { fontSize: 14, color: '#64748b' },
    userName: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
    heroCard: {
        backgroundColor: '#2563EB',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroContent: { flex: 1 },
    heroTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    heroButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    heroButtonText: { color: '#2563EB', fontWeight: '600' },
    heroEmoji: { fontSize: 64, marginLeft: 16 },
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    actionsGrid: { flexDirection: 'row', gap: 12 },
    actionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    actionDescription: { fontSize: 12, color: '#64748b' },
    infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoContent: { flex: 1 },
    infoTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    infoText: { fontSize: 13, color: '#64748b' },
    infoDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
});
