import { createContext } from "react";


type UserRole = "gym" | "trainer" | "client" | "super-admin";

export interface User {
    id: string;
    email: string;
    role: UserRole;
    gymId?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isSubscriptionExpired: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setAccessToken: (token: string | null) => void;
    setIsSubscriptionExpired: (isExpired: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


