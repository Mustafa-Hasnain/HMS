import React, { useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import PrescriptionModal from './PrescriptionModal';

const PrescriptionTableModal = ({
    showModal,
    setShowModal,
    prescriptions,
    handleSearch,
    searchQuery,
}) => {
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const handleViewPrescription = (prescription) => {
        setSelectedPrescription(prescription);
        setShowDetailsModal(true);
    };

    const handleClose = () => {
        setShowDetailsModal(false);
        setSelectedPrescription(null);
    };

    return (
        <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Prescriptions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    type="text"
                    placeholder="Search by patient name or phone number"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="mb-4"
                />
                <div className="overflow-y-auto max-h-96">
                    {prescriptions.length === 0 ? (
                        <p>No prescriptions available.</p>
                    ) : (
                        <Table bordered hover responsive className="table-auto w-full">
                            <thead className="thead-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Patient Name</th>
                                    <th>Phone Number</th>
                                    <th>Date Issued</th>
                                    <th>Invoice ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((prescription, index) => (
                                    <tr key={prescription.prescriptionID}>
                                        <td>{index + 1}</td>
                                        <td>{prescription.patient.firstName}</td>
                                        <td>{prescription.patient.mobileNumber}</td>
                                        <td>{new Date(prescription.dateIssued).toLocaleDateString()}</td>
                                        <td>{prescription.invoiceID}</td>
                                        <td>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => handleViewPrescription(prescription)}
                                                >
                                                    View Prescription
                                                </Button>
                                                {/* <Button
                                                    variant="outline-success"
                                                    onClick={() => alert(`Navigate to invoice ${prescription.invoiceID}`)}
                                                >
                                                    View Details
                                                </Button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Close
                </Button>
            </Modal.Footer>

            {/* Nested Modal for Prescription Details */}
            {selectedPrescription && (
                <PrescriptionModal
                    showModal={showDetailsModal}
                    setShowModal={setShowDetailsModal}
                    prescriptionDetails={selectedPrescription}
                    totalAmount={totalAmount}
                    inventoryItems={inventoryItems}
                    openFromPrescriptions={true}
                />
            )}
        </Modal>
    );
};
export default PrescriptionTableModal;
