import { useAuth } from '@/context/AuthContext';
import {
    getPatientProfile,
    ProfileData,
    updatePatientProfile,
} from '@/services/apiPatient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Helper: Format gender to Vietnamese
const formatGender = (gender: string | null | undefined): string => {
    if (!gender) return 'Chưa cập nhật';
    const g = gender.toLowerCase();
    if (g === 'male' || g === 'nam' || g === '0') return 'Nam';
    if (g === 'female' || g === 'nữ' || g === 'nu' || g === '1') return 'Nữ';
    if (g === 'other' || g === 'khác' || g === 'khac' || g === '2')
        return 'Khác';
    return gender;
};

// Helper: Format date to DD/MM/YYYY
const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Chưa cập nhật';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return dateStr;
    }
};

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);

    // Editable fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const fetchProfile = async () => {
        try {
            const response = await getPatientProfile();

            if (response.isSuccess && response.data) {
                setProfile(response.data);
                setFullName(response.data.fullName || '');
                setPhone(response.data.phone || '');
                setAddress(response.data.address || '');
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const handleSave = async () => {
        if (!profile) return;

        setSaving(true);
        try {
            const updateData = {
                fullName,
                gender: profile.gender,
                dob: profile.dob,
                phone,
                email: profile.email,
                address,
                allergy: profile.allergy,
                chronicDisease: profile.chronicDisease,
                emergencyName: profile.emergencyName,
                emergencyPhone: profile.emergencyPhone,
                bloodGroup: profile.bloodGroup,
                insuranceType: profile.insuranceType,
                insuranceNumber: profile.insuranceNumber,
            };

            const response = await updatePatientProfile(updateData);

            if (response.isSuccess) {
                Alert.alert('Thành công', 'Đã cập nhật thông tin');
                setEditing(false);
                fetchProfile();
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể cập nhật');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(profile?.fullName || user?.fullName || 'U')
                            .charAt(0)
                            .toUpperCase()}
                    </Text>
                </View>
                {!editing && (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEditing(true)}
                    >
                        <Ionicons
                            name="create-outline"
                            size={18}
                            color="#2563EB"
                        />
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Profile Form */}
            <View style={styles.card}>
                <View style={styles.field}>
                    <Text style={styles.label}>Họ và tên</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Nhập họ và tên"
                        />
                    ) : (
                        <Text style={styles.value}>
                            {profile?.fullName || 'Chưa cập nhật'}
                        </Text>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>
                        {profile?.email || user?.email || 'Chưa cập nhật'}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Nhập số điện thoại"
                            keyboardType="phone-pad"
                        />
                    ) : (
                        <Text style={styles.value}>
                            {profile?.phone || 'Chưa cập nhật'}
                        </Text>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.label}>Địa chỉ</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Nhập địa chỉ"
                        />
                    ) : (
                        <Text style={styles.value}>
                            {profile?.address || 'Chưa cập nhật'}
                        </Text>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.label}>Giới tính</Text>
                    <Text style={styles.value}>
                        {formatGender(profile?.gender)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.label}>Ngày sinh</Text>
                    <Text style={styles.value}>{formatDate(profile?.dob)}</Text>
                </View>
            </View>

            {/* Health Info */}
            {profile?.allergy ||
            profile?.chronicDisease ||
            profile?.bloodGroup ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin sức khỏe</Text>

                    {profile?.bloodGroup && (
                        <>
                            <View style={styles.field}>
                                <Text style={styles.label}>Nhóm máu</Text>
                                <Text style={styles.value}>
                                    {profile.bloodGroup}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                        </>
                    )}

                    {profile?.allergy && (
                        <View style={styles.field}>
                            <Text style={styles.label}>Dị ứng</Text>
                            <Text style={styles.value}>{profile.allergy}</Text>
                        </View>
                    )}

                    {profile?.chronicDisease && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.field}>
                                <Text style={styles.label}>Bệnh mãn tính</Text>
                                <Text style={styles.value}>
                                    {profile.chronicDisease}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            ) : null}

            {/* Action Buttons */}
            {editing ? (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                            setEditing(false);
                            setFullName(profile?.fullName || '');
                            setPhone(profile?.phone || '');
                            setAddress(profile?.address || '');
                        }}
                    >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            saving && styles.buttonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Lưu</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons
                        name="log-out-outline"
                        size={20}
                        color="#ef4444"
                    />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FB' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSection: { alignItems: 'center', marginBottom: 24 },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
    editButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    editButtonText: { fontSize: 14, color: '#2563EB', fontWeight: '500' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    field: { paddingVertical: 8 },
    label: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    value: { fontSize: 15, color: '#1e293b' },
    input: {
        fontSize: 15,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 8 },
    actionButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
    saveButton: {
        flex: 1,
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    buttonDisabled: { opacity: 0.6 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fee2e2',
        paddingVertical: 16,
        borderRadius: 12,
    },
    logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
