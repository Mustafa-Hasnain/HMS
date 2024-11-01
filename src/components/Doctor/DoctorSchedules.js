import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Spinner, Modal, Form, Toast } from 'react-bootstrap';
import AddScheduleModal from '../Custom Components/AddScheduleModal';
import EditScheduleModal from '../Custom Components/EditScheduleModal';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';


const DoctorSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    const doctorData = localStorage.getItem('doctor')
        ? JSON.parse(localStorage.getItem('doctor'))
        : null;

    const { doctor_id } = useParams();

    const doctorID = doctorData?.doctorID || doctor_id;


    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/schedules/${doctorID}`);
            setSchedules(response.data);
        } catch (error) {
            console.error("Error fetching schedules:", error);
            toast.error("Failed to fetch schedules.")
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            await axios.delete(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/schedules/${scheduleId}`);
            setSchedules(schedules.filter(schedule => schedule.doctorScheduleId !== scheduleId));
            // setToastMessage("Schedule deleted successfully.");
            // setToastVariant("success");
            // setShowToast(true);
            toast.success("Schedule deleted successfully.")
        } catch (error) {
            console.error("Error deleting schedule:", error);
            // setToastMessage("Failed to delete schedule.");
            // setToastVariant("danger");
            // setShowToast(true);
            toast.error("Failed to delete schedule.");
        }
    };

    const handleEditSchedule = (schedule) => {
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    const formatTimeTo12Hour = (time) => {
        const [hours, minutes] = time.split(':');
        const formattedHours = (hours % 12) || 12; // Converts 0 hours to 12
        const amPm = hours < 12 ? 'AM' : 'PM';
        return `${formattedHours}:${minutes} ${amPm}`;
    };

    return (
        <div className="pt-4">
            <ToastContainer />
            <div className="flex gap-3 mb-4">
                {/* <button onClick={() => navigate('/receptionist/doctors-portal')} className="text-success -mt-2">
                    <FaArrowLeft size={20} />
                </button> */}
                <h2 className="text-2xl font-semibold">Edit Doctor's Schedule</h2>
            </div>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedules.map(schedule => (
                        <Card key={schedule.doctorScheduleId} className="p-3 shadow-md">
                            <Card.Body>
                                <Card.Title>{schedule.dayOfWeek}</Card.Title>
                                <Card.Text>
                                    Start Time: {formatTimeTo12Hour(schedule.startTime)} <br />
                                    End Time: {formatTimeTo12Hour(schedule.endTime)} <br />
                                    Slot Duration: {schedule.slotDuration} minutes
                                </Card.Text>
                                <Button variant="warning" onClick={() => handleEditSchedule(schedule)}>
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDeleteSchedule(schedule.doctorScheduleId)} className="ml-2">
                                    Delete
                                </Button>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
            <Button variant="outline-success" onClick={() => setShowAddModal(true)} className="mt-4">
                Add Schedule
            </Button>

            <AddScheduleModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                fetchSchedules={fetchSchedules}
                doctorID={doctorID}
            />

            {selectedSchedule && (
                <EditScheduleModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    schedule={selectedSchedule}
                    fetchSchedules={fetchSchedules}
                />
            )}

            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                className={`bg-${toastVariant} text-white`}
            >
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </div>
    );
};

export default DoctorSchedule;
