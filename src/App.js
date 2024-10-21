// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import ReceptionistDashboardLayout from './components/ReceptionistDashboardLayout';
import DoctorDashboardLayout from './components/DoctorDashboardLayout';
import Login from './components/login';
import Unauthorized from './components/unauthorized';
import AddDoctor from './components/Receptionist/addDoctor';
import SetAppointment from './components/Custom Components/setAppointment';
import DoctorAppointments from './components/Doctor/Today_Appointments';
import PatientPortal from './components/Receptionist/PatientsProtal';
import DoctorPortal from './components/Receptionist/DoctorsProtal';
import UpcomingDoctorAppointments from './components/Receptionist/UpcomingDoctorAppointments';
import InventoryManager from './components/Receptionist/Inventory';
import InvoiceManagement from './components/Receptionist/Invoices';
import RevenueComponent from './components/Receptionist/Revenue';
import PrescriptionPage from './components/Doctor/PrescriptionPage';
import Prescriptions from './components/Doctor/Prescriptions';
import 'tailwindcss/tailwind.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Dashboard from './components/Receptionist/Dashboard';
import PatientDetails from './components/Receptionist/patient_details';
import DoctorDashboard from './components/Doctor/Dashboard';
import DoctorSchedule from './components/Doctor/DoctorSchedules';
import DoctorRevenue from './components/Doctor/Revenue';



function ProtectedRoute({ children, role }) {
  //const { user } = useAuth();
  // if (!user) {
  //   return <Navigate to="/login" />;
  // }
  // if (user.role !== role) {
  //   return <Navigate to="/unauthorized" />;
  // }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="*" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Routes for Receptionist */}
          <Route
            path="/receptionist/*"
            element={
              <ProtectedRoute role="receptionist">
                <ReceptionistDashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Add nested routes for the receptionist */}
            <Route path="dashboard" element={<ReceptionistDashboardLayout />} />
            <Route path='overview' element={<Dashboard />} />
            <Route path="add-doctor" element={<AddDoctor />} />
            <Route path="set-appointment" element={<SetAppointment />} />
            <Route path="patients-portal" element={<PatientPortal />} />
            <Route path="patients-details/:patient_id" element={<PatientDetails />} />
            <Route path="doctors-portal" element={<DoctorPortal />} />
            <Route path="upcoming-doctor-appointments" element={<UpcomingDoctorAppointments />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="revenue" element={<RevenueComponent />} />

          </Route>

          {/* Routes for Doctor */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Add nested routes for the doctor */}
            <Route path="dashboard" element={<DoctorDashboardLayout />} />
            <Route path="overview" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="prescriptions/:patientId/:appointmentId" element={<PrescriptionPage />} />
            <Route path='prescriptions' element={<Prescriptions />}></Route>
            <Route path='set-appointment' element={<SetAppointment />}></Route>
            <Route path='schedules' element={<DoctorSchedule />}></Route>
            <Route path='revenue' element={<DoctorRevenue />}></Route>

          </Route>

          {/* Default redirect to login */}
          
          {/* <Route path="*" element={<Navigate to="/login" />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
