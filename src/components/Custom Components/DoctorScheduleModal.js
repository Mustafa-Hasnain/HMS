import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

const DoctorScheduleModal = ({ show, handleClose, schedules }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Doctor's Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {Array.isArray(schedules) && schedules.length > 0 ? (
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Slot Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(schedule => (
                                <tr key={schedule.doctorScheduleId}>
                                    <td>{schedule.dayOfWeek}</td>
                                    <td>{schedule.startTime}</td>
                                    <td>{schedule.endTime}</td>
                                    <td>{schedule.slotDuration} minutes</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="text-center">No schedules available.</div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DoctorScheduleModal;
