import { createContext } from "react";


type UserRole = "gym" | "trainer" | "client" | "super-admin";

export interface User {
    id: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setAccessToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


