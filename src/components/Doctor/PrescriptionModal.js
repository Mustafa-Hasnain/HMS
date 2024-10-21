import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'react-bootstrap-icons'; // For print icon

const PrescriptionModal = ({
    showModal,
    setShowModal,
    prescriptionDetails,
    totalAmount,
    openFromPrescriptions,
}) => {
    const navigate = useNavigate();

    // Function to handle print, printing only the prescription content
    const handlePrint = () => {
        const printContents = document.getElementById("prescription-content").innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload the page after printing
    };

    const handleClose = () => {
        setShowModal(false);
        if (openFromPrescriptions === false) {
            navigate('/doctor/prescriptions');
        }
    };

    return (
        <Modal 
            show={showModal} 
            onHide={handleClose} 
            size="lg" 
            centered 
            backdrop="static" // Prevent closing by clicking the backdrop
        >
            <Modal.Header closeButton>
                <Modal.Title>Prescription Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div id="prescription-content" className="p-4">
                    {prescriptionDetails ? (
                        <>
                            {/* Doctor Details */}
                            <div className="mb-4">
                                <h4 className="text-lg font-bold">Doctor Information</h4>
                                <p><strong>Name:</strong> {prescriptionDetails.doctor.firstName} {prescriptionDetails.doctor.lastName}</p>
                                <p><strong>Contact:</strong> {prescriptionDetails.doctor.mobileNumber}</p>
                                <p><strong>Specialty:</strong> {prescriptionDetails.doctor.specialty}</p>
                            </div>

                            <hr className="my-4" />

                            {/* Patient Details */}
                            <div className="mb-4">
                                <h4 className="text-lg font-bold">Patient Information</h4>
                                <p><strong>Name:</strong> {prescriptionDetails.patient.firstName}</p>
                                <p><strong>Contact:</strong> {prescriptionDetails.patient.mobileNumber}</p>
                                <p><strong>Gender:</strong> {prescriptionDetails.patient.gender}</p>
                                <p><strong>Medical History:</strong> {prescriptionDetails.patient.medicalHistory}</p>
                            </div>

                            <hr className="my-4" />

                            {/* Examination */}
                            <div className="mb-4">
                                <h4 className="text-lg font-bold">Examination Details</h4>
                                <p>{prescriptionDetails.examination || "No examination details provided."}</p>
                            </div>

                            <hr className="my-4" />

                            {/* Prescription */}
                            <div className="mb-4">
                                <h4 className="text-lg font-bold">Medication</h4>
                                <p>{prescriptionDetails.medication || "No medication details provided."}</p>
                            </div>

                            <hr className="my-4" />

                            {/* Total Amount */}
                            {/* <div className="mb-4">
                                <h4 className="text-lg font-bold">Total Amount</h4>
                                <p>Rs. {totalAmount}</p>
                            </div> */}
                        </>
                    ) : (
                        <p>Loading prescription details...</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handlePrint}>
                    <Printer className="mr-2" /> Print Prescription
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrescriptionModal;
