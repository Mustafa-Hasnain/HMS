import React, { useState, useEffect } from "react";
import { Tabs, Tab, Spinner, Table, Form, Button } from "react-bootstrap";
import { network_url } from "../Network/networkConfig";

const RevenueComponent = () => {
  const [key, setKey] = useState("doctor");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalDoctorAmount, setTotalDoctorAmount] = useState(0);
  const [clinicTotals, setClinicTotals] = useState({
    totalDoctorShare: 0,
    totalClinicShare: 0,
    totalExpensesAmount: 0
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalGrossAfterTax, setTotalGrossAfterTax] = useState(0);
  const [totalNetAmountForSharing, setTotalNetAmountForSharing] = useState(0);
  const [clinicRevenueData, setClinicRevenueData] = useState([]);



  // Fetch all doctors from the API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${network_url}/api/Receptionist/doctors`);
      if (!response.ok) throw new Error("Failed to fetch doctors.");
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctor data:", err);
      setError("Error fetching doctor data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue data based on doctorID, fromDate, and toDate
  const fetchRevenueData = async () => {
    if (!selectedDoctor || !fromDate || !toDate) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${network_url}/api/Receptionist/DoctorRevenue?doctorID=${selectedDoctor}&fromDate=${fromDate}&toDate=${toDate}`
      );
      if (!response.ok) throw new Error("No revenue data found.");
      const data = await response.json();
      setRevenueData(data);

      // Calculate total doctor amount
      const total = data.reduce((sum, record) => sum + record.doctorAmount, 0);
      const totalAmount = data.reduce((sum, record) => sum + record.amount, 0);
      const totalGrossAfterTax = data.reduce((sum, record) => sum + record.grossAfterTax, 0);
      const totalNetAmountForSharing = data.reduce((sum, record) => sum + record.netAmountForSharing, 0);

      setTotalDoctorAmount(totalDoctorAmount);
      setTotalAmount(totalAmount);
      setTotalGrossAfterTax(totalGrossAfterTax);
      setTotalNetAmountForSharing(totalNetAmountForSharing);

      setTotalDoctorAmount(total);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("No revenue data found for the selected doctor and dates.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch clinic revenue data
  const fetchClinicRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${network_url}/api/Receptionist/ClinicRevenue?fromDate=${fromDate}&toDate=${toDate}`);
      if (!response.ok) throw new Error("Failed to fetch clinic revenue data.");
      const data = await response.json();
      setClinicRevenueData(data);

      // Calculate total doctor and clinic shares
      const totals = data.reduce(
        (totals, record) => {
          totals.totalDoctorShare += record.totalDoctorShare;
          totals.totalClinicShare += record.totalClinicShare;
          totals.totalExpensesAmount += record.totalExpenses
          return totals;
        },
        { totalDoctorShare: 0, totalClinicShare: 0, totalExpensesAmount: 0 }
      );
      setClinicTotals(totals);
    } catch (err) {
      console.error("Error fetching clinic revenue data:", err);
      setError("Error fetching clinic revenue data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // if (key === "clinic") {
    //   fetchClinicRevenueData();
    // }
  }, []);

  return (
    <div className="w-full p-2">
      <Tabs
        id="revenue-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="doctor" title="Doctor Revenue">
          <div className="mx-auto mb-4">
            <Form className="mb-4">
              <Form.Group controlId="doctorSelect" className="mb-3">
                <Form.Label>Select Doctor</Form.Label>
                <Form.Select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctorID} value={doctor.doctorID}>
                      {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="fromDate" className="mb-3">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="toDate" className="mb-3">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={fetchRevenueData}>
                Submit
              </Button>
            </Form>

            {loading ? (
              <div className="flex justify-center items-center">
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : revenueData.length > 0 ? (
              <div>
                <Table bordered striped hover className="mt-4">
                  <thead>
                    <tr>
                      <th>Dated</th>
                      <th>Invoice ID</th>
                      <th>Client Name</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Deduction</th>
                      <th>Gross After Tax</th>
                      <th>Expense Deduction</th>
                      <th>Procedure/Consultation</th>
                      <th>Net Amount for Sharing</th>
                      <th>Doctor Share (%)</th>
                      <th>Clinic Share (%)</th>
                      <th>Doctor Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((record, index) => (
                      <tr key={index}>
                        <td>{record.date}</td>
                        <td>{record?.invoice_id}</td>
                        <td>{record.clientName}</td>
                        <td>{record.amount.toFixed(2)}</td>
                        <td>{record.paymentMethod}</td>
                        <td>{record.deduction.toFixed(2)}</td>
                        <td>{record.grossAfterTax.toFixed(2)}</td>
                        <td>{record.expenseDeduction.toFixed(2)}</td>
                        <td>{record.procedureConsultation}</td>
                        <td>{record.netAmountForSharing.toFixed(2)}</td>
                        <td>{record.doctorSharePercentage}%</td>
                        <td>{record.clinicSharePercentage}%</td>
                        <td>{record.doctorAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan="3" className="text-right">
                        Totals:
                      </td>
                      <td>{totalAmount.toFixed(2)}</td>
                      <td colSpan="2"></td>
                      <td>{totalGrossAfterTax.toFixed(2)}</td>
                      <td></td>
                      <td></td>
                      <td>{totalNetAmountForSharing.toFixed(2)}</td>
                      <td colSpan="2"></td>
                      <td>{totalDoctorAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500">No data found.</div>
            )}
          </div>
        </Tab>
        <Tab eventKey="clinic" title="Clinic Revenue">
          <Form>
            <Form.Group controlId="fromDate" className="mb-3">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="toDate" className="mb-3">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={fetchClinicRevenueData}>
              Submit
            </Button>
          </Form>

          {loading ? (
            <div className="flex justify-center items-center">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : clinicRevenueData.length > 0 ? (
            <Table bordered striped hover className="mt-4">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialty</th>
                  <th>Total Revenue</th>
                  <th>No. of Expenses</th>
                  <th>Total Expenses Amount</th>
                  <th>Total Doctor Share</th>
                  <th>Total Clinic Share</th>
                </tr>
              </thead>
              <tbody>
                {clinicRevenueData.map((record, index) => (
                  <tr key={index}>
                    <td>{record.doctorName}</td>
                    <td>{record.specialty}</td>
                    <td>{record.totalRevenue.toFixed(2)}</td>
                    <td>{record.totalExpensesCount}</td>
                    <td>{record.totalExpenses}</td>
                    <td>{record.totalDoctorShare.toFixed(2)}</td>
                    <td>{record.totalClinicShare.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan="4" className="text-right">
                    Totals:
                  </td>
                  <td>{clinicTotals.totalExpensesAmount.toFixed(2)}</td>
                  <td>{clinicTotals.totalDoctorShare.toFixed(2)}</td>
                  <td>{clinicTotals.totalClinicShare.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-gray-500">No data available.</div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default RevenueComponent;
