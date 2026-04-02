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


/**
 * only lazy loading layouts, no need to small pages
 */
const GymLayout = lazyComponent(React.lazy(() => import("./userInterface/gym/GymLayout")));
const SuperAdminLayout = lazyComponent(React.lazy(() => import("./userInterface/super-admin/SuperAdminLayout")));
const ClientLayout = lazyComponent(React.lazy(() => import("./userInterface/client/ClientLayout")));
const TrainerLayout = lazyComponent(React.lazy(() => import("./userInterface/trainer/TrainerLayout")));

import DashboardHome from "./userInterface/gym/DashboardHome";
import GymProfile from "./userInterface/gym/gym-profile/Profile"

import GymClients from "./userInterface/gym/gym-clients/ClientsList";
import AddClient from "./userInterface/gym/gym-clients/AddClient";
import ClientProfile from "./userInterface/gym/gym-clients/ClientProfile";

import GymTrainers from "./userInterface/gym/gym-trainers/TrainerList";
import AddTrainer from "./userInterface/gym/gym-trainers/AddTrainer";
import TrainerProfile from "./userInterface/gym/gym-trainers/TrainerProfile";

import GymPlans from "./userInterface/gym/plans/PlansPage";
import MembershipList from "./userInterface/gym/memberships/MembershipListPage";
import MembershipView from "./userInterface/gym/memberships/MembershipViewPage";
import PaymentCollectionPage from "./userInterface/gym/memberships/PaymentCollectionPage";

import EquipmentList from "./userInterface/gym/equipment/EquipmentList";
import AttendanceManagement from "./userInterface/gym/attendance/AttendanceManagement";
import EnquiriesList from "./userInterface/gym/enquiries/EnquiriesList";
import ExpensesList from "./userInterface/gym/expenses/ExpensesList";
import TrainerPayoutsPage from "./userInterface/gym/trainer-payouts/TrainerPayoutsPage";
import GymAnalyticsPage from "./userInterface/gym/analytics/AnalyticsPage";
import SecurityPage from "./userInterface/gym/security/SecurityPage";

import SuperDashboardHome from "./userInterface/super-admin/dashboard/DashboardHome";
import SuperProfile from "./userInterface/super-admin/profile/SuperAdmin-Profile";
import GymList from "./userInterface/super-admin/gyms/GymList";
import GymView from "./userInterface/super-admin/gyms/ViewGym";


/**
 * client components
 * @returns 
 */
import ClientDashboardHome from "./userInterface/client/dashboard/DashboardHome";
import ClientProfilePage from "./userInterface/client/profile/ClientProfile";
import GymDetailsPage from "./userInterface/client/gym-details/GymDetails";
import ClientWorkoutPlanPage from "./userInterface/client/workout-plan/WorkoutPlan";
import EquipmentBookingPage from "./userInterface/client/equipment-booking/EquipmentBookingPage";

/**
 * trainer components 
 * @returns 
 */
import TrainerDashboardHome from "./userInterface/trainer/dashboard/DashboardHome";
import TrainerProfilePage from "./userInterface/trainer/profile/TrainerProfile";
import TrainerGymDetailsPage from "./userInterface/trainer/gym-details/GymDetails";
import TrainerClientsPage from "./userInterface/trainer/clients/AssignedClientsPage";
import TrainerClientProfilePage from "./userInterface/trainer/clients/AssignedClientProfile";
import TrainerWorkoutPlanPage from "./userInterface/trainer/clients/WorkoutPlanPage";
import ExerciseLibraryPage from "./userInterface/super-admin/exercise-library/ExerciseLibraryPage";
import MyEarningsPage from "./userInterface/trainer/earnings/MyEarningsPage";


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

            <Route path="plans" element={<GymPlans />} />

            <Route path="memberships" element={<MembershipList />} />
            <Route path="memberships/:id" element={<MembershipView />} />
            <Route path="payment-collection" element={<PaymentCollectionPage />} />

            <Route path="equipments" element={<EquipmentList />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="analytics" element={<GymAnalyticsPage />} />
            <Route path="enquiries" element={<EnquiriesList />} />
            <Route path="payouts" element={<TrainerPayoutsPage />} />
            <Route path="expenses" element={<ExpensesList />} />
            <Route path="security" element={<SecurityPage />} />


          </Route >
        </Route>

        { /* Client protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientDashboardHome />} />
            <Route path="dashboard" element={<ClientDashboardHome />} />
            <Route path="profile" element={<ClientProfilePage />} />
            <Route path="gym-details" element={<GymDetailsPage />} />
            <Route path="workout-plan" element={<ClientWorkoutPlanPage />} />
            <Route path="equipment-booking" element={<EquipmentBookingPage />} />
            <Route path="security" element={<SecurityPage />} />

          </Route>
        </Route>

        { /* Trainer protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.TRAINER]} />}>
          <Route path="/trainer" element={<TrainerLayout />}>
            <Route index element={<TrainerDashboardHome />} />
            <Route path="dashboard" element={<TrainerDashboardHome />} />
            <Route path="profile" element={<TrainerProfilePage />} />
            <Route path="gym-details" element={<TrainerGymDetailsPage />} />
            <Route path="clients" element={<TrainerClientsPage />} />
            <Route path="clients/:id" element={<TrainerClientProfilePage />} />
            <Route path="clients/:id/workout-plan" element={<TrainerWorkoutPlanPage />} />
            <Route path="earnings" element={<MyEarningsPage />} />
            <Route path="security" element={<SecurityPage />} />

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
            <Route path="exercise-library" element={<ExerciseLibraryPage />} />
            <Route path="security" element={<SecurityPage />} />

          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </>

  )
}

export default App; 
