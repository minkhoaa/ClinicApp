import {
    getMedicalRecordDetail,
    getMedicalRecords,
    MedicalRecordDetailDto,
    MedicalRecordDto,
} from '@/services/apiPatient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
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
    TouchableOpacity,
    View,
} from 'react-native';

export default function MedicalHistoryScreen() {
    const [records, setRecords] = useState<MedicalRecordDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Detail modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<MedicalRecordDetailDto | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchRecords = async () => {
        try {
            const response = await getMedicalRecords();

            if (response.isSuccess && response.data) {
                setRecords(response.data);
            } else {
                setRecords([]);
            }
        } catch (error) {
            setRecords([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRecordDetail = async (id: string) => {
        setLoadingDetail(true);
        try {
            const response = await getMedicalRecordDetail(id);
            if (response.isSuccess && response.data) {
                setSelectedRecord(response.data);
                setModalVisible(true);
            }
        } catch (error) {
        } finally {
            setLoadingDetail(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecords();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecords();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDownload = async (
        recordId: string,
        attachmentId: string,
        fileName: string
    ) => {
        setDownloadingId(attachmentId);
        try {
            // Build the download URL
            const baseUrl = 'http://192.168.1.24:5000'; // Match api.ts
            const downloadUrl = `${baseUrl}/api/patient/medical-records/${recordId}/attachments/${attachmentId}`;

            // Get available cache directory
            // @ts-ignore - Legacy API still works at runtime in SDK 54
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) {
                throw new Error('Cache directory not available');
            }
            const fileUri = cacheDir + fileName;

            // Download using legacy API
            // @ts-ignore - Legacy API still works at runtime in SDK 54
            const downloadResumable = FileSystem.createDownloadResumable(
                downloadUrl,
                fileUri,
                {}
            );

            const result = await downloadResumable.downloadAsync();

            if (result && result.uri) {
                // Share the file
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(result.uri, {
                        mimeType: 'application/octet-stream',
                        dialogTitle: `Chia sẻ ${fileName}`,
                    });
                } else {
                    Alert.alert('Thành công', `Đã tải: ${fileName}`);
                }
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Lỗi', 'Không thể tải file. Vui lòng thử lại.');
        } finally {
            setDownloadingId(null);
        }
    };

    const renderRecord = ({ item }: { item: MedicalRecordDto }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => fetchRecordDetail(item.id)}
            disabled={loadingDetail}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={24} color="#2563EB" />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                {loadingDetail ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#94a3b8"
                    />
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#64748b" />
                <Text style={styles.infoText}>{item.doctor}</Text>
            </View>

            {item.diagnosis && (
                <View style={styles.diagnosisContainer}>
                    <Text style={styles.diagnosisLabel}>Chẩn đoán:</Text>
                    <Text style={styles.diagnosisText} numberOfLines={2}>
                        {item.diagnosis}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderDetailModal = () => (
        <Modal
            visible={modalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={28} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Chi tiết hồ sơ</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedRecord && (
                        <>
                            {/* Title & Date */}
                            <View style={styles.detailSection}>
                                <Text style={styles.detailTitle}>
                                    {selectedRecord.title}
                                </Text>
                                <Text style={styles.detailDate}>
                                    {formatDate(selectedRecord.recordDate)}
                                </Text>
                            </View>

                            {/* Doctor */}
                            <View style={styles.detailCard}>
                                <View style={styles.detailRow}>
                                    <Ionicons
                                        name="person"
                                        size={20}
                                        color="#2563EB"
                                    />
                                    <View style={styles.detailRowContent}>
                                        <Text style={styles.detailLabel}>
                                            Bác sĩ
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedRecord.doctor}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Diagnosis */}
                            {selectedRecord.diagnosis && (
                                <View style={styles.detailCard}>
                                    <Text style={styles.cardTitle}>
                                        Chẩn đoán
                                    </Text>
                                    <Text style={styles.cardContent}>
                                        {selectedRecord.diagnosis}
                                    </Text>
                                </View>
                            )}

                            {/* Treatment */}
                            {selectedRecord.treatment && (
                                <View
                                    style={[
                                        styles.detailCard,
                                        { backgroundColor: '#f0fdf4' },
                                    ]}
                                >
                                    <Text style={styles.cardTitle}>
                                        Điều trị
                                    </Text>
                                    <Text style={styles.cardContent}>
                                        {selectedRecord.treatment}
                                    </Text>
                                </View>
                            )}

                            {/* Prescription */}
                            {selectedRecord.prescription && (
                                <View
                                    style={[
                                        styles.detailCard,
                                        { backgroundColor: '#fef3c7' },
                                    ]}
                                >
                                    <Text style={styles.cardTitle}>
                                        Đơn thuốc
                                    </Text>
                                    <Text style={styles.cardContent}>
                                        {selectedRecord.prescription}
                                    </Text>
                                </View>
                            )}

                            {/* Notes */}
                            {selectedRecord.notes && (
                                <View style={styles.detailCard}>
                                    <Text style={styles.cardTitle}>
                                        Ghi chú
                                    </Text>
                                    <Text style={styles.cardContent}>
                                        {selectedRecord.notes}
                                    </Text>
                                </View>
                            )}

                            {/* Attachments */}
                            {selectedRecord.attachments &&
                                selectedRecord.attachments.length > 0 && (
                                    <View style={styles.detailCard}>
                                        <Text style={styles.cardTitle}>
                                            Tệp đính kèm (
                                            {selectedRecord.attachments.length})
                                        </Text>
                                        {selectedRecord.attachments.map(
                                            (attachment) => (
                                                <TouchableOpacity
                                                    key={attachment.id}
                                                    style={
                                                        styles.attachmentItem
                                                    }
                                                    onPress={() =>
                                                        handleDownload(
                                                            selectedRecord.id,
                                                            attachment.id,
                                                            attachment.fileName
                                                        )
                                                    }
                                                    disabled={
                                                        downloadingId ===
                                                        attachment.id
                                                    }
                                                >
                                                    <Ionicons
                                                        name="document-attach"
                                                        size={20}
                                                        color="#64748b"
                                                    />
                                                    <View
                                                        style={
                                                            styles.attachmentInfo
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.attachmentName
                                                            }
                                                            numberOfLines={1}
                                                        >
                                                            {
                                                                attachment.fileName
                                                            }
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.attachmentSize
                                                            }
                                                        >
                                                            {formatFileSize(
                                                                attachment.fileSize
                                                            )}
                                                        </Text>
                                                    </View>
                                                    {downloadingId ===
                                                    attachment.id ? (
                                                        <ActivityIndicator
                                                            size="small"
                                                            color="#2563EB"
                                                        />
                                                    ) : (
                                                        <Ionicons
                                                            name="download-outline"
                                                            size={22}
                                                            color="#2563EB"
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            )
                                        )}
                                    </View>
                                )}
                        </>
                    )}
                </ScrollView>
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
                data={records}
                keyExtractor={(item) => item.id}
                renderItem={renderRecord}
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
                            name="folder-open-outline"
                            size={64}
                            color="#cbd5e1"
                        />
                        <Text style={styles.emptyText}>
                            Chưa có hồ sơ bệnh án nào
                        </Text>
                    </View>
                }
            />
            {renderDetailModal()}
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
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    date: { fontSize: 13, color: '#64748b', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, color: '#64748b' },
    diagnosisContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    diagnosisLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    diagnosisText: { fontSize: 14, color: '#334155' },
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
    detailSection: { alignItems: 'center', paddingVertical: 20 },
    detailTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
    },
    detailDate: { fontSize: 14, color: '#64748b', marginTop: 4 },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailRowContent: { flex: 1 },
    detailLabel: { fontSize: 12, color: '#64748b' },
    detailValue: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    cardContent: { fontSize: 14, color: '#1e293b', lineHeight: 22 },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    attachmentInfo: { flex: 1 },
    attachmentName: { fontSize: 14, color: '#1e293b' },
    attachmentSize: { fontSize: 12, color: '#64748b' },
});
