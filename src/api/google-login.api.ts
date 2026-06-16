

import { AUTH } from "../constants/routes";

export const initiateGoogleLogin = ( role: string, mode: "login" | "signup" ) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    window.location.href = `${apiBaseUrl}${AUTH.GOOGLE_LOGIN}?role=${role}&mode=${mode}`;
};