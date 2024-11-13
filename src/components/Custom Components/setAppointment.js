import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Breadcrumb, Form, Toast, Spinner, Alert, Card, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import debounce from 'lodash.debounce';
import RegisterPatient from './PatientRegistrationForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format, interval } from 'date-fns';  // Useful for formatting dates
import DoctorScheduleModal from './DoctorScheduleModal';
import { FaArrowLeft } from 'react-icons/fa';
import AddProcedureModal from './AddProcedureModal';
import { toast, ToastContainer } from 'react-toastify';



const SetAppointment = () => {
    const { patient_id, invoice_id } = useParams();
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [searchInfo, setSearchInfo] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showNewPatient, setShowNewPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [referredDoctor, setReferredDoctor] = useState('');
    const [fetchingAppointments, setfetchingAppointments] = useState(false)
    const [isProcedureSelected, setIsProcedureSelected] = useState(false);  // Track Procedure checkbox
    const [isConsultationSelected, setIsConsultationSelected] = useState(false);

    const [appointmentData, setAppointmentData] = useState({
        invoice_id: invoice_id,
        doctorID: 0,
        patientID: patient_id,
        appointmentDate: '',
        appointmentTime: '',
        Amount: 0,
        ConsultationAmount: 0,
        ReferredByDoctor: false,
        ReferredDoctorName: referredDoctor,
        isConsultation: false,
        ProcedureItems: []
    });

    const [newProcedure, setNewProcedure] = useState({
        ProcedureName: '',
        ProcedureDetail: '',
        Amount: 0
    });



    const [deletingId, setDeletingId] = useState(null);

    const [doctors, setDoctors] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [loading, setLoading] = useState(false);
    const [noData, setNoData] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [fetchFromLocal, setFetchFromLocal] = useState('');


    const [appointments, setAppointments] = useState([]); // To store the fetched appointments
    const navigate = useNavigate();
    const location = useLocation();

    const calculateTotalAmount = (isChecked, type) => {
        // Ensure all amounts are treated as numbers
        const procedureAmount = appointmentData.ProcedureItems.reduce((sum, item) => sum + Number(item.Amount), 0);

        // Return 0 immediately if the checkbox is unchecked for either type
        if (!isChecked) {
            if (type === 'Consultation') return isProcedureSelected ? procedureAmount : 0;
            if (type === 'Procedure') return isConsultationSelected ? Number(selectedDoctor?.consultationFee ?? 0) : 0;
        }

        // Determine consultation fee directly based on the type and isChecked value
        const consultationFee = (type === 'Consultation' && isChecked) || isConsultationSelected
            ? Number(selectedDoctor?.consultationFee ?? 0)
            : 0;

        // Determine procedure fee directly based on the type and isChecked value
        const procedureFee = (type === 'Procedure' && isChecked) || isProcedureSelected
            ? procedureAmount
            : 0;

        return consultationFee + procedureFee;
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
    
        if (value === 'Consultation') {
            setIsConsultationSelected(checked);
            setAppointmentData(prev => ({
                ...prev,
                ConsultationAmount: checked ? Number(selectedDoctor?.consultationFee ?? 0) : 0,
                isConsultation: checked
            }));
    
        } else if (value === 'Procedure') {
            setIsProcedureSelected(checked);
        }
    
        // Update the Amount immediately after updating checkboxes
        setAppointmentData(prev => ({
            ...prev,
            Amount: calculateTotalAmount(checked, value),
        }));
    };

    const handleDoctorSelectChange = (doctorID) => {
        const selectedDoctor = doctors.find(doc => doc.doctorID === parseInt(doctorID));
        const doctorFirstName = selectedDoctor ? selectedDoctor.firstName : '';

        setReferredDoctor(doctorFirstName);
        // setAppointmentData(prev => ({
        //     ...prev,
        //     appointment: {
        //         ...prev.appointment,
        //         ReferredDoctorName: doctorFirstName
        //     }
        // }));
    };




    const addProcedureItem = () => {
        const newItem = { ...newProcedure, procedureItemID: Date.now() };

        setAppointmentData(prev => ({
            ...prev,
            ProcedureItems: [...prev.ProcedureItems, newItem],
            Amount: prev.Amount + Number(newProcedure.Amount) // Ensure Amount is treated as a number
        }));

        setNewProcedure({ ProcedureName: '', ProcedureDetail: '', Amount: 0 });
        setShowModal(false);
    };

    const deleteProcedureItem = (procedureItemID) => {
        setDeletingId(procedureItemID);
        const itemToDelete = appointmentData.ProcedureItems.find(item => item.procedureItemID === procedureItemID);

        setAppointmentData(prev => ({
            ...prev,
            ProcedureItems: prev.ProcedureItems.filter(item => item.procedureItemID !== procedureItemID),
            Amount: prev.Amount - itemToDelete.Amount
        }));
        setDeletingId(null);
    };

    useEffect(() => {
        // Check for patient data in localStorage
        const storedPatient = localStorage.getItem('patient');

        if (storedPatient) {
            // Parse the patient data and set it to the selectedPatient state
            const patientData = JSON.parse(storedPatient);
            setSelectedPatient(patientData);
            setPatients([patientData]); // Set it in the patients array if you need it there as well

            // Remove the patient data from localStorage
            localStorage.removeItem('patient');
        }
    }, []);


    useEffect(() => {
        const fetchPatientData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/get-patient-details/${patient_id}`);
                const patientData = response.data;
                console.log("patientData: ", patientData);
                if (patientData) {
                    setSelectedPatient(patientData);
                    setPatients([patientData]);

                }
            } catch (err) {
                toast.error("An error occurred while fetching the patient data");
            } finally {
                setLoading(false);
            }
        };

        if (patient_id) {
            fetchPatientData();
        }
    }, [patient_id]);




    useEffect(() => {
        if (selectedDoctor && selectedDoctor.doctorID) {
            fetchDoctorAppointments(selectedDoctor.doctorID);
        }
    }, [appointmentData.appointmentDate]);

    const fetchDoctorAppointments = async (doctorID) => {
        try {
            setfetchingAppointments(true)
            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/Appointment/${doctorID}/?date=${appointmentData.appointmentDate}`);
            const data = await response.json();
            console.log("Doctors Appointment: ", data);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setfetchingAppointments(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    // const fetchDoctors = async () => {
    //     try {
    //         const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors');
    //         console.log("Doctors: ",response.data)
    //         setDoctors(response.data);
    //     } catch (error) {
    //         console.error("Error fetching doctors:", error);
    //     }
    // };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors');
            console.log("Doctors: ", response.data);
            setDoctors(response.data);

            // Check if doctor exists in localStorage
            const doctorData = JSON.parse(localStorage.getItem('doctor'));

            // Find doctor in the fetched doctors list
            const doctorInList = response.data.find(doc => doc.doctorID === doctorData.doctorID);

            // If the doctor from localStorage is in the list, set it as the selectedDoctor and make it immutable
            if (doctorInList) {
                setAppointmentData(prev => ({
                    ...prev,
                    doctorID: doctorData.doctorID
                }));
                setSelectedDoctor(doctorInList);  // Set the doctor as selected
                setFetchFromLocal(true)
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const debouncedSearch = useCallback(
        debounce((query) => {
            if (query.length >= 3) {
                setLoading(true);
                axios.post(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/search-patients/${query}`)
                    .then(response => {
                        setPatients(response.data);
                        setNoData(response.data.length === 0);
                    })
                    .catch(error => {
                        console.error(error);
                        setToastMessage("No patients found matching the search criteria.");
                        setToastVariant('danger');
                    })
                    .finally(() => setLoading(false));
            }
        }, 1000), []
    );

    useEffect(() => {
        debouncedSearch(searchInfo);
    }, [searchInfo, debouncedSearch]);

    const handleSearchChange = (e) => setSearchInfo(e.target.value);

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        console.log("Selected Patient: ", patient)
        setAppointmentData(prev => ({
            ...prev,
            patientID: patient.patientID,
            appointmentDate: '',
            appointmentTime: ''
        }));
        setShowNewPatient(false);
    };

    const convertTo24HourFormat = (time) => {
        const [timePart, period] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);

        if (period === 'PM' && hours < 12) {
            hours += 12; // Convert PM hours to 24-hour format
        } else if (period === 'AM' && hours === 12) {
            hours = 0; // Convert 12 AM to 0 hours
        }

        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`; // Return in HH:mm format
    };

    const validateForm = () => {
        const errors = {};

        // Condition: Both Consultation and Procedure are unselected
        if (!isProcedureSelected && !isConsultationSelected) {
            const message = 'Please select either a Procedure or a Consultation or both';
            errors.ConsultationOrProcedure = message;
            toast.error(message);
        }

        // Condition: Procedure selected but no procedure items
        if (isProcedureSelected && appointmentData.ProcedureItems.length === 0) {
            const message = 'Please add at least one Procedure item';
            errors.ProcedureItems = message;
            toast.error(message);
        }

        // Condition: Referred by doctor but no referred doctor name
        if (appointmentData.ReferredByDoctor && !referredDoctor) {
            const message = 'Referred Doctor Name is required.';
            errors.ReferredDoctorName = message;
            toast.error(message);
        }

        // Condition: Referred by doctor, appointment time not mandatory; otherwise, it is mandatory
        if (!appointmentData.ReferredByDoctor && !appointmentData.appointmentTime) {
            const message = 'Appointment Time is required';
            errors.AppointmentTime = message;
            toast.error(message);
        }

        // Condition: Selected doctor must be set if not referred by another doctor
        if (!appointmentData.ReferredByDoctor && !selectedDoctor) {
            const message = 'Please select a Doctor';
            errors.SelectedDoctor = message;
            toast.error(message);
        }

        // Condition: Appointment date must be set
        if (!appointmentData.appointmentDate) {
            const message = 'Appointment Date is required';
            errors.AppointmentDate = message;
            toast.error(message);
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);

        const appointmentTimeIn24hr = convertTo24HourFormat(appointmentData.appointmentTime);


        const payload = {
            invoiceID: invoice_id,
            doctorID: appointmentData.doctorID,
            patientID: selectedPatient.patientID,
            appointmentDate: appointmentData.appointmentDate,
            appointmentTime: appointmentTimeIn24hr,
            Amount: appointmentData.Amount,
            ProcedureItems: appointmentData.ProcedureItems,
            ReferredByDoctor: appointmentData.ReferredByDoctor,
            ReferredDoctorName: referredDoctor,
            isConsultation: appointmentData.isConsultation,
        };

        console.log("Payload: ", payload);

        if (!isValidAppointment(payload)) {
            setLoading(false);
            return;
        }

        let url = "";

        if (patient_id && invoice_id) {
            url = "https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/schedule-secondary-appointment"
        }
        else {
            url = "https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/schedule-appointment"
        }

        try {
            const response = await axios.post(`${url}`, payload);
            setToastMessage('Appointment set successfully.');
            setToastVariant('success');
            // setAppointmentData({
            //     doctorID: 0,
            //     patientID: 0,
            //     appointmentDate: '',
            //     appointmentTime: '',
            // });
            // setSelectedPatient(null);
            if (location.pathname.includes("/receptionist/")) {
                if (patient_id && invoice_id) {
                    navigate(-1);
                }
                navigate("/receptionist/upcoming-doctor-appointments");
            } else {
                navigate("/doctor/appointments");
            }
        } catch (error) {
            console.error("Error setting appointment:", error);
            setToastMessage(error.response?.data || 'Failed to set the appointment.');
            setToastVariant('danger');
        } finally {
            setLoading(false);
        }
    };

    const isValidAppointment = (payload) => {
        const { appointmentDate, appointmentTime } = payload;
        const date = new Date(appointmentDate);
        const time = appointmentTime;
        const selectedDoctor = doctors.find(doctor => doctor.doctorID === appointmentData.doctorID);

        if (!selectedDoctor) return false;

        // const isValidDate = selectedDoctor.schedules.some(schedule => {
        //     const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        //     return schedule.dayOfWeek === day && isWithinTimeSlot(time, schedule.startTime, schedule.endTime, schedule.slotDuration);
        // });

        // if (!isValidDate) {
        //     setErrorMessage("The selected date and time are not within the doctor's available schedule.");
        //     return false;
        // }

        return true;
    };

    const isWithinTimeSlot = (time, startTime, endTime, slotDuration) => {
        const [timeHours, timeMinutes] = time.split(':').map(Number);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const appointmentMinutes = timeHours * 60 + timeMinutes;
        const startMinutesTotal = startHours * 60 + startMinutes;
        const endMinutesTotal = endHours * 60 + endMinutes;

        const isValidTime = appointmentMinutes >= startMinutesTotal && appointmentMinutes <= endMinutesTotal;
        const slotOverlap = (endMinutesTotal - startMinutesTotal) % slotDuration === 0;

        return isValidTime && slotOverlap;
    };

    const handleDoctorChange = (doctor) => {
        console.log("Doctor Change: ", doctor);
        const selectedDoctorID = parseInt(doctor.doctorID, 10); // Convert doctorID to an integer
        setAppointmentData(prev => ({
            ...prev,
            doctorID: selectedDoctorID
        }));
        setSelectedDate('');
        setSelectedDoctor(doctor); // Set the entire doctor object
    };

    // const handleDateChange = (e) => {
    //     setSelectedDate(e.target.value);
    //     setAppointmentData(prev => ({
    //         ...prev,
    //         appointmentDate: e.target.value
    //     }));
    // };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setAppointmentData(prev => ({
            ...prev,
            appointmentDate: format(date, 'yyyy-MM-dd')
        }));
    };

    const handleNewPatient = () => {
        setShowNewPatient(true);
        setSelectedPatient(null);
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        return date.toLocaleTimeString('en-US', options);
    };

    const getAvailableDays = () => {
        const selectedDoctor = doctors.find(doctor => doctor.doctorID === appointmentData.doctorID);
        if (!selectedDoctor || !selectedDoctor.schedules) return [];
        return selectedDoctor.schedules.map(schedule => schedule.dayOfWeek);
    };

    const getAvailableTimes = () => {
        const selectedDoctor = doctors.find(doctor => doctor.doctorID === appointmentData.doctorID);
        if (!selectedDoctor || !selectedDoctor.schedules || !appointmentData.appointmentDate) return { startTime: '', endTime: '' };

        const appointmentDate = new Date(appointmentData.appointmentDate);
        const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

        const selectedDaySchedule = selectedDoctor.schedules.find(schedule => schedule.dayOfWeek === dayOfWeek);

        if (!selectedDaySchedule) {
            return { startTime: '', endTime: '' };
        }

        return {
            startTime: formatTime(selectedDaySchedule.startTime),
            endTime: formatTime(selectedDaySchedule.endTime),
        };
    };

    const { startTime, endTime } = getAvailableTimes();
    const availableDays = getAvailableDays();

    const dayMap = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
    };

    const availableDaysInNumbers = availableDays.map(day => dayMap[day]);

    const handleViewSchedule = () => {
        setShowScheduleModal(true);
    };

    const handleCloseScheduleModal = () => {
        setShowScheduleModal(false);
    };

    const getAvailableTimeSlots = () => {
        if (!selectedDoctor || !appointmentData.appointmentDate) return [];

        const appointmentDate = new Date(appointmentData.appointmentDate);
        const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

        const selectedDaySchedule = selectedDoctor.schedules.find(schedule => schedule.dayOfWeek === dayOfWeek);
        if (!selectedDaySchedule) return [];

        const { startTime, endTime, slotDuration } = selectedDaySchedule;
        const start = new Date(appointmentDate);
        const end = new Date(appointmentDate);

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        start.setHours(startHours, startMinutes, 0);
        end.setHours(endHours, endMinutes, 0);

        const availableSlots = [];
        const bookedTimes = appointments
            .filter(appointment => new Date(appointment.appointmentDate).toDateString() === appointmentDate.toDateString())
            .map(appointment => appointment.appointmentTime);

        for (let time = start; time < end; time.setMinutes(time.getMinutes() + slotDuration)) {
            const formattedStart = time.toTimeString().slice(0, 5); // "HH:mm"
            const nextTime = new Date(time);
            nextTime.setMinutes(nextTime.getMinutes() + slotDuration);
            const formattedEnd = nextTime.toTimeString().slice(0, 5); // "HH:mm"

            // Check if the time slot is already booked
            if (!bookedTimes.includes(formattedStart)) {
                // Push the formatted slot with AM/PM
                availableSlots.push(`${formatTime_2(formattedStart)} - ${formatTime_2(formattedEnd)}`);
            }
        }

        return availableSlots;
    };

    const formatTime_2 = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12
        return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    };

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            {!selectedPatient && !showNewPatient && (
                <>
                    <div className="flex gap-3 mb-2 mt-2 items-center align-middle">
                        <button onClick={() => navigate('/receptionist/upcoming-doctor-appointments')} className="text-success -mt-2">
                            <FaArrowLeft size={20} />
                        </button>
                        <h2 className="font-semibold text-2xl">
                            Set Appointment
                        </h2>
                    </div>

                    <Form className='mt-4'>
                        <Form.Group controlId="searchPatient">
                            <Form.Label>Search Patient by Phone Number or Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={searchInfo}
                                onChange={handleSearchChange}
                                placeholder="Enter phone number or name"
                            />
                        </Form.Group>
                    </Form>


                    {noData && <p>No data found</p>}
                    {!loading && patients.length > 0 && !showNewPatient && (
                        <>
                            <Table striped bordered hover className="mt-3">
                                <thead>
                                    <tr>
                                        <th>First Name</th>
                                        <th>Phone Number</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map(patient => (
                                        <tr key={patient.patientID}>
                                            <td>{patient.firstName}</td>
                                            <td>{patient.mobileNumber}</td>
                                            <td>
                                                <Button variant="primary" onClick={() => handleSelectPatient(patient)}>Select</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}

                    <Button variant="success" onClick={handleNewPatient} className="mt-3">
                        {loading ? <Spinner animation="border" size='sm' /> : "Add New Patient"}
                    </Button>
                </>
            )}

            {showNewPatient && (
                <div>
                    {/* <h2 className="font-semibold text-2xl mt-2">Add Patient</h2> */}
                    <RegisterPatient
                        doctors={doctors}
                        fetchDoctors={fetchDoctors}
                        selectedDoctor={selectedDoctor}
                        setSelectedDoctor={setSelectedDoctor}
                        onSuccess={() => {
                            setToastMessage('Patient registered successfully.');
                            setToastVariant('success');
                            setShowNewPatient(false);
                        }}
                        onFailure={(message) => {
                            setToastMessage(message || 'Failed to register patient.');
                            setToastVariant('danger');
                        }}

                    />
                </div>
            )}
            <Row>
                {selectedPatient && !showNewPatient && (
                    <>
                        <div className="flex gap-3 items-center align-middle">
                            <button onClick={() => navigate(-1)} className="text-success -mt-2">
                                <FaArrowLeft size={20} />
                            </button>
                            <h2 className='text-2xl font-semibold'>Set Appointment</h2>
                        </div>
                        <div className="bg-[#F8F8F8] rounded-md p-4 mb-4 shadow-sm">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <h6 className="text-[#00743C] uppercase text-sm font-normal">Full Name</h6>
                                    <p className="text-[#04394F] text-lg font-semibold">
                                        {selectedPatient.firstName}
                                    </p>
                                </div>
                                <div>
                                    <h6 className="text-[#00743C] uppercase text-sm font-normal">Gender</h6>
                                    <p className="text-[#04394F] text-lg font-semibold">
                                        {selectedPatient.gender}
                                    </p>
                                </div>
                                <div>
                                    <h6 className="text-[#00743C] uppercase text-sm font-normal">Contact No</h6>
                                    <p className="text-[#04394F] text-lg font-semibold">
                                        {selectedPatient.mobileNumber}
                                    </p>
                                </div>
                                <div>
                                    <h6 className="text-[#00743C] uppercase text-sm font-normal">Medical History</h6>
                                    <p className="text-[#04394F] text-lg font-semibold">
                                        {selectedPatient.medicalHistory || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <h6 className="text-[#00743C] uppercase text-sm font-normal">Registration Date</h6>
                                    <p className="text-[#04394F] text-lg font-semibold">
                                        {new Date(selectedPatient.registrationDate).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Col className="mt-2">
                            <h4>Appointment Details</h4>
                            <Form className='space-y-4 mt-4'>
                                <Form.Group controlId="doctorSelection">
                                    <Form.Label>Select Doctor</Form.Label>
                                    <Form.Control className='!border-[#04394F]' as="select" value={appointmentData.doctorID} onChange={(e) => handleDoctorChange(doctors.find(d => d.doctorID === parseInt(e.target.value)))} required disabled={fetchFromLocal}>
                                        <option value={0} disabled>Select a doctor...</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor.doctorID} value={doctor.doctorID}>
                                                {doctor.firstName} {doctor.lastName} - ({doctor.specialty})
                                            </option>
                                        ))}
                                    </Form.Control>
                                    {selectedDoctor && (
                                        <Button variant="link" onClick={handleViewSchedule}>
                                            View Schedule
                                        </Button>
                                    )}
                                </Form.Group>

                                {appointmentData.doctorID !== 0 && (
                                    <>
                                        {/* <Form.Group controlId="appointmentDate">
                                            <Form.Label>Select Appointment Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={appointmentData.appointmentDate}
                                                onChange={handleDateChange}
                                                required
                                            />
                                            {availableDays.length > 0 && (
                                                <Form.Text className="text-muted">
                                                    Available Days: {availableDays.join(', ')}
                                                </Form.Text>
                                            )}
                                        </Form.Group> */}

                                        <div className='flex flex-col'>
                                            <label className="text-[16px] font-medium leading-[22px] text-left mb-1">Appointment Date</label>
                                            <DatePicker
                                                selected={appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate) : null}
                                                onChange={handleDateChange}
                                                filterDate={(date) => availableDaysInNumbers.includes(date.getDay())}
                                                minDate={new Date()} // Disable past dates
                                                placeholderText="Select an appointment date"
                                                dateFormat="EEE, dd-MM-yyyy"  // Display day with date
                                                className="w-full !border-[1px] !border-solid !border-[#04394F] !text-black rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-[#04394F]"
                                                onKeyDown={(e) => e.preventDefault()}  // Prevent typing in the input field
                                                autoComplete="off"  // Disable auto-complete to ensure no suggestions pop up
                                                disabled={!selectedDoctor}
                                            />
                                            {/* {validationErrors.AppointmentDate && (
                                                <div className="text-red-500 text-sm">
                                                    {validationErrors.AppointmentDate}
                                                </div>
                                            )} */}
                                            {availableDays.length > 0 && (
                                                <div className="mt-2">
                                                    <strong>Available Days: </strong>{availableDays.join(', ')}
                                                </div>
                                            )}
                                        </div>

                                        {/* <Form.Group controlId="appointmentTime">
                                            <Form.Label>Select Appointment Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={appointmentData.appointmentTime}
                                                onChange={(e) => setAppointmentData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                                                required
                                                disabled={!appointmentData.appointmentDate}
                                                className='!border-[#04394F]'
                                            />
                                            {startTime && endTime && (
                                                <Form.Text className="text-muted">
                                                    Available Time: {startTime} to {endTime}
                                                </Form.Text>
                                            )}
                                        </Form.Group> */}

                                        <Form.Group controlId="formReferredByDoctor">
                                            <Form.Check
                                                type="checkbox"
                                                label="Referred by Doctor"
                                                checked={!!appointmentData.ReferredByDoctor} // Ensure it's a Boolean
                                                onChange={(e) => setAppointmentData(prev => ({
                                                    ...prev,
                                                    ReferredByDoctor: e.target.checked ? true : false, // Explicitly set to Boolean true or false
                                                    // appointmentTime: e.target.checked ? "" : appointmentData.appointmentTime // Clear appointmentTime if checked
                                                }))}
                                                className="text-[16px] font-medium leading-[22px]"
                                            />
                                        </Form.Group>

                                        {appointmentData.ReferredByDoctor && (
                                            <Form.Group controlId="formDoctor">
                                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Select Referred Doctor</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={referredDoctor}
                                                    onChange={(e) => {
                                                        setAppointmentData(prev => ({
                                                            ...prev,
                                                            ReferredDoctorName: e.target.value 
                                                        }));
                                                        setReferredDoctor(e.target.value);
                                                    }}
                                                    // isInvalid={!!validationErrors.ReferredDoctor}
                                                    className="!border-[#04394F]"
                                                >
                                                    <option value="">Select Referred Doctor</option>
                                                    {doctors.map((doctor) => (
                                                        <option key={doctor.doctorID} value={doctor.firstName}>
                                                            {doctor.firstName} {doctor.lastName} - ({doctor.specialty})
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                                {/* <Form.Control.Feedback type="invalid">
                                                    {validationErrors.ReferredDoctor}
                                                </Form.Control.Feedback> */}
                                            </Form.Group>
                                        )}

                                        <Form.Group controlId="formAppointmentTime">
                                            <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Appointment Time</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={appointmentData.appointmentTime}
                                                onChange={(e) => setAppointmentData(prev => ({
                                                    ...prev,
                                                    appointmentTime: e.target.value // Directly update appointmentTime
                                                }))}
                                                disabled={!selectedDoctor || !appointmentData.appointmentDate || appointmentData.ReferredByDoctor}
                                                className='!border-[#04394F]'
                                            >
                                                <option value="">Select Appointment Time</option>
                                                {getAvailableTimeSlots().map((slot, index) => (
                                                    <option key={index} value={slot.split(' - ')[0]}>{slot}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>


                                        <div className="mt-3 flex justify-between">
                                            <div className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    id="consultation"
                                                    value="Consultation"
                                                    checked={isConsultationSelected}
                                                    onChange={handleCheckboxChange}
                                                    className="custom-checkbox-input"
                                                />
                                                <label htmlFor="consultation" className="custom-checkbox-label">Consultation</label>
                                            </div>
                                            <div className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    id="procedure"
                                                    value="Procedure"
                                                    checked={isProcedureSelected}
                                                    onChange={handleCheckboxChange}
                                                    className="custom-checkbox-input"
                                                />
                                                <label htmlFor="procedure" className="custom-checkbox-label">Procedure</label>
                                            </div>
                                        </div>


                                        {isProcedureSelected && (
                                            <div className="flex justify-between mt-4">
                                                <h3 className="font-semibold text-xl">Procedure Items</h3>
                                                <Button variant="outline-primary" onClick={() => setShowModal(true)}>Add Procedure</Button>
                                            </div>
                                        )}

                                        {/* Procedure Items Table */}
                                        {isProcedureSelected && appointmentData.ProcedureItems.length > 0 ? (
                                            <div>
                                                <Table striped bordered hover responsive className="mt-3">
                                                    <thead>
                                                        <tr>
                                                            <th>Procedure ID</th>
                                                            <th>Procedure Name</th>
                                                            <th>Procedure Detail</th>
                                                            <th>Amount</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {appointmentData.ProcedureItems.map(item => (
                                                            <tr>
                                                                <td>{item.procedureItemID}</td>
                                                                <td>{item.ProcedureName}</td>
                                                                <td>{item.ProcedureDetail || 'N/A'}</td>
                                                                <td>{item.Amount}</td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        className='!text-xs'
                                                                        onClick={() => deleteProcedureItem(item.procedureItemID)}
                                                                        disabled={deletingId === item.procedureItemID}
                                                                    >
                                                                        {deletingId === item.procedureItemID ? (
                                                                            <Spinner as="span" animation="border" size="sm" />
                                                                        ) : (
                                                                            "Delete Procedure"
                                                                        )}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            isProcedureSelected && <div className="text-center mt-3">No procedure items added.</div>
                                        )}

                                        <div className='flex justify-between border-t-[1px] border-b-[1px] border-solid border-black pt-3'>
                                            <p>Total Amount</p>
                                            <p>{appointmentData?.Amount}</p>
                                        </div>

                                        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                                        <Button variant="outline-success" className="mt-4 border border-success text-success bg-white hover:!bg-[#00743C] hover:!text-white" onClick={handleFormSubmit} disabled={loading}>
                                            {loading ? 'Setting...' : 'Set Appointment'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </Col>
                    </>
                )}
                {selectedDoctor && selectedPatient && appointmentData.appointmentDate && (
                    <Col>
                        <Card>
                            <Card.Header>Upcoming Doctor's Appointments</Card.Header>
                            <Card.Body>
                                {fetchingAppointments ?
                                    <Spinner size='md'></Spinner>
                                    :
                                    <ListGroup>
                                        {appointments.length > 0 ? (
                                            appointments.map((appt, index) => {
                                                // Construct a valid appointment date and time
                                                const appointmentDateTime = new Date(appt.appointmentDate);

                                                // Check if the date is valid before formatting
                                                if (isNaN(appointmentDateTime.getTime())) {
                                                    return <ListGroup.Item key={index}>Invalid date</ListGroup.Item>;
                                                }

                                                // Find the doctor's schedule that matches the day of the appointment
                                                const doctorSchedule = selectedDoctor.schedules.find(
                                                    schedule => schedule.dayOfWeek === appointmentDateTime.toLocaleDateString('en-US', { weekday: 'long' })
                                                );

                                                if (!doctorSchedule) {
                                                    return <ListGroup.Item key={index}>No matching schedule found for this appointment.</ListGroup.Item>;
                                                }

                                                // Formatting the appointment start time
                                                const formattedStartTime = new Date(`${appt.appointmentDate.split('T')[0]}T${appt.appointmentTime}`)
                                                    .toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    });

                                                // Calculating the end time based on the slot duration
                                                const startTime = new Date(`${appt.appointmentDate.split('T')[0]}T${appt.appointmentTime}`);
                                                const endTime = new Date(startTime.getTime() + doctorSchedule.slotDuration * 60000); // Add slot duration in minutes

                                                const formattedEndTime = endTime.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                });

                                                // Formatting the date
                                                const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    weekday: 'long',
                                                });

                                                return (
                                                    <ListGroup.Item key={index}>
                                                        <strong>{formattedDate}</strong>: {appt.referredByDoctor ? "Referred By Doctor" : `${formattedStartTime} - ${formattedEndTime}`}
                                                        <div>
                                                            <strong>Patient:</strong> {appt.patient.firstName} ({appt.patient.mobileNumber})
                                                        </div>
                                                        <div>
                                                            <strong>Doctor:</strong> {appt.doctor.firstName} ({appt.doctor.mobileNumber})
                                                        </div>
                                                    </ListGroup.Item>
                                                );
                                            })
                                        ) : (
                                            <ListGroup.Item>No upcoming appointments found.</ListGroup.Item>
                                        )}
                                    </ListGroup>
                                }

                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* <DoctorScheduleModal
                show={showScheduleModal}
                handleClose={handleCloseScheduleModal}
                schedules={selectedDoctor.schedules}
            /> */}


            <Toast
                show={!!toastMessage}
                onClose={() => setToastMessage('')}
                delay={3000}
                autohide
                className={`position-fixed bottom-0 end-0 m-3 bg-${toastVariant}`}
            >
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>

            {selectedDoctor &&
                <DoctorScheduleModal
                    show={showScheduleModal}
                    handleClose={handleCloseScheduleModal}
                    schedules={selectedDoctor.schedules}
                />
            }

            {isProcedureSelected && (
                <AddProcedureModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    newProcedure={newProcedure}
                    setNewProcedure={setNewProcedure}
                    onAddProcedure={addProcedureItem}
                    doctors={doctors}
                    selectedDoctor={selectedDoctor}
                    setSelectedDoctor={setSelectedDoctor}
                    doctorDefaultSelected={false}
                />
            )}
        </div>
    );
};

export default SetAppointment;
