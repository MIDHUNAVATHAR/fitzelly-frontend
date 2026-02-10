import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./userInterface/landing/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFoundPage from "./components/ui/NotFoundPage";
import SuperAdminLoginPage from "./userInterface/super-admin/SuperAdminLoginPage";
import SuperAdminDashboard from "./userInterface/super-admin/SuperAdminDashboard";
import Spinner from "./components/ui/Spinner";
import { ROLES } from "./constants/roles";

const GymPage = React.lazy(() => import("./userInterface/gym/GymDashboard"))


function App() {

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
          },
        }}
      />

      <Routes>
        { /* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        { /* Gym protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.GYM]} />} >
          <Route path="/gym/dashboard" element={
            <Suspense fallback={<Spinner />} >
              <GymPage />
            </Suspense>
          } />
        </Route>

        { /* super admin login route */}
        <Route path="/fitzelly-hq" element={<SuperAdminLoginPage />} />

        { /* super admin login route */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
          <Route path="/super-admin/dashboard" element={
            <Suspense fallback={<Spinner />}>
              <SuperAdminDashboard />
            </Suspense>
          } />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>

  )
}

export default App; 
