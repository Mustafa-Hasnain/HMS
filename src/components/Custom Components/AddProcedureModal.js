import React, { useState, useEffect, useCallback } from 'react';
import { Button, Col, Form, Modal, Row } from "react-bootstrap";


// Modal component for adding a procedure item
const AddProcedureModal = ({ show, handleClose, newProcedure, setNewProcedure, onAddProcedure, loading }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProcedure(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Procedure Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="procedureName">
                                <Form.Label>Procedure Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="ProcedureName"
                                    value={newProcedure.ProcedureName}
                                    onChange={handleChange}
                                    placeholder="Enter procedure name"
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="amount">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="Amount"
                                    value={newProcedure.Amount}
                                    onChange={handleChange}
                                    placeholder="Enter amount"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group controlId="procedureDetail">
                        <Form.Label>Procedure Detail</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="ProcedureDetail"
                            value={newProcedure.ProcedureDetail}
                            onChange={handleChange}
                            placeholder="Enter procedure detail"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={loading} variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button disabled={loading} variant="primary" onClick={onAddProcedure}>
                    Add Procedure
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddProcedureModal