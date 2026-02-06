import { createContext, useEffect, useState, type ReactNode } from "react";
import { axiosInstance } from "../api/axios";


type UserRole = "gym" | "trainer" | "client" | "super-admin";

interface User {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    //called after login
    const login = (token: string, userData: User) => {
        setAccessToken(token);
        setUser(userData);
        setIsLoading(false);
    };


    const logout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout");
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    //refresh on app loads
    useEffect(() => {
        const refreshToken = async () => {
            if (user) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axiosInstance.get("/api/auth/refresh-token");

                const data = response.data.data;
                if (data && data.accessToken) {
                    setAccessToken(data.accessToken);
                    setUser({ id: data.user.id, email: data.user.email, role: data.user.role });
                }

            } catch (error) {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        refreshToken();
    }, []);


    return (
        <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};


