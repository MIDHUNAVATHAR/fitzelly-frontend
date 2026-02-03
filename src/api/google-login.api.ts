export const initiateGoogleLogin = (role: string, mode: "login" | "signup") => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${apiBaseUrl}/api/auth/google?role=${role}&mode=${mode}`;
}