import { axiosInstance } from "./axios";

export interface AttendanceLog {
    checkIn: string;
    checkOut?: string;
}

export interface AttendanceDTO {
    id: string;
    userId: string;
    date: string;
    logs: AttendanceLog[];
    status: string;
    userType: string;
}

export const markAttendance = async (data: {
    action: 'CHECK_IN' | 'CHECK_OUT',
    gymId: string,
    latitude?: number,
    longitude?: number
}) => {
    const response = await axiosInstance.post("/api/attendance/mark", data);
    return response.data;
};

export const getTodayAttendance = async () => {
    const response = await axiosInstance.get("/api/attendance/today");
    return response.data;
};

export interface DailyAttendanceRecord {
    userId: string;
    fullName: string;
    clientId?: string;
    checkIn: string;
    checkOut: string;
    status: 'PRESENT' | 'ABSENT' | 'PENDING';
    userType: 'CLIENT' | 'TRAINER';
    logs?: {
        checkIn: string;
        checkOut?: string;
    }[];
}

export const getDailyAttendanceReport = async (date: string, userType: 'CLIENT' | 'TRAINER'): Promise<{ status: string, data: { report: DailyAttendanceRecord[], gymId: string } }> => {
    const response = await axiosInstance.get(`/api/attendance/report?date=${date}&userType=${userType}`);
    return response.data;
};

export const markManualAttendance = async (data: {
    userId: string;
    date: string;
    status: 'PRESENT' | 'ABSENT';
    userType: 'CLIENT' | 'TRAINER';
}) => {
    const response = await axiosInstance.post("/api/attendance/mark-manual", data);
    return response.data;
};


