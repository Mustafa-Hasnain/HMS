import React, { useState } from "react";
import axios from "axios";
import { Table, Button, Form, Container, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { network_url } from "../Network/networkConfig";
import RefundModal from "../Custom Components/RefundModal";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { formatPrice } from "../utils/FormatPrice";

const RefundItem = () => {
    const [invoiceId, setInvoiceId] = useState("");
    const [invoiceData, setInvoiceData] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch Invoice Data
    const fetchInvoiceDetails = async () => {
        if (!invoiceId) {
            toast.error("Please enter an Invoice ID.");
            return;
        }
        try {
            setLoading(true);
            setInvoiceData(null);
            const response = await axios.get(
                `${network_url}/api/Receptionist/Get-Invoice-Details/${invoiceId}`
            );
            setInvoiceData(response.data);
        } catch (error) {
            toast.error("Error fetching invoice details.");
        }
        finally {
            setLoading(false);
        }
    };

    // Handle Refund Button Click (Open Modal)
    const handleRefundClick = (item, type) => {
        setSelectedItem({ ...item, itemType: type });
        console.log("Selected Item: ", item);
        setShowModal(true);
    };

    const Reset = () => {
        setInvoiceData(null);
        setSelectedItem(null);
        setShowModal(false);
    }

    return (
        <Container className="mt-4">
            <div className='flex justify-between items-center mb-4'>
                <div className="flex gap-3 items-center align-middle">
                    <button onClick={() => navigate('/receptionist/refund-items')} className="text-success -mt-2">
                        <FaArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-2xl">Add a Refund</h2>
                </div>
                {/* {loadingDoctors && <Spinner animation="border" variant="primary" />} */}
            </div>

            {/* Invoice ID Input */}
            <div className="flex justify-center gap-3 mb-4">
                <Form.Control
                    type="number"
                    placeholder="Enter Invoice ID"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-64"
                />
                <Button variant="primary" onClick={fetchInvoiceDetails} disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="lg" /> : "Fetch Items"}
                </Button>
            </div>

            {/* Display Invoice Data */}
            {invoiceData && (
                <>
                    <h4 className="text-xl font-semibold mt-4">Invoice Details</h4>
                    <div className="bg-[#F8F8F8] grid grid-cols-1 md:grid-cols-3 gap-4 p-6 mt-4 rounded-md">
                        <div className="patientDetails">
                            <p>Invoice. No.</p>
                            <h2>{invoiceData.invoiceID}</h2>
                        </div>

                        <div className="patientDetails">
                            <p>Patient Name</p>
                            <h2>{invoiceData.appointment.patient.firstName}</h2>
                        </div>

                        <div className="patientDetails">
                            <p>MR. No.</p>
                            <h2>{invoiceData.appointment.patient.patientID}</h2>
                        </div>

                        <div className="patientDetails">
                            <p>Invoice Date</p>
                            <h2>{invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : 'N/A'}</h2>
                        </div>

                        <div className="patientDetails">
                            <p>Total Invoice Amount</p>
                            <h2>{formatPrice(invoiceData.amount)}</h2>
                        </div>
                    </div>

                    {/* Appointments & Secondary Appointments */}
                    <h5 className="mt-3">Appointments</h5>
                    {(!invoiceData.appointment && (!invoiceData.secondaryAppointments || invoiceData.secondaryAppointments.length === 0)) ? (
                        <p>No paid appointments available.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Doctor</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.appointment && invoiceData.appointment.paid && (
                                    <tr>
                                        <td>{invoiceData.appointment.appointmentID}</td>
                                        <td>{invoiceData.appointment.doctor?.firstName} {invoiceData.appointment.doctor?.lastName}</td>
                                        <td>{formatPrice(invoiceData.appointment.amount)}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    handleRefundClick(invoiceData.appointment, "Appointment")
                                                }
                                                disabled={parseInt(invoiceData.appointment?.amount) <= 0}
                                            >
                                                Refund
                                            </Button>
                                        </td>
                                    </tr>
                                )}
                                {invoiceData.secondaryAppointments.length > 0 ? (
                                    invoiceData.secondaryAppointments.map((item) => (
                                        <tr key={item.secondaryAppointmentID}>
                                            <td>{item.secondaryAppointmentID}</td>
                                            <td>{item?.doctor?.firstName} {item?.doctor?.lastName}</td>
                                            <td>{formatPrice(item.amount)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRefundClick(item, "SecondaryAppointment")}
                                                    disabled={parseInt(item?.amount) <= 0}
                                                >
                                                    Refund
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : null}
                            </tbody>
                        </Table>
                    )}

                    {/* Procedure Items */}
                    <h5 className="mt-3">Procedure Items</h5>
                    {invoiceData.procedureItems.length === 0 ? (
                        <p>No procedure items available.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Procedure Name</th>
                                    <th>Doctor</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.procedureItems.map((item) => (
                                    <tr key={item.procedureItemID}>
                                        <td>{item.procedureItemID}</td>
                                        <td>{item.procedureName}</td>
                                        <td>{item?.doctor?.firstName} {item?.doctor?.lastName}</td>
                                        <td>{formatPrice(item.amount)}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRefundClick(item, "ProcedureItem")}
                                                disabled={parseInt(item?.amount) <= 0}
                                            >
                                                Refund
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    {/* Invoice Inventory Items */}
                    <h5 className="mt-3">Inventory Items</h5>
                    {invoiceData.invoiceInventoryItems.length === 0 ? (
                        <p>No inventory items available.</p>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Quantity</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.invoiceInventoryItems.map((item) => (
                                    <tr key={item.invoiceInventoryItemID}>
                                        <td>{item.invoiceInventoryItemID}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatPrice(item.amount)}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    handleRefundClick(item, "InvoiceInventoryItem")
                                                }
                                                disabled={parseInt(item?.amount) <= 0}
                                            >
                                                Refund
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </>
            )}

            {/* Refund Modal */}
            {showModal && (
                <RefundModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    item={selectedItem}
                    invoiceId={invoiceId}
                    reset={Reset}
                />
            )}

            <ToastContainer />
        </Container>
    );
};

export default RefundItem;
