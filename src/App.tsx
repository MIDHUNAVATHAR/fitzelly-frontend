import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/landing/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import SuperAdminLoginPage from "./pages/super-admin/SuperAdminLoginPage";
import Spinner from "./components/ui/Spinner";

const GymPage = React.lazy(() => import("./pages/gym/GymPage"))


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
        <Route element={<ProtectedRoute allowedRoles={["gym"]} />} >
          <Route path="/gym/dashboard" element={
            <Suspense fallback={<Spinner />} >
              <GymPage />
            </Suspense>
          } />
        </Route>

        { /* super admin protected routes */}
        <Route path="/fitzelly-hq" element={<SuperAdminLoginPage />} />

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>

  )
}

export default App; 
