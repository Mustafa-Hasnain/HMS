import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container, Table, Spinner, Alert, Modal, Form, Col, Row } from "react-bootstrap";
import "../../styles/patient_details.css";
import "../../styles/table.css";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import PaymentModal from "../Custom Components/PaymentModal";
import { useReactToPrint } from "react-to-print";
import PrintableInvoiceView from "../Custom Components/PrintInvoiceView";
import AddProcedureModal from "../Custom Components/AddProcedureModal";

const InvoiceDetails = () => {
    const { appointment_id } = useParams(); // Get appointment ID from the route params
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addloading, setAddLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [newProcedure, setNewProcedure] = useState({ ProcedureName: "", ProcedureDetail: "", Amount: "" });
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null); // Track which procedure item is being deleted
    const [refresh, updateRefresh] = useState(0);
    const [updatingInvoiceID, setUpdatingInvoiceID] = useState(null);
    const [submitting, setSubmitting] = useState(false);





    // Function to calculate age from date of birth
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

    useEffect(() => {
        if (!appointment_id) {
            setLoading(false);
            setError("No details found");
            return;
        }

        const fetchAppointmentDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/invoice-appointment-details/${appointment_id}`
                );
                console.log("Invoice-Appointment Data: ", response.data);
                setAppointment(response.data);
                setLoading(false);
            } catch (error) {
                setError("Unable to fetch appointment details");
                setLoading(false);
            }
        };

        fetchAppointmentDetails();
    }, [appointment_id, refresh]);

    const addProcedureItem = async (invoiceId) => {
        try {
            setAddLoading(true);
            const response = await axios.post(
                `https://mustafahasnain36-001-site1.gtempurl.com/add-procedure-item/${invoiceId}`,
                newProcedure
            );

            const addedProcedure = response.data;
            console.log("Procedure added: ", addedProcedure);

            // Update appointment state with the new procedure item and amount
            // setAppointment(prevAppointment => {
            //     const updatedInvoices = prevAppointment.invoices.map(invoice => {
            //         if (invoice.invoiceID === invoiceId) {
            //             return {
            //                 ...invoice,
            //                 procedureItems: [...invoice.procedureItems, addedProcedure],
            //                 amount: invoice.amount + addedProcedure.Amount // Adjust invoice amount
            //             };
            //         }
            //         return invoice;
            //     });

            //     return {
            //         ...prevAppointment,
            //         invoices: updatedInvoices,
            //     };
            // });
            updateRefresh(Math.random() * 3);

            // Close modal and clear the form
            setShowModal(false);
            setNewProcedure({ ProcedureName: "", ProcedureDetail: "", Amount: "" });
            toast.success("Procedure Item added Successfully.");
        } catch (error) {
            toast.error("Unable to add procedure item");
        }
        finally {
            setAddLoading(false);
        }
    };

    const deleteProcedureItem = async (invoiceId, procedureItemId) => {
        setDeletingId(procedureItemId); // Set the ID of the item being deleted
        try {
            await axios.post(`https://mustafahasnain36-001-site1.gtempurl.com/remove-procedure-item/${invoiceId}/${procedureItemId}`);
            toast.success("Procedure item deleted successfully.");

            // Update the appointment state to remove the deleted procedure item
            setAppointment(prevAppointment => {
                const updatedInvoices = prevAppointment.invoices.map(invoice => {
                    if (invoice.invoiceID === invoiceId) {
                        return {
                            ...invoice,
                            procedureItems: invoice.procedureItems.filter(item => item.procedureItemID !== procedureItemId),
                            amount: invoice.amount - invoice.procedureItems.find(item => item.procedureItemID === procedureItemId).amount // Decrease the amount
                        };
                    }
                    return invoice;
                });

                return {
                    ...prevAppointment,
                    invoices: updatedInvoices,
                };
            });
        } catch (error) {
            toast.error("Unable to delete procedure item.");
        } finally {
            setDeletingId(null); // Reset deleting state
        }
    };

    const printRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: 'Invoice Details'
    });

    const markAsPaid = (invoiceID) => {
        setSubmitting(true)
        setUpdatingInvoiceID(invoiceID);
        setLoading(true);
        axios.post('https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/invoice-pay', { invoiceID }).then((value) => {
            updateRefresh(Math.random() * 10);
        }).catch((error) => {
            console.error('Error marking invoice as paid:', error);
            toast.error(`Error marking invoice as paid: , ${error}`)
            setSubmitting(false);

        }).finally(() => {
            // This block will run regardless of success or failure
            setUpdatingInvoiceID(null); // Reset the updating invoice ID
            setShowPaymentModal(false); // Close the payment modal
            toast.success("Invoice Mark as Paid Successfully.")
            setSubmitting(false);
            setLoading(false);

        });
    }


if (loading) {
    return (
        <div className="text-center mt-4">
            <Spinner animation="border" variant="primary" />
        </div>
    );
}

if (error) {
    return (
        <Alert variant="danger" className="mt-4 text-center">
            {error}
        </Alert>
    );
}

if (!appointment) {
    return <div>No details found</div>;
}

const { patient, doctor, invoices } = appointment;



return (
    <>
        <Container className="pt-4">
            <div className="flex justify-between">
                <div className="flex gap-3 items-center align-middle">
                    <button onClick={() => navigate(-1)} className="text-success -mt-2">
                        <FaArrowLeft size={20} />
                    </button>
                    <h2 className="font-semibold text-2xl">Invoice Details</h2>
                </div>
                <div className="flex gap-3">
                    {invoices[0].status === "Paid" ? (
                        <Button variant="outline-success" disabled>
                            Invoice Paid
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline-success"
                                onClick={() => setShowPaymentModal(true)}
                            >
                                {submitting ? <Spinner size="sm"></Spinner> : "Mark as Paid"}
                            </Button>
                        </>
                    )}
                    <Button variant="outline-primary" onClick={handlePrint} className="ml-2 !flex !flex-row !gap-3 align-middle items-center">
                        <FaPrint /> Print
                    </Button>


                </div>
            </div>

            {/* Printable component hidden in the main UI */}
            <div style={{ display: "none" }}>
                <PrintableInvoiceView
                    ref={printRef}
                    patient={patient}
                    doctor={doctor}
                    invoices={invoices}
                    appointmentDate={appointment.appointmentDate}
                    appointmentTime={appointment.appointmentTime}
                />
            </div>

            <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 mt-4 rounded-md">
                <div className="patientDetails">
                    <p>Patient Name</p>
                    <h2>{patient.firstName}</h2>
                </div>
                <div className="patientDetails">
                    <p>Contact No</p>
                    <h2>{patient.mobileNumber}</h2>
                </div>
                <div className="patientDetails">
                    <p>Gender</p>
                    <h2>{patient.gender}</h2>
                </div>
                <div className="patientDetails">
                    <p>Date of Birth</p>
                    <h2>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</h2>
                </div>
                <div className="patientDetails">
                    <p>Age</p>
                    <h2>{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'} Years</h2>
                </div>
                <div className="patientDetails">
                    <p>Doctor Name</p>
                    <h2>{doctor.firstName} {doctor.lastName}</h2>
                </div>
                <div className="patientDetails">
                    <p>Consultation Fee</p>
                    <h2>{doctor.consultationFee}</h2>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <h3 className="font-semibold text-xl">Procedure Items</h3>
                <Button variant="outline-primary" onClick={() => setShowModal(true)}>Add Procedure</Button>
            </div>

            {invoices.some(invoice => invoice.procedureItems.length > 0) ? (
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Procedure ID</th>
                            <th>Procedure Name</th>
                            <th>Procedure Detail</th>
                            <th>Amount</th>
                            {invoices[0].status !== "Paid" && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.flatMap(invoice =>
                            invoice.procedureItems.map(item => (
                                <tr key={item.procedureItemID}>
                                    <td>{item.procedureItemID}</td>
                                    <td>{item.procedureName}</td>
                                    <td>{item.procedureDetail || 'N/A'}</td>
                                    <td>{item.amount}</td>
                                    {invoices[0].status !== "Paid" && <td><Button variant="outline-danger" className="!text-xs" onClick={() => deleteProcedureItem(invoice.invoiceID, item.procedureItemID)}
                                        disabled={deletingId !== null}>{deletingId === item.procedureItemID ? <Spinner as="span" animation="border" size="sm" /> : "Delete Procedure"}</Button></td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            ) : (
                <div className="text-center mt-3">No procedure items added.</div>
            )}

            <h3 className="font-semibold text-xl mt-4">Invoice</h3>

            <Table bordered hover responsive className="mt-3">
                <thead>
                    <tr>
                        <th>Invoice ID</th>
                        <th>Invoice Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        {/* <th>Due Date</th> */}
                        {/* <th>Payment Method</th> */}
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice.invoiceID}>
                            <td>{invoice.invoiceID}</td>
                            <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.status}</td>
                            {/* <td>{new Date(invoice.dueDate).toLocaleDateString()}</td> */}
                            {/* <td>{invoice.paymentMethod}</td> */}
                        </tr>
                    ))}
                </tbody>
            </Table>
            <AddProcedureModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                newProcedure={newProcedure}
                setNewProcedure={setNewProcedure}
                onAddProcedure={() => addProcedureItem(invoices[0].invoiceID)}
                loading={addloading}
            />
            <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                invoiceID={invoices[0].invoiceID}
                markAsPaid={() => markAsPaid(invoices[0].invoiceID)}
            />

        </Container>
        <ToastContainer></ToastContainer>
    </>
);
};

export default InvoiceDetails;
