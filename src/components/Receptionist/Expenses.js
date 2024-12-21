import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Spinner, Tab, Nav } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ClinicExpenses from "./ClinicExpenses";
import { debounce } from "chart.js/helpers";
import InvoiceDetailsModal from "../Custom Components/InvoiceModal";
import { network_url } from "../Network/networkConfig";

const ExpensesManager = () => {
  const [appointment, setAppointment] = useState(null);
  const [fetchingAppointment, setfetchingAppointment] = useState(false)
  const [doctors, setDoctors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    amount: "",
    invoiceID: "",
    doctorID: "",
  });

  const [showModal, setShowModal] = useState(false);

  // Fetch doctors and expenses on component mount
  useEffect(() => {
    fetchDoctors();
    fetchExpenses();
  }, []);

  const fetchAppointmentDetails = async (appointment_id) => {
    try {
      setfetchingAppointment(true);
      const response = await axios.get(
        `${network_url}/api/Receptionist/invoice-appointment-details/${appointment_id}`
      );
      console.log("Invoice-Appointment Data: ", response.data);
      setAppointment(response.data);
      setError(null);
    } catch (error) {
      setError("Invalid Invoice ID");
      setfetchingAppointment(false);
      setAppointment(null);
    }
    finally {
      setfetchingAppointment(false);
    }
  };

  const debouncedFetchAppointmentDetails = useCallback(
    debounce((id) => fetchAppointmentDetails(id), 500), // 500ms delay
    []
  );

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${network_url}/api/Receptionist/doctors`);
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
      const response = await axios.get(`${network_url}/api/Receptionist/get-all-expenses`);
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

    if (name === "invoiceID") {
      debouncedFetchAppointmentDetails(value);
    }
  };

  const handleAddExpense = async () => {
    const { productName, amount, invoiceID, doctorID } = formData;
    if (!productName || !amount || !invoiceID || !doctorID) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`${network_url}/api/Receptionist/add-expense`, {
        productName,
        amount: parseFloat(amount),
        invoiceID: parseInt(invoiceID),
        doctorID: parseInt(doctorID),
      });

      toast.success("Expense added successfully!");
      setExpenses([...expenses, response.data]);
      setFormData({ productName: "", amount: "", invoiceID: "", doctorID: "" });
      setAppointment(null);
    } catch (error) {
      toast.error("Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseID) => {
    try {
      setSubmitting(true);
      await axios.delete(`${network_url}/api/Receptionist/delete-expense/${expenseID}`);
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

      <Tab.Container defaultActiveKey="doctors">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="doctors">Doctors</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="clinic">Clinic</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="mt-3">
          <Tab.Pane eventKey="doctors">
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

                    <Form.Label>Invoice ID<span>{fetchingAppointment && <Spinner size="sm"></Spinner>} {appointment && <Button variant="outline-info" size="sm" onClick={()=>(setShowModal(true))}>View Details</Button>}</span></Form.Label>

                    <Form.Control
                      type="number"
                      name="invoiceID"
                      placeholder="Enter invoice ID"
                      value={formData.invoiceID}
                      onChange={handleInputChange}
                    />
                    <Form.Text className=" !text-red-600">
                      {error && <span>{`${error}`}</span>}
                    </Form.Text>

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
                  ) :
                  (
                    <p className="mt-5 font-semibold text-base text-center">No Expenses Added Yet</p>
                  )}
              </>
            )}
          </Tab.Pane>

          <Tab.Pane eventKey="clinic">
            <ClinicExpenses></ClinicExpenses>
          </Tab.Pane>

        </Tab.Content>
        {appointment &&
          <InvoiceDetailsModal patient={appointment.patient} invoices={appointment.invoices} show={showModal} onHide={() => { setShowModal(false) }}></InvoiceDetailsModal>
        }
      </Tab.Container>
    </div>
  );
};

export default ExpensesManager;
