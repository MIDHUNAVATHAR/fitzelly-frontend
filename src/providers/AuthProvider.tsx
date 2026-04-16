import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { axiosInstance } from "../api/axios";
import type { User } from "../context/AuthContext";
import { AuthContext } from "../context/AuthContext";


export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);


    //called after login
    const login = (token: string, userData: User) => {
        setAccessToken(token);
        setUser(userData);
        setIsLoading(false);
        setIsSubscriptionExpired(false);
    };


    const logout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout");
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setAccessToken(null);
            setUser(null);
            setIsSubscriptionExpired(false);
        }
    };

    //refresh on app loads
    useEffect(() => {
        const refreshToken = async () => {
          
            try {
                const response = await axiosInstance.get("/api/auth/refresh-token");

                const data = response.data.data;

                if (data && data.accessToken) {
                    setAccessToken(data.accessToken);
                    setUser({ id: data.user.id, email: data.user.email, role: data.user.role });
                    setIsSubscriptionExpired(false);
                }

            } catch {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        refreshToken();
    }, []);


    return (
        <AuthContext.Provider value={{ user, accessToken, isLoading, isSubscriptionExpired, login, logout, setAccessToken, setIsSubscriptionExpired }}>
            {children}
        </AuthContext.Provider>
    );
};

