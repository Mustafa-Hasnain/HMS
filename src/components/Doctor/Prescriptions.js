import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import 'tailwindcss/tailwind.css';
import PrescriptionModal from './PrescriptionModal';

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
    const [isInventoryLoading, setIsInventoryLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await fetch(`https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/doctor/${doctorId}`);
                const data = await response.json();
                console.log("Prescription: ",data)
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
                const response = await fetch('https://mustafahasnain36-001-site1.gtempurl.com/api/Inventory');
                const data = await response.json();
                setInventoryItems(data.$values || []);
            } catch (error) {
                console.error('Error fetching inventory items:', error);
            } finally {
                setIsInventoryLoading(false);
            }
        };

        fetchPrescriptions();
        fetchInventoryItems();
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
        console.log("Prescription: ",prescription)
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
                    <Table striped bordered hover responsive className="table-auto w-full">
                        <thead className="thead-dark">
                            <tr>
                                <th>#</th>
                                <th>Patient Name</th>
                                <th>Phone Number</th>
                                <th>Date Issued</th>
                                <th>Consultation Fee</th>
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
                                    <td>Rs. {doctor_data.consultationFee}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleViewPrescription(prescription)}
                                        >
                                            View Prescription
                                        </Button>
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
