import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'react-bootstrap-icons'; // For print icon
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { FaDownload, FaEnvelope } from 'react-icons/fa';


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

    const handleDownloadPDF = () => {
        const element = printRef.current;
        const options = {
            margin: 1,
            filename: 'Prescription.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().from(element).set(options).save();
    };

    const handleClose = () => {
        setShowModal(false);
        if (openFromPrescriptions === false) {
            navigate('/doctor/prescriptions');
        }
    };

    const calculateAge = (dateString) => {
        const birthDate = new Date(dateString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Adjust if the current month and day are before the birth month and day
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
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
                <Modal.Title>{openFromPrescriptions ? "Prescription Actions" : "Prescription Details"}</Modal.Title>
            </Modal.Header>
            {openFromPrescriptions &&
                <Modal.Body ref={printRef}>
                    <div id="prescription-content" className="p-4">
                        {prescriptionDetails ? (
                            <>
                                {/* <div className="flex gap-[2%] mb-6">
                                <div className="flex-1 bg-white shadow-md rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-lg font-bold mb-2 text-green-700">Doctor Information</h4>
                                    <p><span className="font-semibold text-gray-700">Name:</span> {prescriptionDetails.doctor.firstName} {prescriptionDetails.doctor.lastName}</p>
                                    <p><span className="font-semibold text-gray-700">Contact:</span> {prescriptionDetails.doctor.mobileNumber}</p>
                                    <p><span className="font-semibold text-gray-700">Specialty:</span> {prescriptionDetails.doctor.specialty}</p>
                                </div>

                                <div className="flex-1 bg-white shadow-md rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-lg font-bold mb-2 text-blue-700">Patient Information</h4>
                                    <p><span className="font-semibold text-gray-700">Name:</span> {prescriptionDetails.patient.firstName}</p>
                                    <p><span className="font-semibold text-gray-700">Contact:</span> {prescriptionDetails.patient.mobileNumber}</p>
                                    <p><span className="font-semibold text-gray-700">Gender:</span> {prescriptionDetails.patient.gender}</p>
                                    <p><span className="font-semibold text-gray-700">Medical History:</span> {prescriptionDetails.patient.medicalHistory}</p>
                                </div>
                            </div> */}

                                <div className="bg-[#F8F8F8] grid grid-cols-3 md:grid-cols-3 gap-4 p-6 mt-2 rounded-md">
                                    <div className="patientDetails">
                                        <p>MR. No.</p>
                                        <h2>{prescriptionDetails.patientID}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Invoice. No.</p>
                                        <h2>{prescriptionDetails.invoiceID}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Patient Name</p>
                                        <h2>{prescriptionDetails.patient.firstName}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Contact No</p>
                                        <h2>{prescriptionDetails.patient.mobileNumber}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>CNIC</p>
                                        <h2>{prescriptionDetails.patient.cnic}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Date of Birth</p>
                                        <h2>{prescriptionDetails.patient.dateOfBirth ? new Date(prescriptionDetails.patient.dateOfBirth).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A'}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Age</p>
                                        <h2>{prescriptionDetails.patient.dateOfBirth ? calculateAge(prescriptionDetails.patient.dateOfBirth) : 'N/A'} Years</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Blood Group</p>
                                        <h2>{prescriptionDetails.patient.bloodGroup || 'N/A'}</h2>
                                    </div>
                                    <div className="patientDetails">
                                        <p>Invoice Date</p>
                                        <h2>{prescriptionDetails.invoice ? new Date(prescriptionDetails.invoice.invoiceDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : 'N/A'}</h2>
                                    </div>
                                </div>


                                <hr className="my-4" />

                                {/* <div className="text-lg">
                                <h4 className="font-semibold">Prescription Type</h4>
                                <div className='flex gap-1'>
                                    <p className="text-green-600 font-semibold">
                                        {prescriptionDetails.isForConsultation ? "Consultation" : ""}
                                    </p>
                                    <p className="text-green-600 font-semibold">
                                        {prescriptionDetails.isForConsultation & prescriptionDetails.isForProcedure ? "|" : ""}
                                    </p>
                                    <p className="text-green-600 font-semibold">
                                          {prescriptionDetails.isForProcedure ? " Procedure" : ""}
                                    </p>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="text-lg">
                                <h4 className="font-semibold">Examination</h4>
                                <p>{prescriptionDetails.examination || "No examination details provided."}</p>
                            </div>

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
                            )} */}

                                <div className="text-lg">
                                    {prescriptionDetails.hasProblem && (
                                        <>
                                            <h4 className="font-semibold">Problem</h4>
                                            <p>{prescriptionDetails.problem}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasHistory && (
                                        <>
                                            <h4 className="font-semibold">History</h4>
                                            <p>{prescriptionDetails.history}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasExamination && (
                                        <>
                                            <h4 className="font-semibold">Examination</h4>
                                            <p>{prescriptionDetails.examination}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasFamilyHistory && (
                                        <>
                                            <h4 className="font-semibold">Family History</h4>
                                            <p>{prescriptionDetails.familyHistory}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasSocial && (
                                        <>
                                            <h4 className="font-semibold">Social History</h4>
                                            <p>{prescriptionDetails.social}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasComment && (
                                        <>
                                            <h4 className="font-semibold">Comment</h4>
                                            <p>{prescriptionDetails.comment}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasMedication && (
                                        <>
                                            <h4 className="font-semibold">Medication</h4>
                                            <p>{prescriptionDetails.medication}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasFollowUp && (
                                        <>
                                            <h4 className="font-semibold">Follow-Up</h4>
                                            <p>{prescriptionDetails.followUp}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasProcedure && (
                                        <>
                                            <h4 className="font-semibold">Procedure Details</h4>
                                            <p>{prescriptionDetails.procedureDetails}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasAllergy && (
                                        <>
                                            <h4 className="font-semibold">Allergy</h4>
                                            <p>{prescriptionDetails.allergy}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasTreatment && (
                                        <>
                                            <h4 className="font-semibold">Treatment</h4>
                                            <p>{prescriptionDetails.treatment}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}

                                    {prescriptionDetails.hasPrecautions && (
                                        <>
                                            <h4 className="font-semibold">Precautions</h4>
                                            <p>{prescriptionDetails.precautions}</p>
                                            <hr className="my-4" />
                                        </>
                                    )}
                                </div>
                                
                                <div className="mt-[14%] text-lg text-right">
                                    <p>
                                        Signed By: {" "}
                                        {prescriptionDetails.doctor.firstName.startsWith("Dr.") ? (
                                            <span className="font-bold">
                                                {prescriptionDetails.doctor.firstName} {prescriptionDetails.doctor.lastName}
                                            </span>
                                        ) : (
                                            <>

                                                <span className="font-bold">
                                                    Dr. {prescriptionDetails.doctor.firstName} {prescriptionDetails.doctor.lastName}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p>Loading prescription details...</p>
                        )}
                    </div>
                </Modal.Body>}
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
                <Button
                    variant="info"
                    onClick={handleDownloadPDF}
                    className="!flex items-center justify-center bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out"
                >
                    <FaDownload className="mr-2 w-5 h-5" /> Download PDF
                </Button>
                {/* <Button
                    variant="success"
                    className="!flex items-center justify-center bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out"
                >
                    <FaEnvelope className="mr-2 w-5 h-5" /> Email Patient
                </Button> */}

            </Modal.Footer>
        </Modal>
    );
};

export default PrescriptionModal;
