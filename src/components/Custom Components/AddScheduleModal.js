import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddScheduleModal = ({ show, onHide, fetchSchedules, doctorID }) => {
    const [dayOfWeek, setDayOfWeek] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [slotDuration, setSlotDuration] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dayOfWeek || !startTime || !endTime || !slotDuration) {
            toast.error("Please fill in all fields!");
            return;
        }
        setLoading(true);
        try {
            await axios.post('https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/schedules', {
                doctorScheduleId: 0,
                doctorID: doctorID,
                dayOfWeek,
                startTime,
                endTime,
                slotDuration,
            });
            fetchSchedules();
            onHide();
            toast.success("Schedule added successfully!");
        } catch (error) {
            console.error("Error adding schedule:", error);
            toast.error("Error adding schedule. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className='space-y-4'>
                    <Form.Group controlId="dayOfWeek">
                        <Form.Label>Day of the Week</Form.Label>
                        <Form.Control
                            as="select"
                            value={dayOfWeek}
                            onChange={(e) => setDayOfWeek(e.target.value)}
                            required
                            className="!border-[#04394F] rounded-md"
                        >
                            <option value="">Select Day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="startTime">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="endTime">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                    </Form.Group>
                    <Form.Group controlId="slotDuration">
                        <Form.Label>Slot Duration (minutes)</Form.Label>
                        <Form.Control
                            as="select"
                            value={slotDuration}
                            onChange={(e) => setSlotDuration(e.target.value)}
                            required
                            className="!border-[#04394F] rounded-md"
                        >
                            <option value="">Select Duration</option>
                            <option value="15">15 minutes</option>
                            <option value="20">20 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="80">80 minutes</option>
                        </Form.Control>
                    </Form.Group>
                    <Button 
                        type="submit" 
                        variant="outline-success" 
                        className="transition duration-200 ease-in-out hover:bg-green-600 hover:text-white" 
                        disabled={loading}
                    >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Add Schedule"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddScheduleModal;
