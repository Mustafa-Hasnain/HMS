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
import DoctorPortal from './components/Receptionist/DoctorsProtal';
import InventoryManager from './components/Receptionist/Inventory';
import InvoiceManagement from './components/Receptionist/Invoices';
import RevenueComponent from './components/Custom Components/Revenue';
import PrescriptionPage from './components/Doctor/PrescriptionPage';
import Prescriptions from './components/Doctor/Prescriptions';
import 'tailwindcss/tailwind.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-accessible-accordion/dist/fancy-example.css';
import Dashboard from './components/Receptionist/Dashboard';
import PatientDetails from './components/Custom Components/patient_details';
import DoctorDashboard from './components/Doctor/Dashboard';
import DoctorSchedule from './components/Doctor/DoctorSchedules';
import DoctorRevenue from './components/Doctor/Revenue';
import EditDoctorForm from './components/Custom Components/EditDoctor';
import EditPatientDetails from './components/Custom Components/EditPatientDetails';
import InvoiceDetails from './components/Custom Components/InvoiceDetails';
import { RefreshProvider } from './contexts/RefreshContext';
import ExpensesManager from './components/Receptionist/Expenses';
import UpcomingDoctorAppointments from './components/Custom Components/UpcomingDoctorAppointments';
import DoctorServices from './components/Custom Components/EditDoctorService';
import PatientPortal from './components/Custom Components/PatientsProtal';
import RefundItem from './components/Receptionist/RefundItem';
import RefundItemsTable from './components/Receptionist/RefundItemTable';
import useCheckDoctorRedirect from './components/Hooks/useCheckDoctorRedirect';
import PinConfirmation from './components/Doctor/Pin';
import { DoctorsProvider } from './contexts/DoctorsContext';



function ProtectedRoute({ children, role }) {
  //const { user } = useAuth();
  // if (!user) {
  //   return <Navigate to="/login" />;
  // }
  // if (user.role !== role) {
  //   return <Navigate to="/unauthorized" />;
  // }
  useCheckDoctorRedirect();
  return children;
}


function App() {

  return (
    <DoctorsProvider>
      <RefreshProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="*" element={<Login />} />
              <Route path="/otpVerification" element={<PinConfirmation />} />
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
                <Route path="edit-doctor/:doctor_id" element={<EditDoctorForm />} />
                <Route path="edit-patient/:patient_id" element={<EditPatientDetails />} />
                <Route path="invoice-details/:appointment_id" element={<InvoiceDetails />} />
                <Route path="set-appointment" element={<SetAppointment />} />
                <Route path="set-appointment/:patient_id/:invoice_id" element={<SetAppointment />} />
                <Route path="patients-portal" element={<PatientPortal />} />
                <Route path="patients-details/:patient_id" element={<PatientDetails />} />
                <Route path="doctors-portal" element={<DoctorPortal />} />
                <Route path="update-schedule/:doctor_id" element={<DoctorSchedule />} />
                <Route path="upcoming-doctor-appointments" element={<UpcomingDoctorAppointments />} />
                <Route path="inventory" element={<InventoryManager />} />
                <Route path="invoices" element={<InvoiceManagement />} />
                <Route path="revenue" element={<RevenueComponent />} />
                <Route path="expenses" element={<ExpensesManager />} />
                <Route path="add-refund-item" element={<RefundItem />} />
                <Route path="refund-items" element={<RefundItemsTable />} />

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
                <Route path="appointments" element={<UpcomingDoctorAppointments />} />
                <Route path="invoice-details/:appointment_id" element={<InvoiceDetails />} />
                <Route path="prescriptions/:patientId/:appointmentId" element={<PrescriptionPage />} />
                <Route path="edit-prescription/:patientId/:appointmentId/:prescriptionId" element={<PrescriptionPage />} />
                <Route path='prescriptions' element={<Prescriptions />}></Route>
                <Route path='patients' element={<PatientPortal />}></Route>
                <Route path="patients-details/:patient_id" element={<PatientDetails />} />
                <Route path='set-appointment' element={<SetAppointment />}></Route>
                <Route path="set-appointment/:patient_id/:invoice_id" element={<SetAppointment />} />
                <Route path='schedules' element={<DoctorSchedule />}></Route>
                <Route path='services' element={<DoctorServices doctorId={null} />} />
                <Route path='revenue' element={<RevenueComponent />}></Route>
                <Route path='profile' element={<EditDoctorForm />}></Route>
                <Route path="patients-portal" element={<PatientPortal />} />


              </Route>

              {/* Default redirect to login */}

              {/* <Route path="*" element={<Navigate to="/login" />} /> */}
            </Routes>
          </Router>
        </AuthProvider>
      </RefreshProvider>
    </DoctorsProvider>
  );
}

export default App;
