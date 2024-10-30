import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, onHide, onConfirm, confirmText = 'Are you sure to delete this doctor?', confirmButtonText = 'Delete', cancelButtonText = 'Cancel', id }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{confirmText}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    {cancelButtonText}
                </Button>
                <Button variant="outline-danger" onClick={()=>onConfirm(id)}>
                    {confirmButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
