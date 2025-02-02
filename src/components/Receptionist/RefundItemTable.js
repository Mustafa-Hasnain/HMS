import React, { useEffect, useState } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { network_url } from "../Network/networkConfig";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../Custom Components/confirmationModal";

const RefundItemsTable = () => {
    const [refundItems, setRefundItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRefundId, setSelectedRefundId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);




    useEffect(() => {
        const fetchRefundItems = async () => {
            try {
                const response = await fetch(
                    `${network_url}/api/Receptionist/Get-Refunded-Items`
                );
                const data = await response.json();
                setRefundItems(data);
            } catch (error) {
                console.error("Error fetching refund items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRefundItems();
    }, []);

    const handleDelete = async (refundId) => {
        setIsDeleting(true);
        handleModalClose();

        try {
            const response = await fetch(
                `${network_url}/api/Receptionist/Delete-Refund/${refundId}`,
                { method: "DELETE" }
            );
            const data = await response.json();

            if (response.ok) {
                // Remove the deleted item from the list
                setRefundItems(refundItems.filter((item) => item.refundItemID !== refundId));
                toast.success("Item deleted successfully.");
            } else {
                toast.error("Error deleting the item.");
            }
        } catch (error) {
            console.error("Error deleting refund:", error);
            toast.error("Error deleting the item.");
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    const handleModalClose = () => setShowModal(false);

    const handleModalShow = (refundId) => {
        setSelectedRefundId(refundId);
        setShowModal(true);
    };


    return (
        <div className="container mx-auto p-4">
            <ToastContainer></ToastContainer>
            <div className='flex justify-between items-center mb-4'>
                <div className="flex gap-3 items-center align-middle">
                    <button onClick={() => navigate('/receptionist/refund-items')} className="text-success -mt-2">
                        <FaArrowLeft size={20} />
                    </button>
                    <h2 className="font-bold text-2xl">Refunded Items</h2>
                </div>
                {/* {loadingDoctors && <Spinner animation="border" variant="primary" />} */}
                <Button onClick={() => (navigate('/receptionist/add-refund-item'))} variant="outline-success">Add a Refund</Button>

            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead className="bg-gray-200">
                        <tr className="text-center">
                            <th>Refund ID</th>
                            <th>Amount Refunded</th>
                            <th>Patient Name</th>
                            <th>Item Type</th>
                            <th>Refunded On</th>
                            <th>Refund Reason</th>
                            <th>Invoice ID</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {refundItems.map((item) => (
                            <tr key={item.refundItemID} className="text-center">
                                <td>{item.refundItemID}</td>
                                <td className="text-green-500 font-semibold">
                                    Rs. {item.amountRefunded}/-
                                </td>
                                <td>{item.invoice.appointment.patient.firstName}</td>
                                <td>{item.itemType.replace(/([a-z])([A-Z])/g, '$1 $2')}</td>
                                <td>{new Date(item.refundedOn).toLocaleString()}</td>
                                <td>{item.refundReason || "N/A"}</td>
                                <td>{item.invoiceID}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleModalShow(item.refundItemID)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <Spinner size="sm" animation="border" /> : "Delete"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
             <ConfirmationModal
                show={showModal}
                onHide={handleModalClose}
                onConfirm={handleDelete}
                confirmText="Are you sure to delete this refund? This operation cannot be undone."
                confirmButtonText="Yes, Delete"
                cancelButtonText="Cancel"
                id={selectedRefundId}
            />
        </div>
    );
};

export default RefundItemsTable;
