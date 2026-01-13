import { useAuth } from '@/context/AuthContext';
import {
    ClinicDto,
    createBooking,
    DoctorDto,
    getClinics,
    getDoctors,
    getServices,
    getSlots,
    ServiceDto,
    SlotDto,
} from '@/services/apiPatient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type BookingStep =
    | 'clinic'
    | 'service'
    | 'doctor'
    | 'datetime'
    | 'info'
    | 'confirm';

export default function BookingScreen() {
    const { user } = useAuth();
    const [step, setStep] = useState<BookingStep>('clinic');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [clinics, setClinics] = useState<ClinicDto[]>([]);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [doctors, setDoctors] = useState<DoctorDto[]>([]);
    const [slots, setSlots] = useState<SlotDto[]>([]);

    // Selected
    const [selectedClinic, setSelectedClinic] = useState<ClinicDto | null>(
        null
    );
    const [selectedService, setSelectedService] = useState<ServiceDto | null>(
        null
    );
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | null>(
        null
    );
    const [selectedDate, setSelectedDate] = useState('');
    const [dateObject, setDateObject] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);

    // Form - will be auto-filled from profile
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [notes, setNotes] = useState('');

    // Fetch clinics and profile on mount
    useEffect(() => {
        fetchClinics();
        fetchPatientProfile();
    }, []);

    const fetchPatientProfile = async () => {
        try {
            const { getPatientProfile } = await import('@/services/apiPatient');
            const response = await getPatientProfile();
            if (response.isSuccess && response.data) {
                // Auto-fill from profile if available
                if (response.data.fullName) setFullName(response.data.fullName);
                if (response.data.phone) setPhone(response.data.phone);
                if (response.data.email) setEmail(response.data.email);
            }
        } catch (error) {
        }
    };

    const fetchClinics = async () => {
        setLoading(true);
        try {
            const response = await getClinics();
            if (response.isSuccess && response.data) {
                setClinics(response.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async (clinicId: string) => {
        setLoading(true);
        try {
            const response = await getServices(clinicId);
            if (response.isSuccess && response.data) {
                setServices(response.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async (clinicId: string, serviceId?: string) => {
        setLoading(true);
        try {
            const response = await getDoctors(clinicId, serviceId);
            if (response.isSuccess && response.data) {
                setDoctors(response.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async (
        clinicId: string,
        doctorId: string,
        date: string,
        serviceId?: string
    ) => {
        setLoading(true);
        try {
            const response = await getSlots(
                clinicId,
                doctorId,
                date,
                serviceId
            );
            if (response.isSuccess && response.data) {
                setSlots(response.data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleClinicSelect = (clinic: ClinicDto) => {
        setSelectedClinic(clinic);
        fetchServices(clinic.clinicId);
        setStep('service');
    };

    const handleServiceSelect = (service: ServiceDto) => {
        setSelectedService(service);
        if (selectedClinic) {
            fetchDoctors(selectedClinic.clinicId, service.serviceId);
        }
        setStep('doctor');
    };

    const handleDoctorSelect = (doctor: DoctorDto) => {
        setSelectedDoctor(doctor);
        setStep('datetime');
    };

    const onDatePickerChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // Hide on Android after selection
        if (date) {
            setDateObject(date);
            // Format to YYYY-MM-DD for API
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            setSelectedDate(formattedDate);

            if (selectedClinic && selectedDoctor) {
                fetchSlots(
                    selectedClinic.clinicId,
                    selectedDoctor.doctorId,
                    formattedDate,
                    selectedService?.serviceId
                );
            }
        }
    };

    // Format date for display (DD/MM/YYYY)
    const formatDisplayDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const handleSlotSelect = (slot: SlotDto) => {
        setSelectedSlot(slot);
        setStep('info');
    };

    const handleSubmit = async () => {
        if (!selectedClinic || !selectedDoctor || !selectedSlot) return;

        setSubmitting(true);
        try {
            const response = await createBooking({
                clinicId: selectedClinic.clinicId,
                doctorId: selectedDoctor.doctorId,
                serviceId: selectedService?.serviceId,
                startAt: selectedSlot.startAt,
                endAt: selectedSlot.endAt,
                fullName,
                phone,
                email: email || undefined,
                notes: notes || undefined,
            });

            if (response.isSuccess) {
                Alert.alert(
                    'Đặt lịch thành công!',
                    'Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể đặt lịch');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể đặt lịch');
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price: number | null) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStepIndicator = () => {
        const steps = [
            'clinic',
            'service',
            'doctor',
            'datetime',
            'info',
            'confirm',
        ];
        const currentIndex = steps.indexOf(step);

        return (
            <View style={styles.stepIndicator}>
                {steps.map((s, idx) => (
                    <View key={s} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepDot,
                                idx <= currentIndex && styles.stepDotActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stepNumber,
                                    idx <= currentIndex &&
                                        styles.stepNumberActive,
                                ]}
                            >
                                {idx + 1}
                            </Text>
                        </View>
                        {idx < steps.length - 1 && (
                            <View
                                style={[
                                    styles.stepLine,
                                    idx < currentIndex && styles.stepLineActive,
                                ]}
                            />
                        )}
                    </View>
                ))}
            </View>
        );
    };

    const renderClinicStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Chọn phòng khám</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={clinics}
                    keyExtractor={(item) => item.clinicId}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() => handleClinicSelect(item)}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons
                                    name="business"
                                    size={24}
                                    color="#2563EB"
                                />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>
                                    {item.name}
                                </Text>
                                <Text style={styles.optionSubtitle}>
                                    {item.phone || item.email}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#94a3b8"
                            />
                        </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                />
            )}
        </View>
    );

    const renderServiceStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Chọn dịch vụ</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.serviceId}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() => handleServiceSelect(item)}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons
                                    name="medical"
                                    size={24}
                                    color="#10b981"
                                />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>
                                    {item.name}
                                </Text>
                                <Text style={styles.optionPrice}>
                                    {formatPrice(item.defaultPrice)}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#94a3b8"
                            />
                        </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                />
            )}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('clinic')}
            >
                <Ionicons name="arrow-back" size={20} color="#64748b" />
                <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );

    const renderDoctorStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Chọn bác sĩ</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.doctorId}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.optionCard}
                            onPress={() => handleDoctorSelect(item)}
                        >
                            <View
                                style={[
                                    styles.optionIcon,
                                    { backgroundColor: '#ede9fe' },
                                ]}
                            >
                                <Ionicons
                                    name="person"
                                    size={24}
                                    color="#8b5cf6"
                                />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>
                                    {item.fullName}
                                </Text>
                                <Text style={styles.optionSubtitle}>
                                    {item.specialty || 'Bác sĩ'}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#94a3b8"
                            />
                        </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                />
            )}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('service')}
            >
                <Ionicons name="arrow-back" size={20} color="#64748b" />
                <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );

    const renderDateTimeStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Chọn thời gian</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày khám</Text>
                <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Ionicons name="calendar" size={20} color="#2563EB" />
                    <Text style={styles.datePickerText}>
                        {selectedDate
                            ? formatDisplayDate(selectedDate)
                            : 'Chọn ngày'}
                    </Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={dateObject}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={onDatePickerChange}
                    minimumDate={new Date()}
                    locale="vi-VN"
                />
            )}

            {selectedDate && (
                <>
                    <Text style={styles.label}>Chọn giờ</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#2563EB" />
                    ) : slots.length > 0 ? (
                        <View style={styles.slotsGrid}>
                            {slots.map((slot, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.slotButton,
                                        selectedSlot?.startAt ===
                                            slot.startAt &&
                                            styles.slotButtonActive,
                                    ]}
                                    onPress={() => handleSlotSelect(slot)}
                                >
                                    <Text
                                        style={[
                                            styles.slotText,
                                            selectedSlot?.startAt ===
                                                slot.startAt &&
                                                styles.slotTextActive,
                                        ]}
                                    >
                                        {formatTime(slot.startAt)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noSlots}>
                            Không có khung giờ trống
                        </Text>
                    )}
                </>
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('doctor')}
            >
                <Ionicons name="arrow-back" size={20} color="#64748b" />
                <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );

    const renderInfoStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Thông tin liên hệ</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nhập họ và tên"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại *</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Nhập email"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Triệu chứng, yêu cầu đặc biệt..."
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep('datetime')}
                >
                    <Ionicons name="arrow-back" size={20} color="#64748b" />
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        (!fullName || !phone) && styles.buttonDisabled,
                    ]}
                    onPress={() => setStep('confirm')}
                    disabled={!fullName || !phone}
                >
                    <Text style={styles.nextButtonText}>Tiếp tục</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderConfirmStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Xác nhận thông tin</Text>

            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phòng khám:</Text>
                    <Text style={styles.summaryValue}>
                        {selectedClinic?.name}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Dịch vụ:</Text>
                    <Text style={styles.summaryValue}>
                        {selectedService?.name}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Bác sĩ:</Text>
                    <Text style={styles.summaryValue}>
                        {selectedDoctor?.fullName}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Thời gian:</Text>
                    <Text style={styles.summaryValue}>
                        {selectedDate} -{' '}
                        {selectedSlot && formatTime(selectedSlot.startAt)}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Họ tên:</Text>
                    <Text style={styles.summaryValue}>{fullName}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>SĐT:</Text>
                    <Text style={styles.summaryValue}>{phone}</Text>
                </View>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep('info')}
                >
                    <Ionicons name="arrow-back" size={20} color="#64748b" />
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        submitting && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>
                                Đặt lịch
                            </Text>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đặt lịch khám</Text>
                <View style={{ width: 28 }} />
            </View>

            {renderStepIndicator()}

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {step === 'clinic' && renderClinicStep()}
                {step === 'service' && renderServiceStep()}
                {step === 'doctor' && renderDoctorStep()}
                {step === 'datetime' && renderDateTimeStep()}
                {step === 'info' && renderInfoStep()}
                {step === 'confirm' && renderConfirmStep()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FB' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
    },
    stepItem: { flexDirection: 'row', alignItems: 'center' },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotActive: { backgroundColor: '#2563EB' },
    stepNumber: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    stepNumberActive: { color: '#fff' },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 2,
    },
    stepLineActive: { backgroundColor: '#2563EB' },
    scrollView: { flex: 1 },
    stepContent: { padding: 20 },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 12,
        elevation: 2,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    optionSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
    optionPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
        marginTop: 2,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    backButtonText: { fontSize: 15, color: '#64748b', fontWeight: '500' },
    inputGroup: { marginBottom: 16 },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1e293b',
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slotButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    slotButtonActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    slotText: { fontSize: 14, color: '#334155' },
    slotTextActive: { color: '#fff', fontWeight: '600' },
    noSlots: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    datePickerText: {
        fontSize: 15,
        color: '#1e293b',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    buttonDisabled: { opacity: 0.5 },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: { fontSize: 14, color: '#64748b' },
    summaryValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#10b981',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
