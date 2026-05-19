import { type DailyAttendanceRecord } from "../dtos/attendance.resDTO";

import { axiosInstance } from "./axios";
import { COMMON } from "../constants/routes";


export const markAttendance = async (data: {
    action: 'CHECK_IN' | 'CHECK_OUT',
    gymId: string,
    latitude?: number,
    longitude?: number
}) => {
    const response = await axiosInstance.post(COMMON.MARK_ATTENDANCE, data);
    return response.data;
};

export const getTodayAttendance = async () => {
    const response = await axiosInstance.get(COMMON.GET_TODAY_ATTENDANCE);
    return response.data;
};


export const getDailyAttendanceReport = async (date: string, userType: 'CLIENT' | 'TRAINER'): Promise<{ status: string, data: { report: DailyAttendanceRecord[], gymId: string } }> => {
    const response = await axiosInstance.get(COMMON.GET_DAILY_ATTENDANCE_REPORT(date, userType));
    return response.data;
};

export const markManualAttendance = async (data: {
    userId: string;
    date: string;
    status: 'PRESENT' | 'ABSENT';
    userType: 'CLIENT' | 'TRAINER';
}) => {
    const response = await axiosInstance.post(COMMON.MARK_ATTENDANCE_MANUAL, data);
    return response.data;
};

export const getYearlyAttendanceCount = async (year: number): Promise<{ status: string, data: number }> => {
    const response = await axiosInstance.get(`${COMMON.GET_YEARLY_ATTENDANCE_COUNT}?year=${year}`);
    return response.data;
};


