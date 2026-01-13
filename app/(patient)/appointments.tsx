import {
    AppointmentDto,
    cancelAppointment,
    getPatientAppointments,
} from '@/services/apiPatient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
> = {
    booked: { label: 'Đã đặt', color: '#f59e0b', bgColor: '#fef3c7' },
    pending: { label: 'Chờ xác nhận', color: '#f59e0b', bgColor: '#fef3c7' },
    confirmed: { label: 'Đã xác nhận', color: '#2563EB', bgColor: '#dbeafe' },
    completed: { label: 'Hoàn thành', color: '#10b981', bgColor: '#d1fae5' },
    cancelled: { label: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2' },
    noshow: { label: 'Không đến', color: '#64748b', bgColor: '#f1f5f9' },
};

export default function AppointmentsScreen() {
    const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAppointments = async () => {
        try {
            const response = await getPatientAppointments();

            if (response.isSuccess && response.data) {
                setAppointments(response.data);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            setAppointments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    const handleCancel = (appointment: AppointmentDto) => {
        Alert.alert(
            'Hủy lịch hẹn',
            `Bạn có chắc muốn hủy lịch hẹn "${appointment.title}" vào ${appointment.date}?`,
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy lịch',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await cancelAppointment(
                                appointment.id,
                                'Hủy từ ứng dụng'
                            );
                            if (response.isSuccess) {
                                Alert.alert('Thành công', 'Đã hủy lịch hẹn');
                                fetchAppointments();
                            } else {
                                Alert.alert(
                                    'Lỗi',
                                    response.message || 'Không thể hủy lịch hẹn'
                                );
                            }
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể hủy lịch hẹn');
                        }
                    },
                },
            ]
        );
    };

    const renderAppointment = ({ item }: { item: AppointmentDto }) => {
        const status = statusConfig[item.status] || statusConfig.pending;
        const canCancel = ['booked', 'pending', 'confirmed'].includes(
            item.status
        );

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: status.bgColor },
                        ]}
                    >
                        <Text
                            style={[styles.statusText, { color: status.color }]}
                        >
                            {status.label}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{item.doctor}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#64748b"
                    />
                    <Text style={styles.infoText}>{item.date}</Text>
                    <View style={styles.timeBadge}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color="#2563EB"
                        />
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                </View>

                {item.note && (
                    <Text style={styles.note} numberOfLines={2}>
                        Ghi chú: {item.note}
                    </Text>
                )}

                {canCancel && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancel(item)}
                    >
                        <Ionicons
                            name="close-circle-outline"
                            size={18}
                            color="#ef4444"
                        />
                        <Text style={styles.cancelButtonText}>
                            Hủy lịch hẹn
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointment}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={64}
                            color="#cbd5e1"
                        />
                        <Text style={styles.emptyText}>
                            Chưa có lịch hẹn nào
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FB' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: { padding: 16, gap: 12, paddingBottom: 100 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: { fontSize: 14, color: '#64748b', flex: 1 },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
    note: { fontSize: 13, color: '#64748b', fontStyle: 'italic', marginTop: 8 },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    cancelButtonText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16, color: '#64748b', marginTop: 16 },
});
