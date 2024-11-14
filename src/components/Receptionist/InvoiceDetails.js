import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container, Table, Spinner, Alert, Modal, Form, Col, Row, Badge, Card } from "react-bootstrap";
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
    const [newProcedure, setNewProcedure] = useState({ ProcedureName: "", ProcedureDetail: "", Amount: "", DoctorID: null });
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null); // Track which procedure item is being deleted
    const [refresh, updateRefresh] = useState(0);
    const [updatingInvoiceID, setUpdatingInvoiceID] = useState(null);
    const [updatingAppointmentID, setUpdatingAppointmentID] = useState(null)
    const [submitting, setSubmitting] = useState(false);
    const [procedurefunction, setfunction] = useState(false); // false for consultation true for procedure
    const [functionId, setfunctionId] = useState(null);
    const [isPrimaryAppointment, setIsPrimaryAppointment] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctors, setDoctors] = useState([]);



    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getMeetingTime = (appointment) => {
        const startTime = formatTime(appointment.appointmentTime);
        const slotDuration = appointment.doctor.schedules.find(schedule => schedule.dayOfWeek === new Date(appointment.appointmentDate).toLocaleString('en-US', { weekday: 'long' }))?.slotDuration || 30;
        const endTime = new Date(new Date(`1970-01-01T${appointment.appointmentTime}`).getTime() + slotDuration * 60000)
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${startTime} - ${endTime}`;
    };


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

        const fetchDoctors = async () => {
            try {
                const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors');
                console.log("Doctors: ", response.data);
                setDoctors(response.data);

                // Check if doctor exists in localStorage
                const doctorData = JSON.parse(localStorage.getItem('doctor'));

                // Find doctor in the fetched doctors list
                const doctorInList = response.data.find(doc => doc.doctorID === doctorData.doctorID);

                // If the doctor from localStorage is in the list, set it as the selectedDoctor and make it immutable

                setSelectedDoctor(doctorInList);
            }
            catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchAppointmentDetails();
        fetchDoctors();
    }, [appointment_id, refresh]);

    const addProcedureItem = async (invoiceId, finalProcedure) => {
        try {
            setAddLoading(true);
            const response = await axios.post(
                `https://mustafahasnain36-001-site1.gtempurl.com/add-procedure-item/${invoiceId}`,
                finalProcedure
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

    const deletePrimaryAppointment = async (invoiceId, appointmentItemId) => {
        setDeletingId(appointmentItemId); // Set the ID of the item being deleted
        setSubmitting(true);
        try {
            await axios.post(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/remove-primary-appointment/${invoiceId}/${appointmentItemId}/delete`);
            toast.success("Appointment deleted successfully.");
            updateRefresh(Math.random() * 10);
        } catch (error) {
            toast.error("Unable to delete Appointment.");
        } finally {
            setDeletingId(null); // Reset deleting state
            setSubmitting(false);
        }
    };

    const deleteSecondaryAppointment = async (invoiceId, appointmentItemId) => {
        setDeletingId(appointmentItemId); // Set the ID of the item being deleted
        setSubmitting(true);
        try {
            await axios.post(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/remove-secondary-appointment/${invoiceId}/${appointmentItemId}`);
            toast.success("Appointment deleted successfully.");

            // Update the appointment state to remove the deleted procedure item
            setAppointment(prevAppointment => {
                const updatedInvoices = prevAppointment.invoices.map(invoice => {
                    if (invoice.invoiceID === invoiceId) {
                        return {
                            ...invoice,
                            secondaryAppointments: invoice.secondaryAppointments.filter(item => item.secondaryAppointmentID !== appointmentItemId),
                            amount: invoice.amount - invoice.secondaryAppointments.find(item => item.secondaryAppointmentID === appointmentItemId).amount // Decrease the amount
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
            toast.error("Unable to delete Appointment.");
        } finally {
            setDeletingId(null); // Reset deleting state
            setSubmitting(false);
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

    const handlePayProcedureItem = (id) => {
        setfunctionId(id);
        setfunction(true);
        setShowPaymentModal(true);
    }

    const handlePaySecondaryAppointment = (id) => {
        setfunctionId(id);
        setfunction(false);
        setShowPaymentModal(true);
    }

    const handlePayPrimaryAppointment = (id) => {
        setIsPrimaryAppointment(true);
        setfunctionId(id);
        setfunction(false);
        setShowPaymentModal(true);
    }

    const markAsPaidProcedureItem = async (procedureItemID) => {
        setSubmitting(true);
        try {
            await axios.post(`https://mustafahasnain36-001-site1.gtempurl.com/procedureitem-pay`, { procedureItemID });
            toast.success("Procedure Mark as Paid Successfully");
            setAppointment((prevAppointment) => {
                if (!prevAppointment) return prevAppointment; // No update if no appointment data

                // Map over invoices to find the procedure item and mark it as paid
                const updatedInvoices = prevAppointment.invoices.map((invoice) => {
                    const updatedProcedureItems = invoice.procedureItems.map((item) => {
                        if (item.procedureItemID === procedureItemID) {
                            return { ...item, paid: true };
                        }
                        return item;
                    });
                    return { ...invoice, procedureItems: updatedProcedureItems };
                });

                // Return the updated appointment object
                return { ...prevAppointment, invoices: updatedInvoices };
            });


        } catch (error) {
            toast.error("Error Occured.");
        } finally {
            setSubmitting(false);
            setfunctionId(null)
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


    const markAsPaidAppointment = (appointmentID) => {
        setSubmitting(true)
        setUpdatingAppointmentID(appointmentID);
        setLoading(true);
        let url = isPrimaryAppointment ? 'https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/appointment-pay' : 'https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/secondary-appointment-pay';
        axios.post(`${url}`, { appointmentID }).then((value) => {
            updateRefresh(Math.random() * 10);
        }).catch((error) => {
            console.error('Error marking invoice as paid:', error);
            toast.error(`Error marking invoice as paid: , ${error}`)
            setSubmitting(false);

        }).finally(() => {
            setUpdatingAppointmentID(null);
            setShowPaymentModal(false);
            toast.success("Invoice Mark as Paid Successfully.")
            setSubmitting(false);
            setLoading(false);
            setIsPrimaryAppointment(false);

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
    const primaryInvoice = invoices.find(invoice => invoice.isConsultationInvoice);
    const secondaryAppointments = primaryInvoice?.secondaryAppointments || [];
    const procedureItems = primaryInvoice?.procedureItems || [];
    const totalConsultations = (appointment.isConsultation && !appointment.isDeleted) ? secondaryAppointments.length + 1 : secondaryAppointments.length;

    const mainInvoice = invoices[0];
    const totalAppointments = (appointment.isConsultation && !appointment.isDeleted) ? mainInvoice.secondaryAppointments.length + 1 : mainInvoice.secondaryAppointments.length;
    const totalProcedures = mainInvoice.procedureItems.length;
    const totalPaidAppointments = mainInvoice.secondaryAppointments.filter(app => app.paid).length + (mainInvoice.paid ? 1 : 0);
    const totalUnpaidAppointments = totalAppointments - totalPaidAppointments;
    const totalPaidProcedures = mainInvoice.procedureItems.filter(item => item.paid).length;
    const totalUnpaidProcedures = totalProcedures - totalPaidProcedures;
    const totalAmount = mainInvoice.procedureItems.reduce((total, item) => total + item.amount, 0);


    let totalAppointmentAmount = 0;
    let totalAppointmentPaid = 0;
    let totalAppointmentUnpaid = 0;

    let totalProcedureAmount = 0;
    let totalProcedurePaid = 0;
    let totalProcedureUnpaid = 0;

    if ((appointment.isConsultation && !appointment.isDeleted)) {
        totalAppointmentAmount += appointment.amount;
        if (appointment.paid) {
            totalAppointmentPaid += appointment.amount;
        } else {
            totalAppointmentUnpaid += appointment.amount;
        }
    }

    appointment.invoices.forEach(invoice => {
        invoice.secondaryAppointments.forEach(appointment => {
            totalAppointmentAmount += appointment.amount;
            if (appointment.paid) {
                totalAppointmentPaid += appointment.amount;
            } else {
                totalAppointmentUnpaid += appointment.amount;
            }
        });
    });

    appointment.invoices.forEach(invoice => {
        invoice.procedureItems.forEach(item => {
            totalProcedureAmount += item.amount;
            if (item.paid) {
                totalProcedurePaid += item.amount;
            } else {
                totalProcedureUnpaid += item.amount;
            }
        });
    });

    const totalPaid = totalAppointmentPaid + totalProcedurePaid;
    const totalUnpaid = totalAppointmentUnpaid + totalProcedureUnpaid;

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
                        {/* {invoices[0].status === "Paid" ? (
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
                        )} */}
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
                        appointment={appointment}
                        appointmentDate={appointment.appointmentDate}
                        appointmentTime={appointment.appointmentTime}
                    />
                </div>

                <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 mt-4 rounded-md">
                    <div className="patientDetails">
                        <p>MR. No.</p>
                        <h2>{patient.patientID}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Invoice. No.</p>
                        <h2>{invoices[0].invoiceID}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Patient Name</p>
                        <h2>{patient.firstName}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Contact No</p>
                        <h2>{patient.mobileNumber}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>CNIC</p>
                        <h2>{patient.cnic}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Date of Birth</p>
                        <h2>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) : 'N/A'}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Age</p>
                        <h2>{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'} Years</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Blood Group</p>
                        <h2>{patient.bloodGroup || 'N/A'}</h2>
                    </div>
                    <div className="patientDetails">
                        <p>Invoice Date</p>
                        <h2>{invoices[0].invoiceDate ? new Date(invoices[0].invoiceDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) : 'N/A'}</h2>
                    </div>
                </div>


                {appointment ? (
                    <div>
                        <div className="flex justify-between mt-4">
                            <h3 className="font-semibold text-xl">Appointments/Consultation</h3>
                            <Button variant="outline-primary" onClick={() => (navigate(`/receptionist/set-appointment/${patient.patientID}/${invoices[0].invoiceID}`))}>Add Consultation</Button>
                        </div>

                        {invoices.some(invoice => invoice.secondaryAppointments.length > 0) || (appointment.isConsultation && !appointment.isDeleted) ? (
                            <Table striped bordered hover responsive className="mt-3">
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Patient Name</th>
                                        <th>Doctor Name</th>
                                        <th>Appointment Time</th>
                                        <th>Amount</th>
                                        <th>Invoice Status</th>
                                        <th>Appointment Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Primary Appointment Row */}
                                    {appointment.isConsultation && !appointment.isDeleted &&
                                        <tr>
                                            <td>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</td>
                                            <td>{appointment.patient.firstName}</td>
                                            <td>{appointment.doctor.firstName} {appointment.doctor.lastName}</td>
                                            <td>{appointment.referredByDoctor ? 'Referred By Doctor' : getMeetingTime(appointment)}</td>
                                            <td>{appointment.amount}</td>
                                            <td>
                                                <Badge bg={!appointment.paid ? 'danger' : 'success'}>
                                                    {!appointment.paid ? 'Unpaid' : 'Paid'}
                                                </Badge>
                                            </td>
                                            <td>{appointment.status}</td>
                                            <td>
                                                <div>
                                                    {!appointment.paid ?
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline-success"
                                                                className="!text-xs"
                                                                disabled={submitting}
                                                                onClick={() => { handlePayPrimaryAppointment(appointment.appointmentID) }}
                                                            >
                                                                Mark as Paid
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                className="!text-xs"
                                                                disabled={deletingId !== null || submitting}
                                                                onClick={() => deletePrimaryAppointment(invoices[0].invoiceID, appointment.appointmentID)}
                                                            >
                                                                {deletingId === appointment.appointmentID ? <Spinner as="span" animation="border" size="sm" /> : "Delete"}
                                                            </Button>
                                                        </div>
                                                        :
                                                        "Paid"
                                                    }
                                                </div>
                                            </td>
                                        </tr>

                                    }

                                    {/* Secondary Appointments Rows */}
                                    {invoices.map((invoice, invoiceIndex) =>
                                        invoice.secondaryAppointments.map((appt, apptIndex) => (
                                            <tr key={`${invoiceIndex}-${apptIndex}`}>
                                                <td>{new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</td>
                                                <td>{patient.firstName}</td>
                                                <td>{appt.doctor.firstName} {appt.doctor.lastName}</td>
                                                <td>{!appt.referredByDoctor ? getMeetingTime(appt) : 'Referred By Doctor'}</td>
                                                <td>{appt.amount}</td>
                                                <td>
                                                    <Badge bg={appt.paid ? 'success' : 'danger'}>
                                                        {appt.paid ? 'Paid' : 'Unpaid'}
                                                    </Badge>
                                                </td>
                                                <td>{appt.status}</td>
                                                <td>
                                                    {!appt.paid ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline-success"
                                                                className="!text-xs"
                                                                onClick={() => {
                                                                    handlePaySecondaryAppointment(appt.secondaryAppointmentID);
                                                                }}
                                                            >
                                                                Mark as Paid
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                className="!text-xs"
                                                                disabled={deletingId !== null || submitting}
                                                                onClick={() => deleteSecondaryAppointment(invoice.invoiceID, appt.secondaryAppointmentID)}
                                                            >
                                                                {deletingId === appt.secondaryAppointmentID ? <Spinner as="span" animation="border" size="sm" /> : "Delete"}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        "Paid"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}

                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center mt-3">No Consultations Added.</div>
                        )}
                    </div>
                ) : (
                    <div className="text-center mt-3">No Appointment Available.</div>
                )}

                {/* <div className="flex justify-between mt-4">
                    <h3 className="font-semibold text-xl">Appointments/Consultation</h3>
                    <Button variant="outline-primary" onClick={() => (navigate(`/receptionist/set-appointment/${patient.patientID}/${invoices[0].invoiceID}`))}>Add Consultation</Button>
                </div>


                {invoices.some(invoice => invoice.secondaryAppointments.length > 0) ? (
                    <Table striped bordered hover responsive className="mt-3">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Patient Name</th>
                                <th>Doctor Name</th>
                                <th>Appointment Time</th>
                                <th>Invoice Status</th>
                                <th>Appointment Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice, invoiceIndex) => (
                                invoice.secondaryAppointments.map((appt, apptIndex) => (
                                    <tr key={`${invoiceIndex}-${apptIndex}`}>
                                        <td>{new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</td>
                                        <td>{patient.firstName}</td>
                                        <td>{appt.doctor.firstName} {appt.doctor.lastName}</td>
                                        <td>{!appt.referredByDoctor ? getMeetingTime(appt) : 'Referred By Doctor'}</td>
                                        <td>
                                            <Badge bg={appt.paid ? 'success' : 'danger'}>
                                                {appt.paid ? 'Paid' : 'Unpaid'}
                                            </Badge>
                                        </td>
                                        <td>{appt.status}</td>
                                        <td>
                                            {!appt.paid ?
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline-success"
                                                        className="!text-xs"
                                                        onClick={() => {
                                                            handlePaySecondaryAppointment(appt.secondaryAppointmentID)
                                                        }}
                                                    >
                                                        Mark as Paid
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        className="!text-xs"
                                                        disabled={deletingId !== null || submitting}
                                                        onClick={() => { deleteSecondaryAppointment(invoice.invoiceID, appt.secondaryAppointmentID) }}
                                                    >
                                                        {deletingId === appt.secondaryAppointmentID ? <Spinner as="span" animation="border" size="sm" /> : "Delete"}
                                                    </Button>
                                                </div>
                                                :
                                                "Paid"
                                            }
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="text-center mt-3">No secondary appointments added.</div>
                )} */}

                <div className="flex justify-between mt-4">
                    <h3 className="font-semibold text-xl">Procedures</h3>
                    <Button variant="outline-primary" onClick={() => setShowModal(true)}>Add Procedure</Button>
                </div>
                {invoices.some(invoice => invoice.procedureItems.length > 0) ? (
                    <Table striped bordered hover responsive className="mt-3">
                        <thead>
                            <tr>
                                <th>Procedure ID</th>
                                <th>Procedure Name</th>
                                <th>Procedure Detail</th>
                                <th>Doctor</th>
                                <th>Amount</th>
                                <th>Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.flatMap(invoice =>
                                invoice.procedureItems.map(item => (
                                    <tr key={item.procedureItemID}>
                                        <td>{item.procedureItemID}</td>
                                        <td>{item.procedureName}</td>
                                        <td>{item.procedureDetail || 'N/A'}</td>
                                        <td className="text-center">{item?.doctor?.doctorID ? `${item.doctor.firstName} ${item.doctor.lastName}` : '-'}</td>
                                        <td>{item.amount}</td>
                                        <td className="flex gap-3">
                                            {!item.paid ? <Button variant="outline-success" disabled={submitting} className="!text-xs" onClick={() => { handlePayProcedureItem(item.procedureItemID) }}>Mark as Paid</Button> : "Paid"}
                                            {!item.paid && <Button variant="outline-danger" className="!text-xs" onClick={() => deleteProcedureItem(invoice.invoiceID, item.procedureItemID)}
                                                disabled={deletingId !== null || submitting}>{deletingId === item.procedureItemID ? <Spinner as="span" animation="border" size="sm" /> : "Delete Procedure"}</Button>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                ) : (
                    <div className="text-center mt-3">No procedure items added.</div>
                )}

                {/* <h3 className="font-semibold text-xl mt-4">Summary</h3> */}

                {/* <Table bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Invoice Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(invoice => (
                            <tr key={invoice.invoiceID}>
                                <td>{invoice.invoiceID}</td>
                                <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                                <td>{invoice.amount}</td>
                                <td>{invoice.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table> */}

                <Card className="border-[1px] shadow-md rounded-md p-4 mb-3 mt-4">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Invoice Summary</h5>

                    <Row className="border-b border-gray-200 py-2">
                        {/* <Col>
                            <div className="text-gray-600 text-sm font-medium">Patient Name</div>
                            <div className="text-gray-800 text-base font-semibold">{patient.firstName}</div>
                        </Col> */}

                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Consultations</div>
                            <div className="text-gray-800 text-base font-semibold">{totalConsultations}</div>
                        </Col>

                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Procedures</div>
                            <div className="text-gray-800 text-base font-semibold">{totalProcedures}</div>
                        </Col>

                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Consultations Paid</div>
                            <div className="text-gray-800 text-base font-semibold">{totalAppointmentPaid}</div>
                        </Col>
                    </Row>

                    <Row className="border-b border-gray-200 py-2">
                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Consultations Unpaid</div>
                            <div className="text-gray-800 text-base font-semibold">{totalUnpaidAppointments}</div>
                        </Col>

                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Procedures Paid</div>
                            <div className="text-gray-800 text-base font-semibold">{totalPaidProcedures}</div>
                        </Col>

                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Procedures Unpaid</div>
                            <div className="text-gray-800 text-base font-semibold">{totalProcedureUnpaid}</div>
                        </Col>
                    </Row>

                    <Row className="border-b border-gray-200 py-2">

                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Amount</div>
                            <div className="text-gray-800 text-lg font-bold">Rs. {totalAppointmentAmount + totalProcedureAmount}</div>
                        </Col>
                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Total Paid</div>
                            <div className="text-gray-800 text-lg font-bold">Rs. {totalPaid.toFixed(2)}</div>
                        </Col>
                        <Col>
                            <div className="text-gray-600 text-sm font-medium">Balance due</div>
                            <div className="text-gray-800 text-lg font-bold">Rs. {totalUnpaid.toFixed()}</div>
                        </Col>
                    </Row>
                </Card>


                {/* <AddProcedureModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    newProcedure={newProcedure}
                    setNewProcedure={setNewProcedure}
                    // onAddProcedure={() => addProcedureItem(invoices[0].invoiceID)}
                    onAddProcedure={(finalProcedure) => addProcedureItem(invoices[0].invoiceID, finalProcedure)}
                    loading={addloading}
                /> */}

                <AddProcedureModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    newProcedure={newProcedure}
                    setNewProcedure={setNewProcedure}
                    onAddProcedure={(finalProcedure) => addProcedureItem(invoices[0].invoiceID, finalProcedure)}
                    loading={addloading}
                    doctors={doctors}
                    selectedDoctor={selectedDoctor}
                    setSelectedDoctor={setSelectedDoctor}
                    doctorDefaultSelected={false}
                />
                <PaymentModal
                    show={showPaymentModal}
                    onHide={() => setShowPaymentModal(false)}
                    ID={functionId}
                    markAsPaid={procedurefunction ? () => markAsPaidProcedureItem(functionId) : () => markAsPaidAppointment(functionId)}
                />

            </Container>
            <ToastContainer></ToastContainer>
        </>
    );
};

export default InvoiceDetails;
