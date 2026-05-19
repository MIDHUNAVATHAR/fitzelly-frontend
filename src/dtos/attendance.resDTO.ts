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
