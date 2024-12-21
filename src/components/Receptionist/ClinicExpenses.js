import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import { network_url } from "../Network/networkConfig";

const ClinicExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        amount: "",
        date: "",
    });

    // Fetch all clinic expenses
    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${network_url}/api/Receptionist/GetAllClinicExpenses`);
            setExpenses(response.data);
        } catch (err) {
            setError("Failed to fetch clinic expenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Add a new clinic expense
    const handleAddExpense = async () => {
        setAdding(true);
        setError(null);
        try {
            const response = await axios.post(`${network_url}/api/Receptionist/AddClinicExpense`, formData);
            setExpenses((prev) => [
                ...prev,
                {
                    clinicExpenseID: prev.length + 1, // Assuming ID is incremental for demo purposes
                    ...formData,
                },
            ]);

            // Reset the form to default values
            setFormData({ name: "", description: "", amount: "", date: "" });
        } catch (err) {
            setError("Failed to add clinic expense.");
        } finally {
            setAdding(false);
        }
    };

    // Delete a clinic expense
    const handleDeleteExpense = async (id) => {
        setDeletingId(id);
        setError(null);
        try {
            await axios.delete(`${network_url}/api/Receptionist/DeleteClinicExpense/${id}`);
            setExpenses((prev) => prev.filter((expense) => expense.clinicExpenseID !== id));
        } catch (err) {
            setError("Failed to delete clinic expense.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-2xl font-bold">Clinic Expenses</h2>

            {/* Error Alert */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Add Expense Form */}
            <Form className="mb-4">
                <Form.Group controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter expense name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="description" className="mt-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter description (optional)"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="amount" className="mt-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="date" className="mt-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Button
                    variant="primary"
                    className="mt-3"
                    onClick={handleAddExpense}
                    disabled={adding}
                >
                    {adding ? <Spinner animation="border" size="sm" /> : "Add Expense"}
                </Button>
            </Form>

            {/* Expenses Table */}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length > 0 ? (
                            expenses.map((expense, index) => (
                                <tr key={expense.clinicExpenseID}>
                                    <td>{index + 1}</td>
                                    <td>{expense.name}</td>
                                    <td>{expense.description}</td>
                                    <td>{expense.amount}</td>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteExpense(expense.clinicExpenseID)}
                                            disabled={deletingId === expense.clinicExpenseID}
                                        >
                                            {deletingId === expense.clinicExpenseID ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                "Delete"
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No expenses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default ClinicExpenses;
