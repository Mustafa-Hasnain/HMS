import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { network_url } from '../Network/networkConfig';
import { useNavigate } from 'react-router-dom';
import PrescriptionModal from '../Custom Components/PrescriptionModal';
import { FaEdit, FaEye } from 'react-icons/fa';

const Prescriptions = () => {
    const doctorId = JSON.parse(localStorage.getItem('doctor')).doctorID;
    const doctor_data = JSON.parse(localStorage.getItem('doctor'));
    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isInventoryLoading, setIsInventoryLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await fetch(`${network_url}/api/Prescription/doctor/${doctorId}`);
                const data = await response.json();
                console.log("Prescription: ", data)
                setPrescriptions(data);
                setFilteredPrescriptions(data);
            } catch (error) {
                console.error('Error fetching prescriptions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchInventoryItems = async () => {
            try {
                const response = await fetch(`${network_url}/api/Inventory`);
                const data = await response.json();
                setInventoryItems(data.$values || []);
            } catch (error) {
                console.error('Error fetching inventory items:', error);
            } finally {
                setIsInventoryLoading(false);
            }
        };

        fetchPrescriptions();
        // fetchInventoryItems();
    }, [doctorId]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = prescriptions.filter((prescription) =>
            prescription.patient.firstName.toLowerCase().includes(query) ||
            prescription.patient.mobileNumber.includes(query)
        );
        setFilteredPrescriptions(filtered);
    };

    const handleViewPrescription = (prescription) => {
        console.log("Prescription: ", prescription)
        setSelectedPrescription(prescription);
        // calculateTotalAmount(prescription);
        setShowModal(true);
    };

    const calculateTotalAmount = (prescription) => {
        let total = parseInt(doctor_data.consultationFee);
        prescription.prescriptionItems.$values.forEach((item) => {
            const medicine = item.inventoryItem; // Use inventoryItem directly from item
            total += medicine.price * item.quantity;
        });
        setTotalAmount(total);
    };

    if (isLoading || isInventoryLoading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Doctor Prescriptions</h2>
            <Form.Control
                type="text"
                placeholder="Search by patient name or phone number"
                value={searchQuery}
                onChange={handleSearch}
                className="mb-4"
            />
            <div className="overflow-auto">
                {filteredPrescriptions.length === 0 ? (
                    <p>No prescriptions available.</p>
                ) : (
                    <Table bordered hover responsive className="table-auto w-full">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>Patient Name</th>
                                <th>Phone Number</th>
                                <th>Date Issued</th>
                                <th>Invoice ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrescriptions.map((prescription, index) => (
                                <tr key={prescription.prescriptionID}>
                                    <td>{index + 1}</td>
                                    <td>{prescription.patient.firstName} {prescription.patient.lastName}</td>
                                    <td>{prescription.patient.mobileNumber}</td>
                                    <td>{new Date(prescription.dateIssued).toLocaleDateString()}</td>
                                    <td>{prescription.invoiceID}</td>
                                    <td>
                                        <div className='flex gap-3'>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click from firing
                                                    navigate(`/doctor/edit-prescription/${prescription.patientID}/${prescription.invoiceID}/${prescription.prescriptionID}`);
                                                }}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => handleViewPrescription(prescription)}
                                            >
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => navigate(`/doctor/invoice-details/${prescription.invoiceID}`)}
                                            >
                                                Details
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* Prescription Modal */}
            {selectedPrescription && (
                <PrescriptionModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    prescriptionDetails={selectedPrescription}
                    totalAmount={totalAmount}
                    inventoryItems={inventoryItems}
                    openFromPrescriptions={true}
                />
            )}
        </div>
    );
};

export default Prescriptions;
