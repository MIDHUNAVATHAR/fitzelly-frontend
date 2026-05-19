export interface SessionItem {
    id: string;
    userId: string;
    role: string;
    device: string;
    browser?: string;
    os?: string;
    ip: string;
    lastActive: string;
    isRevoked: boolean;
    isCurrent?: boolean;
    createdAt: string;
}
