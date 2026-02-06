import { useEffect } from "react";
import { setupInterceptors } from "../api/interceptor";
import { useAuth } from "../context/useAuth";


const AxiosInterceptorProvider = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, setAccessToken } = useAuth();

    useEffect(() => {
        setupInterceptors(() => accessToken || "", setAccessToken)
    }, [accessToken, setAccessToken]);

    return <>{children}</>
}


export default AxiosInterceptorProvider; 