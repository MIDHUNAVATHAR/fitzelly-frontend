import { useEffect } from "react";
import { setupInterceptors } from "../api/interceptor";
import { useAuth } from "../context/useAuth";


const AxiosInterceptorProvider = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, setAccessToken, setIsSubscriptionExpired } = useAuth();

    useEffect(() => {
        setupInterceptors(() => accessToken || "", setAccessToken, setIsSubscriptionExpired)
    }, [accessToken, setAccessToken, setIsSubscriptionExpired]);

    return <>{children}</>
}


export default AxiosInterceptorProvider; 