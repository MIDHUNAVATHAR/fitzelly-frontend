import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./userInterface/landing/LandingPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFoundPage from "./components/ui/NotFoundPage";
import SuperAdminLoginPage from "./userInterface/super-admin/SuperAdminLoginPage";
import CreatePassword from "./userInterface/auth/CreatePassword";
import { ROLES } from "./constants/roles";
import { lazyComponent } from "./components/wrapper/lazyLoad";



const GymLayout = lazyComponent(React.lazy(() => import("./userInterface/gym/GymLayout")));
const DashboardHome = lazyComponent(React.lazy(() => import("./userInterface/gym/DashboardHome")));
const GymProfile = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-profile/Profile")));

const GymClients = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-clients/ClientsList")));
const AddClient = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-clients/AddClient")));
const ClientProfile = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-clients/ClientProfile")));

const GymTrainers = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-trainers/TrainerList")));
const AddTrainer = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-trainers/AddTrainer")));
const TrainerProfile = lazyComponent(React.lazy(() => import("./userInterface/gym/gym-trainers/TrainerProfile")))

const SuperAdminLayout = lazyComponent(React.lazy(() => import("./userInterface/super-admin/SuperAdminLayout")));
const SuperDashboardHome = lazyComponent(React.lazy(() => import("./userInterface/super-admin/dashboard/DashboardHome")));
const SuperProfile = lazyComponent(React.lazy(() => import("./userInterface/super-admin/profile/SuperAdmin-Profile")))
const GymList = lazyComponent(React.lazy(() => import("./userInterface/super-admin/gyms/GymList")));
const GymView = lazyComponent(React.lazy(() => import("./userInterface/super-admin/gyms/ViewGym")));
const EditGym = lazyComponent(React.lazy(() => import("./userInterface/super-admin/gyms/EditGym")));

/**
 * client components
 * @returns 
 */
const ClientLayout = lazyComponent(React.lazy(() => import("./userInterface/client/ClientLayout")));
const ClientDashboardHome = lazyComponent(React.lazy(() => import("./userInterface/client/dashboard/DashboardHome")));
const ClientProfilePage = lazyComponent(React.lazy(() => import("./userInterface/client/profile/ClientProfile")))
const GymDetailsPage = lazyComponent(React.lazy(() => import("./userInterface/client/gym-details/GymDetails")));

/**
 * trainer components 
 * @returns 
 */
const TrainerLayout = lazyComponent(React.lazy(() => import("./userInterface/trainer/TrainerLayout")));
const TrainerDashboardHome = lazyComponent(React.lazy(() => import("./userInterface/trainer/dashboard/DashboardHome")));



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
        <Route path="/create-password" element={<CreatePassword />} />

        { /* Gym protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.GYM]} />} >
          <Route path="/gym" element={<GymLayout />} >
            <Route index element={<DashboardHome />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="profile" element={<GymProfile />} />

            <Route path="clients" element={<GymClients />} />
            <Route path="clients/add" element={<AddClient />} />
            <Route path="clients/:id" element={<ClientProfile />} />
            <Route path="clients/:id/edit" element={<ClientProfile />} />


            <Route path="trainers" element={<GymTrainers />} />
            <Route path="trainers/add" element={<AddTrainer />} />
            <Route path="trainers/:id" element={<TrainerProfile />} />
            <Route path="trainers/:id/edit" element={<TrainerProfile />} />


          </Route >
        </Route>

        { /* Client protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientDashboardHome />} />
            <Route path="dashboard" element={<ClientDashboardHome />} />
            <Route path="profile" element={<ClientProfilePage />} />
            <Route path="gym-details" element={<GymDetailsPage />} />
          </Route>
        </Route>

        { /* Trainer protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TRAINER]} />}>
          <Route path="/trainer" element={<TrainerLayout />}>
            <Route index element={<TrainerDashboardHome />} />
            <Route path="dashboard" element={<TrainerDashboardHome />} />
          </Route>
        </Route>

        { /* super admin login route */}
        <Route path="/fitzelly-hq" element={<SuperAdminLoginPage />} />

        { /* super admin  route */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />} >
            <Route index element={<SuperDashboardHome />} />
            <Route path="dashboard" element={<SuperDashboardHome />} />
            <Route path="profile" element={<SuperProfile />}></Route>
            <Route path="gyms" element={<GymList />}></Route>
            <Route path="gyms/:id" element={<GymView />} />
            <Route path="gyms/:id/edit" element={<EditGym />} />

          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>

  )
}

export default App; 
