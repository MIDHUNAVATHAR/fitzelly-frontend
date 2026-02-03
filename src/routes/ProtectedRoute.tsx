
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";


interface ProtectedRouteProps {
    allowedRoles: Array<"gym" | "trainer" | "client" | "super-admin">;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();


    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute; 