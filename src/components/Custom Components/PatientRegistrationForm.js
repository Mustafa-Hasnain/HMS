import React, { useState, useEffect } from 'react';
import { Button, Form, Breadcrumb, Toast, ListGroup, Card } from 'react-bootstrap';
import DoctorScheduleModal from './DoctorScheduleModal';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';  // Useful for formatting dates
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


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

    const navigate = useNavigate();
    const location = useLocation();




    const fetchDoctors = async () => {
        try {
            const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors');
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
                    ...prev.appointment,
                    DoctorID: selectedDoctorID // Update the DoctorID here
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
            MedicalHistory: ''
        },
        appointment: {
            DoctorID: '',
            AppointmentDate: '',
            AppointmentTime: ''
        }
    });

    useEffect(() => {
        if (selectedDoctor && selectedDoctor.doctorID) {
            fetchDoctorAppointments(selectedDoctor.doctorID);
        }
        console.log("Selected Doctor: ", selectedDoctor);
    }, [selectedDoctor]);

    const fetchDoctorAppointments = async (doctorID) => {
        try {
            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/Appointment/${doctorID}`);
            const data = await response.json();
            console.log("Appointments: ", data)
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
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
        if (!appointmentData.patient.MobileNumber) errors.MobileNumber = 'Mobile Number is required';
        if (!appointmentData.patient.Gender) errors.Gender = 'Please select the Gender';
        if (!selectedDoctor) errors.DoctorID = 'Please select a doctor';
        if (!appointmentData.patient.DateOfBirth) errors.DateOfBirth = 'Date of Birth is required';
        if (!appointmentData.appointment.AppointmentDate) errors.AppointmentDate = 'Appointment Date is required';
        if (!appointmentData.appointment.AppointmentTime) errors.AppointmentTime = 'Appointment Time is required';

        // if (!isTimeSlotAvailable()) {
        //     errors.AppointmentTime = 'Selected time slot is unavailable. Please choose a different time.';
        // }

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

    const handleNext = () => {
        setStep(2);
        // fetchDoctors();
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
        if (!validateForm()) return;

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

            const response = await fetch('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/register-patient-and-schedule', {
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

            <h2 className="font-semibold text-2xl" >{step === 1 ? `Patient Registration` : `Set Appointment`}</h2>


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
                                patient: { ...prev.patient, MobileNumber: e.target.value }
                            }))}
                            className="!border-[#04394F]"
                            isInvalid={!!validationErrors.MobileNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.MobileNumber}
                        </Form.Control.Feedback>
                    </Form.Group>

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

                    {/* Medical History */}
                    <Form.Group controlId="formMedicalHistory">
                        <Form.Label className="text-[16px] font-medium leading-[22px] text-left">Medical History/Allergies</Form.Label>
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
                    <Button
                        variant="outline-success"
                        className="border border-success text-success bg-white hover:!bg-[#00743C] hover:!text-white"
                        onClick={handleNext}
                    >
                        Set Appointment
                    </Button>
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
                                    disabled={!selectedDoctor || !appointmentData.appointment.AppointmentDate}
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

                            <Button
                                variant="outline-success"
                                className="border border-success text-success bg-white hover:!bg-[#00743C] hover:!text-white"
                                onClick={handleFormSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Save Patient and Set Appointment'}
                            </Button>
                        </Form>
                    </div>

                    {selectedDoctor && (
                        <div className="col-md-6">
                            <Card>
                                <Card.Header>Doctor's Appointments</Card.Header>
                                <Card.Body>
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
                                                        <strong>{formattedDate}</strong>: {formattedStartTime} - {formattedEndTime}
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
        </div>
    );
};

export default RegisterPatient;
