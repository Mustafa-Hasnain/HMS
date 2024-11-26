import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

function AddEditDoctorServiceModal({ show, onHide, onSave, initialData = null }) {
  const [serviceId, setServiceId] = useState(null);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [doctorCutPercentage, setDoctorCutPercentage] = useState("");
  const [clinicCutPercentage, setClinicCutPercentage] = useState(30); // Default value
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate the form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setServiceId(initialData.doctorServiceID || null);
      setServiceName(initialData.serviceName || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price || "");
      setDoctorCutPercentage(initialData.doctorCutPercentage || "");
      setClinicCutPercentage(100 - (initialData.doctorCutPercentage || 0));
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
    setClinicCutPercentage(30); // Reset to default
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (!serviceName || !price || !doctorCutPercentage) {
      setErrorMessage("All fields except description are required.");
      return;
    }

    if (parseFloat(doctorCutPercentage) > 100) {
      setErrorMessage("Doctor's cut percentage cannot exceed 100%.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const serviceData = {
      doctorServiceID: serviceId,
      serviceName,
      description,
      price: parseFloat(price),
      doctorCutPercentage: parseFloat(doctorCutPercentage),
      clinicCutPercentage: 100 - parseFloat(doctorCutPercentage), // Automatically calculate clinic cut
    };

    const success = await onSave(serviceData);

    if (success) {
      resetForm();
      onHide();
    } else {
      setErrorMessage("Failed to save the service. Please try again.");
    }

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={!loading ? onHide : null}>
      <Modal.Header closeButton={!loading}>
        <Modal.Title>{serviceId ? "Edit Doctor Service" : "Add Doctor Service"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Service Name</Form.Label>
            <Form.Control
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Doctor's Cut Percentage</Form.Label>
            <Form.Control
              type="number"
              value={doctorCutPercentage}
              onChange={(e) => {
                const value = e.target.value;
                setDoctorCutPercentage(value);
                setClinicCutPercentage(100 - value);
              }}
              disabled={loading}
            />
          </Form.Group>
          {/* <Form.Group className="mb-3">
            <Form.Label>Clinic's Cut Percentage (Auto-calculated)</Form.Label>
            <Form.Control type="number" value={clinicCutPercentage} readOnly />
          </Form.Group> */}
          {errorMessage && <div className="text-danger">{errorMessage}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={!loading ? onHide : null} disabled={loading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddEditDoctorServiceModal;
