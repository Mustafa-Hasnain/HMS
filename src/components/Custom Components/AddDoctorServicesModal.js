import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AddDoctorServiceModal({ show, onHide, addService, onSave,
    initialData = null }) {


    const [serviceId, setServiceId] = useState(null);
    const [serviceName, setServiceName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [doctorCutPercentage, setDoctorCutPercentage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Populate the form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setServiceId(initialData.serviceId || null);
      setServiceName(initialData.serviceName || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price || "");
      setDoctorCutPercentage(initialData.doctorCutPercentage || "");
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setServiceId(null);
    setServiceName("");
    setDescription("");
    setPrice("");
    setDoctorCutPercentage("");
    setErrorMessage("");
  };

  const handleSave = () => {
    if (!serviceName || !price || !doctorCutPercentage) {
      setErrorMessage("All fields except description are required.");
      return;
    }

    if (doctorCutPercentage > 100) {
      setErrorMessage("Doctor's cut percentage cannot exceed 100%.");
      return;
    }

    const serviceData = {
      serviceId,
      serviceName,
      description,
      price: parseFloat(price),
      doctorCutPercentage: parseFloat(doctorCutPercentage),
    };

    onSave(serviceData).then((success) => {
      if (success) {
        resetForm();
        onHide();
      }
    });
  };


    if (doctorCutPercentage > 100) {
        setErrorMessage("Doctor's cut percentage cannot exceed 100%");
        return;
    }

    const handleAddService = () => {
        const newService = {
            serviceName,
            description,
            price: parseInt(price),
            doctorCutPercentage: parseInt(doctorCutPercentage),
        };
        addService(newService);
        setServiceName('');
        setDescription('');
        setPrice('');
        setDoctorCutPercentage('');
        setErrorMessage('');
        onHide(); // Close the modal
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Doctor Service</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Service Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Doctor Percentage</Form.Label>
                        <Form.Control
                            type="number"
                            value={doctorCutPercentage}
                            onChange={(e) => setDoctorCutPercentage(e.target.value)}
                        />
                        {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddService}>
                    Add Service
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddDoctorServiceModal;
