import React, { useState, useEffect } from 'react';
import { Button, Form, Breadcrumb, Toast, ListGroup, Card, Spinner, Table } from 'react-bootstrap';
import DoctorScheduleModal from './DoctorScheduleModal';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';  // Useful for formatting dates
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import AddProcedureModal from './AddProcedureModal';
import { network_url } from '../Network/networkConfig';


const RegisterPatient = () => {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [appointments, setAppointments] = useState([]); // To store the fetched appointments
    const [fetchFromLocal, setFetchFromLocal] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [referredDoctor, setReferredDoctor] = useState('');
    const [fetchingAppointments, setfetchingAppointments] = useState(false)


    const navigate = useNavigate();
    const location = useLocation();

    const [isProcedureSelected, setIsProcedureSelected] = useState(false);  // Track Procedure checkbox
    const [isConsultationSelected, setIsConsultationSelected] = useState(false);


    const fetchDoctors = async () => {
        try {
            const response = await axios.get(`${network_url}/api/Receptionist/doctors`);
            setDoctors(response.data);

            console.log("Doctors: ", response.data);

            // Check if doctor exists in localStorage
            const doctorData = JSON.parse(localStorage.getItem('doctor'));

            // Find doctor in the fetched doctors list
            const doctorInList = response.data.find(doc => doc.doctorID === doctorData.doctorID);
            // If the doctor from localStorage is in the list, set it as the selectedDoctor and make it immutable
            if (doctorInList) {
                setAppointmentData(prev => ({
                    ...prev,
                    appointment: { ...prev.appointment, DoctorID: doctorInList.doctorID }
                }));
                setSelectedDoctor(doctorInList);  // Set the doctor as selected
                setFetchFromLocal(true)
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    // const handleDoctorChange = (doctor) => {
    //     const selectedDoctorID = parseInt(doctor, 10); // Convert doctorID to an integer
    //     setAppointmentData(prev => ({
    //         ...prev,
    //         doctorID: selectedDoctorID
    //     }));
    //     setSelectedDate('');
    //     setSelectedDoctor(doctor);
    // };

    const handleDoctorChange = (doctor) => {
        if (doctor) {
            const selectedDoctorID = parseInt(doctor.doctorID, 10); // Convert doctorID to an integer
            setAppointmentData(prev => ({
                ...prev,
                appointment: {
                    DoctorID: selectedDoctorID,
                    AppointmentDate: '',
                    AppointmentTime: '',
                    Amount: 0,
                    ConsultationAmount: 0,
                    referredByDoctor: false,
                    ReferredDoctorName: referredDoctor,
                    isConsultation: isConsultationSelected,
                    ProcedureItems: []
                }
            }));

            setSelectedDoctor(doctor); // Set the entire doctor object
        } else {
            setAppointmentData(prev => ({
                ...prev,
                appointment: {
                    ...prev.appointment,
                    DoctorID: '' // Reset DoctorID if no doctor is selected
                }
            }));
            setSelectedDoctor(null); // Clear selected doctor if no option is selected
        }
        setSelectedDate('');
    };



    const [appointmentData, setAppointmentData] = useState({
        patient: {
            FirstName: '',
            MobileNumber: '',
            Gender: '',
            DateOfBirth: null,
            Email: '',
            Identification_Type: 'CNIC',
            Cnic: '',
            BloodGroup: '',
            MedicalHistory: '',
            username: '',
            Address: '',
            country: '',
            city: '',
            state: '',
            streetAddress: '',
            postalCode: '',
            license_no: ''
        },
        appointment: {
            DoctorID: '',
            AppointmentDate: '',
            AppointmentTime: '',
            Amount: 0,
            ConsultationAmount: 0,
            referredByDoctor: false,
            ReferredDoctorName: referredDoctor,
            isConsultation: isConsultationSelected,
            ProcedureItems: []
        }
    });

    const [newProcedure, setNewProcedure] = useState({
        ProcedureName: '',
        ProcedureDetail: '',
        Amount: 0,
        DoctorServiceID: '',
        DoctorID: ''
    });


    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get("https://countriesnow.space/api/v0.1/countries/states");
                setCountries(response.data.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when the country changes
    useEffect(() => {
        if (appointmentData.patient.country) {
            const selectedCountry = countries.find(
                (country) => country.name === appointmentData.patient.country
            );
            setStates(selectedCountry ? selectedCountry.states : []);
            setCities([]);
        }
    }, [appointmentData.patient.country, countries]);

    // Fetch cities when the state changes
    useEffect(() => {
        if (appointmentData.patient.state && appointmentData.patient.country) {
            const fetchCities = async () => {
                try {
                    const response = await axios.post(
                        "https://countriesnow.space/api/v0.1/countries/state/cities",
                        {
                            country: appointmentData.patient.country,
                            state: appointmentData.patient.state
                        }
                    );
                    setCities(response.data.data);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };
            fetchCities();
        }
    }, [appointmentData.patient.state, appointmentData.patient.country]);

    const handleInputChange = (field, value, parent = "patient") => {
        setAppointmentData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };



    const [deletingId, setDeletingId] = useState(null);

    const calculateTotalAmount = (isChecked, type) => {
        // Ensure all amounts are treated as numbers
        const procedureAmount = appointmentData.appointment.ProcedureItems.reduce((sum, item) => sum + Number(item.Amount), 0);

        // Ensure consultation and procedure fees are calculated as numbers
        const consultationFee = (isConsultationSelected || (type === 'Consultation' && isChecked))
            ? Number(selectedDoctor?.consultationFee ?? 0)
            : 0;

        const procedureFee = (isProcedureSelected || (type === 'Procedure' && isChecked))
            ? procedureAmount
            : 0;

        if (!isChecked) {
            if (type === 'Consultation') return isProcedureSelected ? procedureAmount : 0;
            if (type === 'Procedure') return isConsultationSelected ? Number(selectedDoctor?.consultationFee ?? 0) : 0;
        }

        return consultationFee + procedureFee;
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;

        if (value === 'Consultation') {
            setIsConsultationSelected(checked);
            setAppointmentData(prev => ({
                ...prev,
                appointment: {
                    ...prev.appointment,
                    ConsultationAmount: checked ? Number(selectedDoctor?.consultationFee ?? 0) : 0,
                    isConsultation: checked
                }
            }));
        } else if (value === 'Procedure') {
            setIsProcedureSelected(checked);
            // setAppointmentData(prev => ({
            //     ...prev,
            //     appointment: {
            //         ...prev.appointment,
            //         ConsultationAmount: 0, // Reset consultation amount if only procedure is selected
            //     }
            // }));
        }

        // Update the total Amount immediately based on the checked state
        setAppointmentData(prev => ({
            ...prev,
            appointment: {
                ...prev.appointment,
                Amount: calculateTotalAmount(checked, value)
            }
        }));
    };

    const handleDoctorSelectChange = (doctorID) => {
        const selectedDoctor = filteredDoctors.find(doc => doc.doctorID === parseInt(doctorID));
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



    const addProcedureItem = (finalProcedure) => {
        const newItem = { ...finalProcedure, procedureItemID: Date.now(), DoctorID: selectedDoctor?.doctorID };

        setAppointmentData(prev => ({
            ...prev,
            appointment: {
                ...prev.appointment,
                ProcedureItems: [...prev.appointment.ProcedureItems, newItem],
                Amount: prev.appointment.Amount + Number(finalProcedure.Amount) // Ensure Amount is treated as a number
            }
        }));


        setNewProcedure({ ProcedureName: '', ProcedureDetail: '', Amount: 0, DoctorServiceID: null, DoctorID: '' });
        setShowModal(false);
    };

    const deleteProcedureItem = (procedureItemID) => {
        setDeletingId(procedureItemID);
        const itemToDelete = appointmentData.appointment.ProcedureItems.find(item => item.procedureItemID === procedureItemID);

        setAppointmentData(prev => ({
            ...prev,
            appointment: {
                ...prev.appointment,
                ProcedureItems: prev.appointment.ProcedureItems.filter(item => item.procedureItemID !== procedureItemID),
                Amount: prev.appointment.Amount - (itemToDelete ? itemToDelete.Amount : 0) // Ensure itemToDelete is valid
            }
        }));
        setDeletingId(null);
    };



    useEffect(() => {
        if (selectedDoctor && selectedDoctor.doctorID) {

            fetchDoctorAppointments(selectedDoctor.doctorID);
        }
        console.log("Selected Doctor: ", selectedDoctor);
    }, [appointmentData.appointment.AppointmentDate]);

    const fetchDoctorAppointments = async (doctorID) => {
        try {
            setfetchingAppointments(true)
            const response = await fetch(`${network_url}/api/Receptionist/Appointment/${doctorID}/?date=${appointmentData.appointment.AppointmentDate}`);
            const data = await response.json();
            console.log("Appointments: ", data)
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
        finally {
            setfetchingAppointments(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchInput.toLowerCase())
    );

    const validateForm = () => {
        const errors = {};

        if (!appointmentData.patient.FirstName) errors.FirstName = 'First Name is required';
        if (!appointmentData.patient.Gender) errors.Gender = 'Please select the Gender';
        if (!selectedDoctor) errors.DoctorID = 'Please select a doctor';
        if (!appointmentData.patient.DateOfBirth) errors.DateOfBirth = 'Date of Birth is required';
        if (!appointmentData.patient.MobileNumber) {
            errors.MobileNumber = 'Mobile Number is required';
        } else if (!/^\d{11}$/.test(appointmentData.patient.MobileNumber)) {
            errors.MobileNumber = 'Mobile Number must be exactly 11 digits';
        }

        //if (!appointmentData.patient.Cnic) {
          //  errors.Cnic = 'CNIC is required';
        //} else if (!/^\d{13}$/.test(appointmentData.patient.Cnic)) {
         //   errors.Cnic = 'CNIC must be exactly 13 digits';
        //}

        // Condition: Both Consultation and Procedure are unselected
        if (!isProcedureSelected && !isConsultationSelected) {
            const message = 'Please select either a Procedure or a Consultation or both';
            errors.ConsultationOrProcedure = message;
            toast.error(message);
        }

        // Condition: Procedure selected but no procedure items
        if (isProcedureSelected && appointmentData.appointment.ProcedureItems.length === 0) {
            const message = 'Please add at least one Procedure item';
            errors.ProcedureItems = message;
            toast.error(message);
        }

        // Condition: Referred by doctor but no referred doctor name
        if (appointmentData.appointment.referredByDoctor && !referredDoctor) {
            const message = 'Referred Doctor Name is required.';
            errors.ReferredDoctorName = message;
            toast.error(message);
        }

        // Condition: Referred by doctor, appointment time not mandatory; otherwise, it is mandatory
        if (!appointmentData.appointment.referredByDoctor && !appointmentData.appointment.AppointmentTime) {
            const message = 'Appointment Time is required';
            errors.AppointmentTime = message;
            toast.error(message);
        }

        // Condition: Selected doctor must be set if not referred by another doctor
        if (!appointmentData.appointment.referredByDoctor && !selectedDoctor) {
            const message = 'Please select a Doctor';
            errors.SelectedDoctor = message;
            toast.error(message);
        }

        // Condition: Appointment date must be set
        if (!appointmentData.appointment.AppointmentDate) {
            const message = 'Appointment Date is required';
            errors.AppointmentDate = message;
            toast.error(message);
        }



        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isTimeSlotAvailable = () => {
        if (!appointmentData.appointment.AppointmentDate || !appointmentData.appointment.AppointmentTime) {
            return false;
        }

        const selectedDate = new Date(`${appointmentData.appointment.AppointmentDate}T${appointmentData.appointment.AppointmentTime}`);
        const selectedDaySchedule = selectedDoctor.schedules.find(schedule =>
            schedule.dayOfWeek === selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
        );

        if (!selectedDaySchedule) return false;

        const selectedTime = parseInt(appointmentData.appointment.AppointmentTime.replace(':', ''), 10);
        const startTime = parseInt(selectedDaySchedule.startTime.replace(':', ''), 10);
        const endTime = parseInt(selectedDaySchedule.endTime.replace(':', ''), 10);

        if (selectedTime < startTime || selectedTime >= endTime) {
            return false;
        }

        const slotDuration = selectedDaySchedule.slotDuration;
        const slotEndTime = selectedTime + slotDuration;

        // Check for appointment clashes
        const hasClash = appointments.some(appointment => {
            const appointmentTime = parseInt(appointment.appointmentTime.replace(':', ''), 10);
            const appointmentEndTime = appointmentTime + slotDuration;
            return (
                (selectedTime >= appointmentTime && selectedTime < appointmentEndTime) ||
                (slotEndTime > appointmentTime && slotEndTime <= appointmentEndTime)
            );
        });

        return !hasClash;
    };

    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
        setAppointmentData(prev => ({
            ...prev,
            appointment: { ...prev.appointment, DoctorID: doctor.doctorID }
        }));
    };

    const handleViewSchedule = () => {
        setShowScheduleModal(true);
    };

    const handleCloseScheduleModal = () => {
        setShowScheduleModal(false);
    };

    const validateForm_1 = () => {
        const errors = {};

        if (!appointmentData.patient.FirstName) errors.FirstName = 'First Name is required';
        if (!appointmentData.patient.MobileNumber) {
            errors.MobileNumber = 'Mobile Number is required';
        }
        else if (!/^\d{11}$/.test(appointmentData.patient.MobileNumber)) {
            errors.MobileNumber = 'Mobile Number must be exactly 11 digits';
        }

        // const idType = appointmentData.patient.Identification_Type;
        // const idValue = appointmentData.patient.Cnic;

        // if (!idValue) {
        //     errors.Cnic = `${idType} is required`;
        // } else {
        //     switch (idType) {
        //         case 'CNIC':
        //             if (!/^\d{13}$/.test(idValue)) {
        //                 errors.Cnic = 'CNIC must be exactly 13 digits';
        //             }
        //             break;
        //         case 'SSN':
        //             if (!/^\d{3}-\d{2}-\d{4}$/.test(idValue)) {
        //                 errors.Cnic = 'SSN must follow the format XXX-XX-XXXX';
        //             }
        //             break;
        //         case 'LicenseNo':
        //             if (!/^[a-zA-Z0-9]{5,20}$/.test(idValue)) {
        //                 errors.Cnic = 'License No must be alphanumeric and between 5-20 characters';
        //             }
        //             break;
        //         default:
        //             errors.Cnic = 'Invalid Identification Type';
        //     }
        // }

        if (!appointmentData.patient.Gender) errors.Gender = 'Please select the Gender';
        if (!appointmentData.patient.DateOfBirth) errors.DateOfBirth = 'Date of Birth is required';

        // if (!isTimeSlotAvailable()) {
        //     errors.AppointmentTime = 'Selected time slot is unavailable. Please choose a different time.';
        // }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (!validateForm_1()) {
            toast.error("Please Resolve all the Issues");
            return;
        }
        setStep(2);
        // fetchDoctors();
    };

    const handleRegisterPatient = async (e) => {
        e.preventDefault();
        if (!validateForm_1()) {
            toast.error("Please Resolve all the Issues");
            return;
        };

        setLoading(true);
        setToastMessage('');

        try {
            const patientData = appointmentData.patient;
            console.log("Patient Data Payload: ", patientData);

            const response = await fetch(`${network_url}/api/Receptionist/register-patient`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            });

            if (!response.ok) {
                throw new Error('Failed to register the patient.');
            }

            // setToastMessage('Appointment scheduled successfully.');
            toast.success('Patient Registered Successfully')
            setToastVariant('success');

            if (location.pathname.includes("/receptionist/")) {
                navigate("/receptionist/patients-portal");
            } else {
                navigate("/doctor/appointments");
            }

            setTimeout(() => {
                setAppointmentData({
                    patient: {
                        FirstName: '',
                        MobileNumber: '',
                        Gender: '',
                        DateOfBirth: null,
                        MedicalHistory: ''
                    },
                    appointment: {
                        DoctorID: '',
                        AppointmentDate: '',
                        AppointmentTime: '',
                    }
                });
                setSelectedDoctor(null);
                setStep(1);
            }, 1000);
        } catch (error) {
            // setToastMessage(error.message);
            toast.error(error.message);
            setToastVariant('danger');
        } finally {
            setLoading(false);
        }
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



    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            // toast.error("Please Resolve all the Issues");
            return;
        };

        setLoading(true);
        setToastMessage('');

        try {
            const appointmentTimeIn24hr = convertTo24HourFormat(appointmentData.appointment.AppointmentTime);

            const dataToSubmit = {
                ...appointmentData,
                appointment: {
                    ...appointmentData.appointment,
                    AppointmentTime: appointmentTimeIn24hr, // Use 24-hour format here
                }
            };

            const response = await fetch(`${network_url}/api/Receptionist/register-patient-and-schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (!response.ok) {
                throw new Error('Failed to schedule the appointment.');
            }

            // setToastMessage('Appointment scheduled successfully.');
            toast.success('Appointment Scheduled Successfully')
            setToastVariant('success');

            if (location.pathname.includes("/receptionist/")) {
                navigate("/receptionist/upcoming-doctor-appointments");
            } else {
                navigate("/doctor/appointments");
            }

            setTimeout(() => {
                setAppointmentData({
                    patient: {
                        FirstName: '',
                        MobileNumber: '',
                        Gender: '',
                        DateOfBirth: null,
                        MedicalHistory: ''
                    },
                    appointment: {
                        DoctorID: '',
                        AppointmentDate: '',
                        AppointmentTime: '',
                    }
                });
                setSelectedDoctor(null);
                setStep(1);
            }, 2000);
        } catch (error) {
            // setToastMessage(error.message);
            toast.error(error.message);
            setToastVariant('danger');
        } finally {
            setLoading(false);
        }
    };

    const isDateAvailable = (date) => {
        if (!selectedDoctor || !selectedDoctor.schedules) return false;
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        return selectedDoctor.schedules.some(schedule => schedule.dayOfWeek === day);
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
        if (!selectedDoctor || !selectedDoctor.schedules) return [];
        return selectedDoctor.schedules.map(schedule => schedule.dayOfWeek);
    };

    const getAvailableTimes = () => {
        if (
            !selectedDoctor ||
            !selectedDoctor.schedules ||
            !appointmentData.appointment.AppointmentDate
        ) {
            return { startTime: '', endTime: '' };
        }

        const appointmentDate = new Date(appointmentData.appointment.AppointmentDate);
        const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });

        const selectedDaySchedule = selectedDoctor.schedules.find(
            schedule => schedule.dayOfWeek === dayOfWeek
        );

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

    const handleDateChange = (date) => {
        setAppointmentData(prev => ({
            ...prev,
            appointment: { ...prev.appointment, AppointmentDate: format(date, 'yyyy-MM-dd') }
        }));
    };

    const handleDateOfBirthChange = (date) => {
        setAppointmentData(prev => ({
            ...prev,
            patient: { ...prev.patient, DateOfBirth: date }
        }));
    };

    const getAvailableTimeSlots = () => {
        if (!selectedDoctor || !appointmentData.appointment.AppointmentDate) return [];

        const appointmentDate = new Date(appointmentData.appointment.AppointmentDate);
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
        <div>
            <div className="flex gap-3 items-center align-middle">
                <button onClick={() => navigate('/receptionist/patients-portal')} className="text-success -mt-2">
                    <FaArrowLeft size={20} />
                </button>
                <h2 className="font-semibold text-2xl" >{step === 1 ? `Patient Registration` : `Set Appointment`}</h2>
            </div>

            {/* {toastMessage && (
                <Toast className={`mt-3 ${toastVariant === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            )} */}
            <ToastContainer></ToastContainer>

            {step === 1 && (
                <Form onSubmit={(e) => e.preventDefault()} className="space-y-4 w-[450px]">
                    {/* First Name */}
                    <Form.Group controlId="formFirstName">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={appointmentData.patient.FirstName}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, FirstName: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.FirstName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.FirstName}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Mobile Number */}
                    <Form.Group controlId="formMobileNumber">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Mobile Number</Form.Label>
                        <Form.Control
                            type="text"
                            value={appointmentData.patient.MobileNumber}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, MobileNumber: e.target.value.replace(/\D/g, '') }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.MobileNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.MobileNumber}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formGender">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Select Identification</Form.Label>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-4">

                                <input
                                    type="radio"
                                    id="genderMale"
                                    value="CNIC"
                                    checked={appointmentData.patient.Identification_Type === "CNIC"}
                                    onChange={(e) =>
                                        setAppointmentData((prev) => ({
                                            ...prev,
                                            patient: { ...prev.patient, Identification_Type: e.target.value },
                                        }))
                                    }
                                    className={`h-4 w-4 border-2 focus:ring-0 !border-[#04394F] '
                                        }`}
                                />
                                <label htmlFor="genderMale" className="text-[16px] font-medium leading-[22px]">
                                    CNIC
                                </label>
                            </div>

                            <div className="flex items-center space-x-4">
                                <input
                                    type="radio"
                                    id="genderFemale"
                                    value="SSN"
                                    checked={appointmentData.patient.Identification_Type === "SSN"}
                                    onChange={(e) =>
                                        setAppointmentData((prev) => ({
                                            ...prev,
                                            patient: { ...prev.patient, Identification_Type: e.target.value },
                                        }))
                                    }
                                    className={`h-4 w-4 border-2 focus:ring-0 !border-[#04394F] '
                                        }`}
                                />
                                <label htmlFor="genderFemale" className="text-[16px] font-medium leading-[22px]">
                                    SSN
                                </label>
                            </div>

                            <div className="flex items-center space-x-4">
                                <input
                                    type="radio"
                                    id="genderFemale"
                                    value="LicenseNo"
                                    checked={appointmentData.patient.Identification_Type === "LicenseNo"}
                                    onChange={(e) =>
                                        setAppointmentData((prev) => ({
                                            ...prev,
                                            patient: { ...prev.patient, Identification_Type: e.target.value },
                                        }))
                                    }
                                    className={`h-4 w-4 border-2 focus:ring-0 !border-[#04394F]'
                                        }`}
                                />
                                <label htmlFor="genderFemale" className="text-[16px] font-medium leading-[22px]">
                                    License No
                                </label>
                            </div>

                        </div>
                    </Form.Group>

                    <Form.Control
                        type="text"
                        value={appointmentData.patient.Cnic}
                        onChange={(e) => {
                            const input = e.target.value;
                            const filteredInput = (() => {
                                switch (appointmentData.patient.Identification_Type) {
                                    case 'CNIC':
                                        return input.replace(/\D/g, ''); // Allow only digits
                                    case 'SSN':
                                        return input.replace(/[^0-9-]/g, ''); // Allow digits and hyphens
                                    case 'LicenseNo':
                                        return input.replace(/[^a-zA-Z0-9]/g, ''); // Alphanumeric only
                                    default:
                                        return input;
                                }
                            })();
                            setAppointmentData((prev) => ({
                                ...prev,
                                patient: { ...prev.patient, Cnic: filteredInput },
                            }));
                        }}
                        className="!border-[#04394F]"
                        isInvalid={!!validationErrors.Cnic}
                    />
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.Cnic}
                    </Form.Control.Feedback>

                    {/* <Form.Group controlId="formCNIC">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Enter Identification No.</Form.Label>
                        <Form.Control
                            type="text"
                            value={appointmentData.patient.Cnic}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, Cnic: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.Cnic}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.Cnic}
                        </Form.Control.Feedback>
                    </Form.Group> */}

                    {/* <Form.Group controlId="formCNIC">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">License No (optional)</Form.Label>
                        <Form.Control
                            type="text"
                            value={appointmentData.patient.license_no}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, license_no: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.license_no}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.license_no}
                        </Form.Control.Feedback>
                    </Form.Group> */}

                    {/* Gender (Radio buttons) */}
                    <Form.Group controlId="formGender">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Gender</Form.Label>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-4">

                                <input
                                    type="radio"
                                    id="genderMale"
                                    value="Male"
                                    checked={appointmentData.patient.Gender === "Male"}
                                    onChange={(e) =>
                                        setAppointmentData((prev) => ({
                                            ...prev,
                                            patient: { ...prev.patient, Gender: e.target.value },
                                        }))
                                    }
                                    className={`h-4 w-4 border-2 focus:ring-0 !border-[#04394F] ${validationErrors.Gender ? 'border-red-500' : 'border-[#04394F]'
                                        }`}
                                />
                                <label htmlFor="genderMale" className="text-[16px] font-medium leading-[22px]">
                                    Male
                                </label>
                            </div>

                            <div className="flex items-center space-x-4">
                                <input
                                    type="radio"
                                    id="genderFemale"
                                    value="Female"
                                    checked={appointmentData.patient.Gender === "Female"}
                                    onChange={(e) =>
                                        setAppointmentData((prev) => ({
                                            ...prev,
                                            patient: { ...prev.patient, Gender: e.target.value },
                                        }))
                                    }
                                    className={`h-4 w-4 border-2 focus:ring-0 !border-[#04394F] ${validationErrors.Gender ? 'border-red-500' : 'border-[#04394F]'
                                        }`}
                                />
                                <label htmlFor="genderFemale" className="text-[16px] font-medium leading-[22px]">
                                    Female
                                </label>
                            </div>

                        </div>
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.Gender}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formBloodGroup">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Blood Group <span className='text-xs'>(optional)</span></Form.Label>
                        <Form.Control
                            as="select"
                            value={appointmentData.patient.BloodGroup || ""}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, BloodGroup: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.BloodGroup}
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.BloodGroup}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formEmail">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Email <span className='text-xs'>(optional)</span></Form.Label>
                        <Form.Control
                            type="email"
                            value={appointmentData.patient.Email}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, Email: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.Email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.Email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formDateOfBirth" className="flex flex-col">
                        <Form.Label>Date of Birth</Form.Label>
                        <DatePicker
                            selected={appointmentData.patient.DateOfBirth}
                            onChange={handleDateOfBirthChange}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select Date of Birth"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"  // Enables dropdowns for month and year
                            autoComplete="on"      // Enables autocomplete on typing
                            className="form-control !border-[#04394F] rounded-md"
                        />
                        {validationErrors.DateOfBirth && (
                            <div className="text-red-500 text-sm mt-1">
                                {validationErrors.DateOfBirth}
                            </div>
                        )}
                    </Form.Group>

                    {/* <Form.Group controlId="formMedicalHistory">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Patient Address <span className='text-xs'>(optional)</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={appointmentData.patient.Address}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, Address: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                        />
                    </Form.Group> */}

                    {/* Country */}
                    <Form.Group controlId="formCountry">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            as="select"
                            value={appointmentData.patient.country}
                            onChange={(e) => handleInputChange("country", e.target.value)}
                        >
                            <option value="">Select Country</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {/* State */}
                    <Form.Group controlId="formState">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                            as="select"
                            value={appointmentData.patient.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                        >
                            <option value="">Select State</option>
                            {states.map((state, index) => (
                                <option key={index} value={state.name}>
                                    {state.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {/* City */}
                    <Form.Group controlId="formCity">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            as="select"
                            value={appointmentData.patient.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                        >
                            <option value="">Select City</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city}>
                                    {city}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {/* Street Address */}
                    <Form.Group controlId="formStreetAddress">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                            type="text"
                            value={appointmentData.patient.streetAddress}
                            onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                        />
                    </Form.Group>

                    {/* Postal Code */}
                    <Form.Group controlId="formPostalCode">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="text"
                            value={appointmentData.patient.postalCode}
                            onChange={(e) => handleInputChange("postalCode", e.target.value.replace(/\D/g, ""))}
                        />
                    </Form.Group>


                    {/* Medical History */}
                    <Form.Group controlId="formMedicalHistory">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Medical History/Allergies <span className='text-xs'>(optional)</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={appointmentData.patient.MedicalHistory}
                            onChange={(e) => setAppointmentData(prev => ({
                                ...prev,
                                patient: { ...prev.patient, MedicalHistory: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                        />
                    </Form.Group>

                    {/* Next Button */}
                    <div className='flex gap-4'>
                        <Button
                            variant="outline-success"
                            className="border border-success text-success bg-white hover:!bg-[#00743C] hover:!text-white"
                            onClick={handleRegisterPatient}
                            disabled={loading}
                        >
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Register Patient"}
                        </Button>

                        <Button
                            variant="outline-primary"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Set Appointment"}
                        </Button>
                    </div>
                </Form>

            )}

            {step === 2 && (
                <div className="row">
                    <div className="col-md-6">
                        <Form className='space-y-4'>
                            <Form.Group controlId="formDoctor">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Select Doctor</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedDoctor ? selectedDoctor.doctorID : ''}
                                    // onChange={(e) => handleDoctorSelect(doctors.find(d => d.doctorID === parseInt(e.target.value)))}
                                    onChange={(e) => handleDoctorChange(doctors.find(d => d.doctorID === parseInt(e.target.value)))}
                                    isInvalid={!!validationErrors.DoctorID}
                                    className="!border-[#04394F]"
                                    disabled={fetchFromLocal}
                                >
                                    <option value="">Select Doctor</option>
                                    {filteredDoctors.map((doctor) => (
                                        <option key={doctor.doctorID} value={doctor.doctorID}>
                                            {doctor.firstName} {doctor.lastName} - ({doctor.specialty})
                                        </option>
                                    ))}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.DoctorID}
                                </Form.Control.Feedback>
                                {selectedDoctor && (
                                    <Button variant="link" onClick={handleViewSchedule}>
                                        View Schedule
                                    </Button>
                                )}
                            </Form.Group>

                            {/* <Form.Group controlId="formAppointmentDate">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Appointment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={appointmentData.appointment.AppointmentDate}
                                    onChange={(e) => setAppointmentData(prev => ({
                                        ...prev,
                                        appointment: { ...prev.appointment, AppointmentDate: e.target.value }
                                    }))}
                                    isInvalid={!!validationErrors.AppointmentDate}
                                    disabled={!selectedDoctor}
                                    className='!border-[#04394F]'
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.AppointmentDate}
                                </Form.Control.Feedback>
                                {availableDays.length > 0 && (
                                    <div className="mt-2">
                                        Available Days: {availableDays.join(', ')}
                                    </div>
                                )}
                            </Form.Group> */}
                            <div className='flex flex-col'>
                                <label className="text-[16px] font-medium leading-[22px] text-left mb-1">Appointment Date</label>
                                <DatePicker
                                    selected={appointmentData.appointment.AppointmentDate ? new Date(appointmentData.appointment.AppointmentDate) : null}
                                    onChange={handleDateChange}
                                    filterDate={(date) => availableDaysInNumbers.includes(date.getDay())}
                                    minDate={new Date()} // Disable past dates
                                    placeholderText="Select an appointment date"
                                    dateFormat="EEE, dd-MM-yyyy"  // Display day with date
                                    className="w-full !border-[1px] !border-solid !border-[#04394F] !text-black rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-[#04394F]"
                                    onKeyDown={(e) => e.preventDefault()}  // Prevent typing in the input field
                                    autoComplete="off"  // Disable auto-complete to ensure no suggestions pop up
                                    isInvalid={!!validationErrors.AppointmentDate}
                                    disabled={!selectedDoctor}
                                />
                                {validationErrors.AppointmentDate && (
                                    <div className="text-red-500 text-sm">
                                        {validationErrors.AppointmentDate}
                                    </div>
                                )}
                                {availableDays.length > 0 && (
                                    <div className="mt-2">
                                        <strong>Available Days: </strong>{availableDays.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* <Form.Group controlId="formAppointmentTime">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Appointment Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={appointmentData.appointment.AppointmentTime}
                                    onChange={(e) => setAppointmentData(prev => ({
                                        ...prev,
                                        appointment: { ...prev.appointment, AppointmentTime: e.target.value }
                                    }))}
                                    isInvalid={!!validationErrors.AppointmentTime}
                                    disabled={!selectedDoctor || !appointmentData.appointment.AppointmentDate}
                                    className='!border-[#04394F]'
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.AppointmentTime}
                                </Form.Control.Feedback>
                                {startTime && endTime && (
                                    <div className="mt-2">
                                        Available Time: {startTime} - {endTime}
                                    </div>
                                )}
                            </Form.Group> */}

                            <Form.Group controlId="formReferredByDoctor">
                                <Form.Check
                                    type="checkbox"
                                    label="Referred by Doctor"
                                    checked={!!appointmentData.appointment.referredByDoctor} // Ensure it's a Boolean
                                    onChange={(e) => setAppointmentData(prev => ({
                                        ...prev,
                                        appointment: {
                                            ...prev.appointment,
                                            referredByDoctor: e.target.checked ? true : false, // Explicitly set to Boolean true or false
                                            // appointmentTime: e.target.checked ? "" : appointmentData.appointment.AppointmentTime // Clear appointmentTime if checked
                                        }
                                    }))}
                                    className="text-[16px] font-medium leading-[22px]"
                                />
                            </Form.Group>

                            {appointmentData.appointment.referredByDoctor && (
                                <Form.Group controlId="formDoctor">
                                    <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Select Referred Doctor</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={referredDoctor}
                                        onChange={(e) => {
                                            setAppointmentData(prev => ({
                                                ...prev,
                                                appointment: { ...prev.appointment, ReferredDoctorName: e.target.value }
                                            }));
                                            setReferredDoctor(e.target.value);
                                        }}
                                        isInvalid={!!validationErrors.ReferredDoctor}
                                        className="!border-[#04394F]"
                                    >
                                        <option value="">Select Referred Doctor</option>
                                        {filteredDoctors.map((doctor) => (
                                            <option key={doctor.doctorID} value={doctor.firstName}>
                                                {doctor.firstName} {doctor.lastName} - ({doctor.specialty})
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.ReferredDoctor}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            <Form.Group controlId="formAppointmentTime">
                                <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Appointment Time</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={appointmentData.appointment.AppointmentTime}
                                    onChange={(e) => setAppointmentData(prev => ({
                                        ...prev,
                                        appointment: { ...prev.appointment, AppointmentTime: e.target.value }
                                    }))}
                                    isInvalid={!!validationErrors.AppointmentTime}
                                    disabled={!selectedDoctor || !appointmentData.appointment.AppointmentDate || appointmentData.appointment.referredByDoctor}
                                    className='!border-[#04394F]'
                                >
                                    <option value="">Select Appointment Time</option>
                                    {getAvailableTimeSlots().map((slot, index) => (
                                        <option key={index} value={slot.split(' - ')[0]}>{slot}</option>
                                    ))}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.AppointmentTime}
                                </Form.Control.Feedback>
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
                            {isProcedureSelected && appointmentData.appointment.ProcedureItems.length > 0 ? (
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
                                            {appointmentData.appointment.ProcedureItems.map(item => (
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

                            <div className='flex justify-between'>
                                <p>Total Amount</p>
                                <p>{appointmentData.appointment?.Amount}</p>
                            </div>

                            <Button
                                variant="outline-success"
                                className="border border-success text-success bg-white hover:!bg-[#00743C] hover:!text-white"
                                onClick={handleFormSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Save Patient and Set Appointment'}
                            </Button>
                        </Form>
                    </div>

                    {selectedDoctor && appointmentData.appointment.AppointmentDate && (
                        <div className="col-md-6">
                            <Card>
                                <Card.Header>Doctor's Appointments</Card.Header>
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
                        </div>
                    )}
                </div>
            )}
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

export default RegisterPatient;
