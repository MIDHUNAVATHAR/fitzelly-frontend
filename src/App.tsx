import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/landing/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import SuperAdminLoginPage from "./pages/super-admin/SuperAdminLoginPage";


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
          <Route path="/gym/dashboard" element={<>   <h1>Gym Dahboard</h1></>} />
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
