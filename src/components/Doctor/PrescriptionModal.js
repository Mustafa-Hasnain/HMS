import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'react-bootstrap-icons'; // For print icon
import { useReactToPrint } from 'react-to-print';

const PrescriptionModal = ({
    showModal,
    setShowModal,
    prescriptionDetails,
    totalAmount,
    openFromPrescriptions,
}) => {
    const navigate = useNavigate();

    // const handlePrint = () => {
    //     const printContents = document.getElementById("prescription-content").innerHTML;
    //     const originalContents = document.body.innerHTML;
    //     document.body.innerHTML = printContents;
    //     window.print();
    //     document.body.innerHTML = originalContents;
    //     window.location.reload(); // Reload the page after printing
    // };

    const printRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: 'Prescription'
    });

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
            <Modal.Body ref={printRef}>
                <div id="prescription-content" className="p-4">
                    {prescriptionDetails ? (
                        <>
                            {/* Doctor and Patient Details */}
                            <div className="flex gap-[2%] mb-6">
                                {/* Doctor Details */}
                                <div className="flex-1 bg-white shadow-md rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-lg font-bold mb-2 text-green-700">Doctor Information</h4>
                                    <p><span className="font-semibold text-gray-700">Name:</span> {prescriptionDetails.doctor.firstName} {prescriptionDetails.doctor.lastName}</p>
                                    <p><span className="font-semibold text-gray-700">Contact:</span> {prescriptionDetails.doctor.mobileNumber}</p>
                                    <p><span className="font-semibold text-gray-700">Specialty:</span> {prescriptionDetails.doctor.specialty}</p>
                                </div>

                                {/* Patient Details */}
                                <div className="flex-1 bg-white shadow-md rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-lg font-bold mb-2 text-blue-700">Patient Information</h4>
                                    <p><span className="font-semibold text-gray-700">Name:</span> {prescriptionDetails.patient.firstName}</p>
                                    <p><span className="font-semibold text-gray-700">Contact:</span> {prescriptionDetails.patient.mobileNumber}</p>
                                    <p><span className="font-semibold text-gray-700">Gender:</span> {prescriptionDetails.patient.gender}</p>
                                    <p><span className="font-semibold text-gray-700">Medical History:</span> {prescriptionDetails.patient.medicalHistory}</p>
                                </div>
                            </div>


                            <hr className="my-4" />

                            {/* Prescription Type */}
                            <div className="text-lg">
                                <h4 className="font-semibold">Prescription Type</h4>
                                <p className="text-green-600 font-semibold">
                                    {prescriptionDetails.isForConsultation ? "Consultation" : ""}
                                    {prescriptionDetails.isForProcedure ? "Procedure" : ""}
                                </p>
                            </div>

                            <hr className="my-4" />

                            {/* Examination */}
                            <div className="text-lg">
                                <h4 className="font-semibold">Examination</h4>
                                <p>{prescriptionDetails.examination || "No examination details provided."}</p>
                            </div>

                            {/* Conditional Rendering */}
                            {prescriptionDetails.isForConsultation && (
                                <>
                                    <hr className="my-4" />
                                    <div className="text-lg">
                                        <h4 className="font-semibold">Lab Exam</h4>
                                        <p>{prescriptionDetails.labExam || "No lab exam details provided."}</p>
                                    </div>

                                    <hr className="my-4" />
                                    <div className="text-lg">
                                        <h4 className="font-semibold">Prescription Notes</h4>
                                        <p>{prescriptionDetails.prescriptionNotes || "No prescription notes provided."}</p>
                                    </div>
                                </>
                            )}

                            {prescriptionDetails.isForProcedure && (
                                <>
                                    <hr className="my-4" />
                                    <div className="text-lg">
                                        <h4 className="font-semibold">Procedure Details</h4>
                                        <p>{prescriptionDetails.procedureDetails || "No procedure details provided."}</p>
                                    </div>

                                    <hr className="my-4" />
                                    <div className="text-lg">
                                        <h4 className="font-semibold">Follow Up</h4>
                                        <p>{prescriptionDetails.followUp || "No follow-up details provided."}</p>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <p>Loading prescription details...</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer className="bg-gray-100">
                <Button variant="secondary" onClick={handleClose} className="py-2 px-4 border border-gray-400 text-gray-600 hover:bg-gray-200">
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handlePrint}
                    className="!flex items-center justify-center bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out"
                >
                    <Printer className="mr-2 w-5 h-5" /> Print
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default PrescriptionModal;
