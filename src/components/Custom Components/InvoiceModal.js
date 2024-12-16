import React from "react";
import { Modal, Button } from "react-bootstrap";

const InvoiceDetailsModal = ({ show, onHide, patient, invoices }) => {
  const calculateAge = (birthDate) => {
    const diff = new Date() - new Date(birthDate);
    return Math.floor(diff / 31557600000); // Convert milliseconds to years
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Invoice Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-md">
          <div className="patientDetails">
            <p>MR. No.</p>
            <h2>{patient?.patientID || "N/A"}</h2>
          </div>
          <div className="patientDetails">
            <p>Invoice. No.</p>
            <h2>{invoices?.[0]?.invoiceID || "N/A"}</h2>
          </div>
          <div className="patientDetails">
            <p>Patient Name</p>
            <h2>{patient?.firstName || "N/A"}</h2>
          </div>
          <div className="patientDetails">
            <p>Contact No</p>
            <h2>{patient?.mobileNumber || "N/A"}</h2>
          </div>
          <div className="patientDetails">
            <p>CNIC</p>
            <h2>{patient?.cnic || "N/A"}</h2>
          </div>
          <div className="patientDetails">
            <p>Date of Birth</p>
            <h2>
              {patient?.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </h2>
          </div>
          <div className="patientDetails">
            <p>Age</p>
            <h2>
              {patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : "N/A"}{" "}
              Years
            </h2>
          </div>
          <div className="patientDetails">
            <p>Blood Group</p>
            <h2>{patient?.bloodGroup || "N/A"}</h2>
          </div>
          <div className="patientDetails">
            <p>Invoice Date</p>
            <h2>
              {invoices?.[0]?.invoiceDate
                ? new Date(invoices[0].invoiceDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </h2>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceDetailsModal;
