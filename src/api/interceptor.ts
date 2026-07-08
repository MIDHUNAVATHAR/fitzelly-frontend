import { axiosInstance } from "./axios";
import type { InternalAxiosRequestConfig } from "axios";
import { AUTH,API_MESSAGES ,AUTH_PATHS} from "../constants/routes";

type QueueItem = {
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

let requestInterceptor: number | null = null;
let responseInterceptor: number | null = null;


const processQueue = (error: Error | null, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    })
    failedQueue = [];
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}


export const setupInterceptors = (
    getAccessToken: () => string | null, 
    setAccessToken: (token: string | null) => void,
    onSubscriptionExpired: (isExpired: boolean) => void
) => {

    if (requestInterceptor !== null) axiosInstance.interceptors.request.eject(requestInterceptor);
    if (responseInterceptor !== null) axiosInstance.interceptors.response.eject(responseInterceptor);

    requestInterceptor = axiosInstance.interceptors.request.use((config: CustomAxiosRequestConfig) => {
        if (!config._retry) {
            const token = getAccessToken();  //take token from auth context. 
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    })

    responseInterceptor = axiosInstance.interceptors.response.use(res => {
        // Reset sub expiry if successful call (optional, but good for recovery)
        // onSubscriptionExpired(false);
        return res;
    }, async error => {
        const originalRequest = error.config;

      const isAuthRoute =  originalRequest.url?.includes(AUTH_PATHS.LOGIN) ||
                           originalRequest.url?.includes(AUTH_PATHS.REFRESH_TOKEN) ||
                           originalRequest.url?.includes(AUTH_PATHS.LOGOUT) ||
                           originalRequest.url?.includes(AUTH_PATHS.FORGOT_PASSWORD_INITIATE);

        // Handle Subscription Expired
        if (error.response?.status === 403 && error.response?.data?.message === API_MESSAGES.GYM_SUBSCRIPTION_EXPIRED) {
            onSubscriptionExpired(true);
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {

            if (isRefreshing) {

                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest._retry = true;
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest)
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axiosInstance.get(AUTH.REFRESH_TOKEN);

                const newToken = res.data.data.accessToken;

                setAccessToken(newToken);
                processQueue(null, newToken)

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                const errObj = err instanceof Error ? err : new Error("refresh token failed");
                processQueue(errObj, null);
                setAccessToken(null);
                window.location.href = "/";


                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    })

}
