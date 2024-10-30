import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PaymentModal = ({ show, onHide, invoiceID, markAsPaid }) => {
    const handlePayment = (paymentMethod) => {
        // Call the markAsPaid function with the invoiceID
        markAsPaid(invoiceID);
        // Close the modal after the action
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Payment Method</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Select the payment method:</p>
                <div className="flex justify-between">
                    <Button variant="outline-success" onClick={() => handlePayment('Cash')}>
                        Cash
                    </Button>
                    <Button variant="outline-success" onClick={() => handlePayment('Card')}>
                        Card
                    </Button>
                    <Button variant="outline-success" onClick={() => handlePayment('Online')}>
                        Online
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PaymentModal;
