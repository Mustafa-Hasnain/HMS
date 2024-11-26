import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import AddEditDoctorServiceModal from "./AddEditDoctorServicesModal";

const DoctorServices = ({ doctorId }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Fetch services when component mounts or doctorId changes
    useEffect(() => {
        fetchServices();
    }, [doctorId]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/Get-service/${doctorId}`);
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            console.log("Fetch Services: ", data);
            setServices(data);
        } catch (err) {
            setError("Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (newService) => {
        console.log("Add Service: ", newService);
        setLoading(true);
        try {
            // Create a payload excluding `doctorServiceID`
            const payload = {
                doctorId,
                serviceName: newService.serviceName,
                description: newService.description,
                price: newService.price,
                doctorCutPercentage: newService.doctorCutPercentage,
                clinicCutPercentage: newService.clinicCutPercentage,
            };

            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/add-service`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(await response.text());
            const addedService = await response.json();

            // Add the new service to the state
            setServices([...services, addedService]);
            return true;
        } catch (err) {
            setError("Failed to add service.");
            return false;
        } finally {
            setLoading(false);
        }
    };


    const handleEditService = async (updatedService) => {
        console.log("Edit Servie: ", updatedService)
        setLoading(true);
        try {
            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/doctor-service/${updatedService.doctorServiceID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedService),
            });
            if (!response.ok) throw new Error(await response.text());
            const editedService = await response.json();
            setServices(
                services.map((s) =>
                    s.doctorServiceID === editedService.doctorServiceID ? editedService : s
                )
            );
            return true;
        } catch (err) {
            setError("Failed to edit service.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        setLoading(true);
        try {
            const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Doctor/doctor-service/${serviceId}`, { method: "DELETE" });
            if (!response.ok) throw new Error(await response.text());
            setServices(services.filter((s) => s.doctorServiceID !== serviceId));
        } catch (err) {
            setError("Failed to delete service.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service = null) => {
        setSelectedService(service);
        setShowModal(true);
    };

    return (
        <div className="mt-10">
            <div className="flex justify-between items-center align-middle">
                <h1 className="text-2xl font-semibold">Edit Doctor's Services</h1>
                {/* {error && <div className="text-danger">{error}</div>} */}
                <Button variant="outline-success" onClick={() => handleOpenModal()}>
                    Add Service
                </Button>
            </div>
            {loading ? (
                <div className="text-center mt-3">
                    <Spinner animation="border" />
                </div>
            ) : services.length > 0 ? ( // Check if there are services
                <Table bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Doctor's Cut (%)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.doctorServiceID}>
                                <td>{service.serviceName}</td>
                                <td>{service.description}</td>
                                <td>{service.price}</td>
                                <td>{service.doctorCutPercentage}</td>
                                <td className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline-warning"
                                        onClick={() => handleOpenModal(service)}
                                        disabled={loading}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDeleteService(service.doctorServiceID)}
                                        disabled={loading}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                // Display this message when there are no services
                <div className="text-center mt-3">
                    <p>No services available for this doctor.</p>
                </div>
            )}
            <AddEditDoctorServiceModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={selectedService ? handleEditService : handleAddService}
                initialData={selectedService}
            />
        </div>
    );
};

export default DoctorServices;
