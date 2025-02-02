import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { network_url } from "../Network/networkConfig";
import { useNavigate } from "react-router-dom";

const RefundModal = ({ show, handleClose, item, invoiceId, reset }) => {
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRefundSubmit = async () => {
        if (!refundAmount || refundAmount <= 0 || refundAmount > item.amount) {
            toast.error("Invalid refund amount.");
            return;
        }
        if (!refundReason.trim()) {
            toast.error("Refund reason is required.");
            return;
        }
        const item_id = `${item.itemType.charAt(0).toLowerCase()}${item.itemType.slice(1)}ID`;
        console.log(item_id)
        try {
            setLoading(true);
            await axios.post(`${network_url}/api/Receptionist/Refund-Item`, {
                invoiceID: parseInt(invoiceId),
                itemID: parseInt(item[item_id]),
                itemType: item.itemType,
                amountRefunded: parseFloat(refundAmount),
                refundReason,
            });

            toast.success("Item Refunded Successfully.");
            reset();
            handleClose();
            navigate('/receptionist/refund-items')
        } catch (error) {
            toast.error("Error processing refund.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Refund Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Refund Amount</Form.Label>
                        <Form.Control
                            type="number"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Refund Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={loading} variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleRefundSubmit} disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : "Submit Refund"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RefundModal;
