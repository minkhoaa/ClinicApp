/**
 * Patient API Service - Mobile version
 * Converted from: se100/src/services/apiPatient.ts
 */

import api, { IBackendRes } from './api';

// ==================== TYPES ====================

export interface ProfileData {
    id: string;
    fullName: string;
    gender: string;
    dob: string;
    phone: string;
    email: string;
    address: string;
    allergy: string | null;
    chronicDisease: string | null;
    emergencyName: string | null;
    emergencyPhone: string | null;
    bloodGroup: string | null;
    insuranceType: string | null;
    insuranceNumber: string | null;
}

export interface MedicalRecordDto {
    id: string;
    title: string;
    doctor: string;
    date: string;
    diagnosis: string | null;
    treatment: string | null;
    prescription: string | null;
    notes: string | null;
    attachments: string[];
}

export interface AttachmentDto {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
}

export interface MedicalRecordDetailDto {
    id: string;
    title: string;
    doctor: string;
    recordDate: string;
    diagnosis: string | null;
    treatment: string | null;
    prescription: string | null;
    notes: string | null;
    attachments: AttachmentDto[];
}

export type AppointmentStatus =
    | 'booked'
    | 'confirmed'
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'noshow';

export interface AppointmentApiDto {
    id: string;
    title: string;
    doctor: string;
    startAt: string;
    note: string | null;
    status: AppointmentStatus;
}

export interface AppointmentDto {
    id: string;
    title: string;
    doctor: string;
    date: string;
    time: string;
    note: string | null;
    status: AppointmentStatus;
}

export interface ClinicDto {
    clinicId: string;
    code: string;
    name: string;
    timeZone: string;
    phone: string | null;
    email: string | null;
}

export interface ServiceDto {
    serviceId: string;
    code: string;
    name: string;
    defaultDurationMin: number | null;
    defaultPrice: number | null;
    isActive: boolean;
    clinicId: string;
}

export interface DoctorDto {
    doctorId: string;
    clinicId: string;
    code: string;
    fullName: string;
    specialty: string | null;
    phone: string | null;
    email: string | null;
    isActive: boolean;
}

export interface SlotDto {
    startAt: string;
    endAt: string;
}

export interface CreateBookingRequest {
    clinicId: string;
    doctorId: string;
    serviceId?: string;
    patientId?: string;
    startAt: string;
    endAt: string;
    fullName: string;
    phone: string;
    email?: string;
    notes?: string;
}

export interface CreateBookingResponse {
    appointmentId: string;
    patientId: string | null;
    status: number;
    cancelToken: string;
    rescheduleToken: string;
    username: string | null;
    password: string | null;
}

// ==================== HELPERS ====================

const transformAppointment = (apiData: AppointmentApiDto): AppointmentDto => {
    const startDate = new Date(apiData.startAt);
    const day = String(startDate.getDate()).padStart(2, '0');
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const year = startDate.getFullYear();
    const hours = String(startDate.getHours()).padStart(2, '0');
    const minutes = String(startDate.getMinutes()).padStart(2, '0');

    return {
        id: apiData.id,
        title: apiData.title,
        doctor: apiData.doctor,
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`,
        note: apiData.note,
        status: apiData.status,
    };
};

// ==================== API FUNCTIONS ====================

// Profile
export const getPatientProfile = async (): Promise<
    IBackendRes<ProfileData>
> => {
    const response = await api.get('/api/patient/profile');
    return response as unknown as IBackendRes<ProfileData>;
};

export const updatePatientProfile = async (
    data: Omit<ProfileData, 'id'>
): Promise<IBackendRes<ProfileData>> => {
    const response = await api.put('/api/patient/profile', data);
    return response as unknown as IBackendRes<ProfileData>;
};

// Appointments
export const getPatientAppointments = async (): Promise<
    IBackendRes<AppointmentDto[]>
> => {
    const response = await api.get('/api/patient/appointments');
    const result = response as unknown as IBackendRes<AppointmentApiDto[]>;

    if (result.isSuccess && result.data) {
        return {
            ...result,
            data: result.data.map(transformAppointment),
        };
    }

    return result as unknown as IBackendRes<AppointmentDto[]>;
};

export const cancelAppointment = async (
    id: string,
    reason: string
): Promise<IBackendRes<any>> => {
    const response = await api.put(`/api/patient/appointments/${id}/cancel`, {
        reason,
    });
    return response as unknown as IBackendRes<any>;
};

// Medical Records
export const getMedicalRecords = async (): Promise<
    IBackendRes<MedicalRecordDto[]>
> => {
    const response = await api.get('/api/patient/medical-records');
    return response as unknown as IBackendRes<MedicalRecordDto[]>;
};

export const getMedicalRecordDetail = async (
    id: string
): Promise<IBackendRes<MedicalRecordDetailDto>> => {
    const response = await api.get(`/api/patient/medical-records/${id}`);
    return response as unknown as IBackendRes<MedicalRecordDetailDto>;
};

// Booking Flow
export const getClinics = async (
    nameOrCode?: string
): Promise<IBackendRes<ClinicDto[]>> => {
    let url = '/api/clinic';
    if (nameOrCode) url += `?nameOrCode=${encodeURIComponent(nameOrCode)}`;
    const response = await api.get(url);
    return response as unknown as IBackendRes<ClinicDto[]>;
};

export const getServices = async (
    clinicId: string
): Promise<IBackendRes<ServiceDto[]>> => {
    const url = `/api/services?clinicId=${clinicId}&isActive=true`;
    const response = await api.get(url);
    return response as unknown as IBackendRes<ServiceDto[]>;
};

export const getDoctors = async (
    clinicId: string,
    serviceId?: string
): Promise<IBackendRes<DoctorDto[]>> => {
    let url = `/api/doctors?clinicId=${clinicId}&isActive=true`;
    if (serviceId) url += `&serviceId=${serviceId}`;
    const response = await api.get(url);
    return response as unknown as IBackendRes<DoctorDto[]>;
};

export const getSlots = async (
    clinicId: string,
    doctorId: string,
    date: string,
    serviceId?: string
): Promise<IBackendRes<SlotDto[]>> => {
    let url = `/api/slots?clinicId=${clinicId}&doctorId=${doctorId}&date=${date}`;
    if (serviceId) url += `&serviceId=${serviceId}`;
    const response = await api.get(url);
    return response as unknown as IBackendRes<SlotDto[]>;
};

export const createBooking = async (
    data: CreateBookingRequest
): Promise<IBackendRes<CreateBookingResponse>> => {
    const response = await api.post('/api/appointments', data);
    return response as unknown as IBackendRes<CreateBookingResponse>;
};
