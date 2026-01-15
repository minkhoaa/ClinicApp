import {
    AppointmentDto,
    cancelAppointment,
    createReview,
    getPatientAppointments,
} from '@/services/apiPatient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

    // Detail Modal State - use AppointmentDto directly from list
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<AppointmentDto | null>(
        null
    );

    // Review Modal State
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewAppointment, setReviewAppointment] =
        useState<AppointmentDto | null>(null);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    // Use data directly from list - no API call needed (matching FE Web pattern)
    const handleViewDetail = (appointment: AppointmentDto) => {
        setSelectedDetail(appointment);
        setDetailModalVisible(true);
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

    const handleOpenReview = (appointment: AppointmentDto) => {
        setReviewAppointment(appointment);
        setRating(5);
        setReviewComment('');
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewAppointment) return;

        setSubmittingReview(true);
        try {
            const response = await createReview({
                appointmentId: reviewAppointment.id,
                rating: rating,
                comment: reviewComment || null,
            });

            if (response.isSuccess) {
                Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá!');
                setReviewModalVisible(false);
                fetchAppointments(); // Refresh list
            } else {
                Alert.alert(
                    'Lỗi',
                    response.message || 'Không thể gửi đánh giá'
                );
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
    };

    const renderAppointment = ({ item }: { item: AppointmentDto }) => {
        const status = statusConfig[item.status] || statusConfig.pending;
        const canCancel = ['booked', 'pending', 'confirmed'].includes(
            item.status
        );
        const canReview = item.status === 'completed';

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

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => handleViewDetail(item)}
                    >
                        <Ionicons
                            name="eye-outline"
                            size={16}
                            color="#2563EB"
                        />
                        <Text style={styles.detailButtonText}>Chi tiết</Text>
                    </TouchableOpacity>

                    {canReview && (
                        <TouchableOpacity
                            style={styles.reviewButton}
                            onPress={() => handleOpenReview(item)}
                        >
                            <Ionicons
                                name="star-outline"
                                size={16}
                                color="#f59e0b"
                            />
                            <Text style={styles.reviewButtonText}>
                                Đánh giá
                            </Text>
                        </TouchableOpacity>
                    )}

                    {canCancel && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancel(item)}
                        >
                            <Ionicons
                                name="close-circle-outline"
                                size={16}
                                color="#ef4444"
                            />
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    // Detail Modal
    // Detail Modal - matches FE Web AppointmentDetailModal.tsx pattern
    const renderDetailModal = () => (
        <Modal
            visible={detailModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setDetailModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setDetailModalVisible(false)}
                    >
                        <Ionicons name="close" size={28} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Chi tiết lịch hẹn</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedDetail ? (
                        <>
                            {/* Title & Status */}
                            <View style={styles.detailHeader}>
                                <Text style={styles.detailTitle}>
                                    {selectedDetail.title}
                                </Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                statusConfig[
                                                    selectedDetail.status
                                                ]?.bgColor || '#f1f5f9',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    statusConfig[
                                                        selectedDetail.status
                                                    ]?.color || '#64748b',
                                            },
                                        ]}
                                    >
                                        {statusConfig[selectedDetail.status]
                                            ?.label || selectedDetail.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Doctor */}
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <View
                                        style={[
                                            styles.iconBox,
                                            { backgroundColor: '#dbeafe' },
                                        ]}
                                    >
                                        <Ionicons
                                            name="person"
                                            size={20}
                                            color="#2563EB"
                                        />
                                    </View>
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>
                                            Bác sĩ
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedDetail.doctor}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Service (title = service name) */}
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <View
                                        style={[
                                            styles.iconBox,
                                            { backgroundColor: '#fef3c7' },
                                        ]}
                                    >
                                        <Ionicons
                                            name="medical"
                                            size={20}
                                            color="#f59e0b"
                                        />
                                    </View>
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>
                                            Dịch vụ
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedDetail.title}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Date & Time */}
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <View
                                        style={[
                                            styles.iconBox,
                                            { backgroundColor: '#e0e7ff' },
                                        ]}
                                    >
                                        <Ionicons
                                            name="calendar"
                                            size={20}
                                            color="#6366f1"
                                        />
                                    </View>
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>
                                            Ngày hẹn
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedDetail.date}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Time */}
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <View
                                        style={[
                                            styles.iconBox,
                                            { backgroundColor: '#fce7f3' },
                                        ]}
                                    >
                                        <Ionicons
                                            name="time"
                                            size={20}
                                            color="#ec4899"
                                        />
                                    </View>
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>
                                            Giờ hẹn
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedDetail.time}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Notes */}
                            {selectedDetail.note && (
                                <View style={styles.detailCard}>
                                    <Text style={styles.cardTitle}>
                                        Ghi chú
                                    </Text>
                                    <Text style={styles.cardContent}>
                                        {selectedDetail.note}
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : null}
                </ScrollView>
            </View>
        </Modal>
    );

    // Review Modal
    const renderReviewModal = () => (
        <Modal
            visible={reviewModalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setReviewModalVisible(false)}
        >
            <View style={styles.reviewOverlay}>
                <View style={styles.reviewModalContent}>
                    <Text style={styles.reviewModalTitle}>
                        Đánh giá dịch vụ
                    </Text>
                    <Text style={styles.reviewSubtitle}>
                        {reviewAppointment?.title}
                    </Text>

                    {/* Star Rating */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                            >
                                <Ionicons
                                    name={
                                        star <= rating ? 'star' : 'star-outline'
                                    }
                                    size={40}
                                    color="#f59e0b"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Comment */}
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Nhận xét của bạn (không bắt buộc)"
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        multiline
                        numberOfLines={4}
                    />

                    {/* Buttons */}
                    <View style={styles.reviewButtons}>
                        <TouchableOpacity
                            style={styles.reviewCancelButton}
                            onPress={() => setReviewModalVisible(false)}
                        >
                            <Text style={styles.reviewCancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.reviewSubmitButton,
                                submittingReview && styles.buttonDisabled,
                            ]}
                            onPress={handleSubmitReview}
                            disabled={submittingReview}
                        >
                            {submittingReview ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.reviewSubmitText}>
                                    Gửi đánh giá
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

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
            {renderDetailModal()}
            {renderReviewModal()}
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
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    detailButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    detailButtonText: { fontSize: 13, color: '#2563EB', fontWeight: '500' },
    reviewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        backgroundColor: '#fef3c7',
        borderRadius: 8,
    },
    reviewButtonText: { fontSize: 13, color: '#f59e0b', fontWeight: '500' },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
    },
    cancelButtonText: { fontSize: 13, color: '#ef4444', fontWeight: '500' },
    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16, color: '#64748b', marginTop: 16 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#F5F7FB' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
    modalContent: { flex: 1, padding: 16 },
    detailHeader: { alignItems: 'center', paddingVertical: 20 },
    detailTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
    },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailRowContent: { flex: 1 },
    detailLabel: { fontSize: 12, color: '#64748b' },
    detailValue: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
    detailSubValue: { fontSize: 13, color: '#64748b', marginTop: 2 },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    cardContent: { fontSize: 14, color: '#1e293b', lineHeight: 22 },

    // Review Modal
    reviewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    reviewModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 360,
    },
    reviewModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
    },
    reviewSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    reviewInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1e293b',
        textAlignVertical: 'top',
        minHeight: 100,
    },
    reviewButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    reviewCancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    reviewCancelText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
    reviewSubmitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    reviewSubmitText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    buttonDisabled: { opacity: 0.6 },
});
