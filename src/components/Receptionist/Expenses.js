import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ExpensesManager = () => {
  const [doctors, setDoctors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    amount: "",
    invoiceID: "",
    doctorID: "",
  });

  // Fetch doctors and expenses on component mount
  useEffect(() => {
    fetchDoctors();
    fetchExpenses();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/doctors");
      setDoctors(response.data);
    } catch (error) {
      toast.error("Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/get-all-expenses");
      setExpenses(response.data);
    } catch (error) {
      toast.error("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddExpense = async () => {
    const { productName, amount, invoiceID, doctorID } = formData;
    if (!productName || !amount || !invoiceID || !doctorID) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post("https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/add-expense", {
        productName,
        amount: parseFloat(amount),
        invoiceID: parseInt(invoiceID),
        doctorID: parseInt(doctorID),
      });

      toast.success("Expense added successfully!");
      setExpenses([...expenses, response.data]);
      setFormData({ productName: "", amount: "", invoiceID: "", doctorID: "" });
    } catch (error) {
      toast.error("Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseID) => {
    try {
      setSubmitting(true);
      await axios.delete(`https://mustafahasnain36-001-site1.gtempurl.com/api/Receptionist/delete-expense/${expenseID}`);
      toast.success("Expense deleted successfully!");
      setExpenses(expenses.filter((expense) => expense.expenseID !== expenseID));
    } catch (error) {
      toast.error("Failed to delete expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />

      <h2 className="mb-4 text-2xl font-bold">Expenses</h2>
      
      {loading ? (
        <div className="flex justify-center items-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {/* Form to Add Expense */}
          <Form className="mb-4 bg-light p-4 rounded shadow">
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Invoice ID</Form.Label>
              <Form.Control
                type="number"
                name="invoiceID"
                placeholder="Enter invoice ID"
                value={formData.invoiceID}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Select
                name="doctorID"
                value={formData.doctorID}
                onChange={handleInputChange}
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorID} value={doctor.doctorID}>
                    {doctor.firstName} {doctor.lastName} ({doctor.specialty})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleAddExpense}
              disabled={submitting}
            >
              {submitting ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Add Expense"
              )}
            </Button>
          </Form>

         

          {expenses.length > 0 ?
          (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Amount</th>
                <th>Invoice ID</th>
                <th>Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.expenseID}>
                  <td>{expense.expenseID}</td>
                  <td>{expense.productName}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.invoiceID}</td>
                  <td>
                    {expense.doctor
                      ? `${expense.doctor.firstName} ${expense.doctor.lastName}`
                      : "N/A"}
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteExpense(expense.expenseID)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          ):
          (
            <p className="mt-5 font-semibold text-base text-center">No Expenses Added Yet</p>
          )}
        </>
      )}
    </div>
  );
};

export default ExpensesManager;