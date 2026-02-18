import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export const useLogout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    }

    return { handleLogout };
}