import React, { useState, useEffect, useRef } from "react";
import { Tabs, Tab, Spinner, Table, Form, Button } from "react-bootstrap";
import { network_url } from "../Network/networkConfig";
import { useReactToPrint } from "react-to-print";
import "../../styles/revenue.css";
import { useLocation } from "react-router-dom";
import { saveAs } from "file-saver";


const RevenueComponent = () => {
  const [key, setKey] = useState("doctor");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
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
  const [ClinicExpensesData, setClinicExpensesData] = useState([]);
  const [InventoryItemsData, setInventoryItemsData] = useState([]);
  const [totalInventoryAmount, setTotalInventoryAmount] = useState(0);
  const [totalClinicExpenses, setTotalClinicExpenses] = useState(0);
  const [totalClinicProfit, setTotalClinicProfit] = useState(0);
  const [printSelectedDoctor, setSelectedPrintDoctor] = useState(null);
  const [selectedPrintFromDate, setSelectedPrintFromDate] = useState(null);
  const [selectedPrintToDate, setSelectedPrintToDate] = useState(null);

  const location = useLocation();
  const [isDoctor, setIsDoctor] = useState(false);
  const [isReceptionist, setIsReceptionist] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/doctor/')) {
      setIsDoctor(true);
      const doctorData = JSON.parse(localStorage.getItem('doctor'));
      setSelectedDoctor(doctors.find(doc => doc.doctorID === doctorData.doctorID))
    } else if (location.pathname.includes('/receptionist/')) {
      setIsReceptionist(true);
    } else {
      setIsDoctor(false)
      setIsReceptionist(false);
    }
  }, [location.pathname, doctors]);




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
      setSelectedPrintDoctor(selectedDoctor);
      setSelectedPrintFromDate(fromDate);
      setSelectedPrintToDate(toDate);
      const response = await fetch(
        `${network_url}/api/Receptionist/DoctorRevenue?doctorID=${selectedDoctor?.doctorID}&fromDate=${fromDate}&toDate=${toDate}`
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
      setSelectedPrintFromDate(fromDate);
      setSelectedPrintToDate(toDate);
      const response = await fetch(`${network_url}/api/Receptionist/ClinicRevenue?fromDate=${fromDate}&toDate=${toDate}`);
      if (!response.ok) throw new Error("Failed to fetch clinic revenue data.");
      const data = await response.json();
      if (data) {
        console.log("Clinic Revenue Data: ", data);
        setClinicRevenueData(data.ClinicRevenueData);
        setClinicExpensesData(data.ClinicExpensesData.clinicExpensesList);
        setInventoryItemsData(data.InventoryItemsData.totalInventoryItems);
        // Calculate total doctor and clinic shares
        const totals = (data.ClinicRevenueData || []).reduce(
          (totals, record) => {
            totals.totalDoctorShare += record.totalDoctorShare || 0;
            totals.totalClinicShare += record.totalClinicShare || 0;
            totals.totalExpensesAmount += record.totalExpenses || 0;
            return totals;
          },
          { totalDoctorShare: 0, totalClinicShare: 0, totalExpensesAmount: 0 }
        );

        const totalInventory = data.InventoryItemsData.totalInventoryAmount || 0;

        const clinicExpenses = data.ClinicExpensesData.totalClinicAmount || 0;

        setClinicTotals(totals);
        setTotalInventoryAmount(totalInventory);
        setTotalClinicExpenses(clinicExpenses);


        const profit = totals.totalClinicShare - (totalInventory + clinicExpenses);
        setTotalClinicProfit(profit);
      }

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

  const printDoctorRevenueRef = useRef();

  const handlePrintDoctorRevenue = useReactToPrint({
    content: () => printDoctorRevenueRef.current,
    documentTitle: 'Doctor Revenue Details',
  });


  const printClinicRevenueRef = useRef();

  const handlePrintClinicRevenue = useReactToPrint({
    content: () => printClinicRevenueRef.current,
    documentTitle: 'Clinic Revenue Details',
  });

  const handleDownloadCSV = () => {
    if (revenueData.length === 0) return;

    const doctorName = `${printSelectedDoctor?.firstName}_${printSelectedDoctor?.lastName}`;
    const filename = `${doctorName}_Revenue_${selectedPrintFromDate}_to_${selectedPrintToDate}.csv`;

    // CSV header
    let csvContent =
      "Dated,Invoice ID,Client Name,Amount,Discount(%),Payment Method,Deduction,Gross After Tax,Expense Deduction,Procedure/Consultation,Net Amount for Sharing,Doctor Share (%),Clinic Share (%),Doctor Amount\n";

    // Add table rows
    revenueData.forEach((record) => {
      csvContent += `${record.date},${record?.invoice_id},${record.clientName},${record.amount.toFixed(2)},${record?.discountedPercentage ?? "N/A"},${record.paymentMethod},${record.deduction.toFixed(2)},${record.grossAfterTax.toFixed(2)},${record.expenseDeduction.toFixed(2)},${record.procedureConsultation},${record.netAmountForSharing.toFixed(2)},${record.doctorSharePercentage},${record.clinicSharePercentage},${record.doctorAmount.toFixed(2)}\n`;
    });

    // Add totals row
    csvContent += `Totals,, ,${totalAmount.toFixed(2)},,, ,${totalGrossAfterTax.toFixed(2)},,,${totalNetAmountForSharing.toFixed(2)},,,${totalDoctorAmount.toFixed(2)}\n`;

    // Create a Blob and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  const handleDownloadClinicCSV = () => {
    if (clinicRevenueData.length === 0) return;
  
    const filename = `Clinic_Revenue_${selectedPrintFromDate}_to_${selectedPrintToDate}.csv`;
  
    let csvContent = `Clinic Revenue Report\n`;
    csvContent += `From: ${selectedPrintFromDate}, To: ${selectedPrintToDate}\n\n`;
  
    // **Clinic Revenue Table**
    csvContent += "Doctor Name,Specialty,Total Revenue,No. of Expenses,Total Expenses Amount,Total Doctor Share,Total Clinic Share\n";
    clinicRevenueData.forEach((record) => {
      csvContent += `${record.doctorName},${record.specialty},${record.totalRevenue.toFixed(2)},${record.totalExpensesCount},${record.totalExpenses.toFixed(2)},${record.totalDoctorShare.toFixed(2)},${record.totalClinicShare.toFixed(2)}\n`;
    });
    csvContent += `Totals,,, ,${clinicTotals.totalExpensesAmount.toFixed(2)},${clinicTotals.totalDoctorShare.toFixed(2)},${clinicTotals.totalClinicShare.toFixed(2)}\n\n`;
  
    // **Inventory Items Table (if available)**
    if (InventoryItemsData.length > 0) {
      csvContent += "Invoice Inventory Items\n";
      csvContent += "Invoice ID,Inventory Item ID,Item Name,Quantity,Amount\n";
      InventoryItemsData.forEach((item) => {
        csvContent += `${item.invoiceID},${item.inventoryItemID},${item.inventoryItem.name},${item.quantity},${item.amount.toFixed(2)}\n`;
      });
      csvContent += `Total Inventory Amount,, , ,${totalInventoryAmount.toFixed(2)}\n\n`;
    } else {
      csvContent += "No Inventory Items Available\n\n";
    }
  
    // **Clinic Expenses Table (if available)**
    if (ClinicExpensesData.length > 0) {
      csvContent += "Clinic Expenses\n";
      csvContent += "Expense ID,Name,Description,Amount,Date\n";
      ClinicExpensesData.forEach((expense) => {
        csvContent += `${expense.clinicExpenseID},${expense.name},${expense.description},${expense.amount.toFixed(2)},${new Date(expense.date).toLocaleDateString()}\n`;
      });
      csvContent += `Total Clinic Expenses,, ,${totalClinicExpenses.toFixed(2)},\n`;
    } else {
      csvContent += "No Clinic Expenses Available\n";
    }
  
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  return (
    <div>
      <Tabs
        id="revenue-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="doctor" title="Doctor Revenue">
          <div className="mb-4 max-w-[175vh]">
            <Form className="mb-4">
              <Form.Group controlId="doctorSelect" className="mb-3">
                <Form.Label>Select Doctor</Form.Label>
                <Form.Select
                  value={selectedDoctor?.doctorID}
                  onChange={(e) => setSelectedDoctor(doctors.find(doc => doc.doctorID === parseInt(e.target.value)))}
                  disabled={isDoctor}
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
              <div className="flex justify-between align-middle">
                <Button variant="primary" onClick={fetchRevenueData}>
                  Submit
                </Button>
                <Button disabled={revenueData.length === 0} variant="outline-primary" onClick={handleDownloadCSV}>
                  Download CSV
                </Button>
              </div>
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

              <div ref={printDoctorRevenueRef}>
                {revenueData.length > 0 && (
                  <div className="print-header text-center mb-4">
                    <h2>{`Doctor '${printSelectedDoctor?.firstName} ${printSelectedDoctor?.lastName}' Revenue Report`}</h2>
                    <p>
                      Revenue data from{' '}
                      <strong>{selectedPrintFromDate}</strong> to <strong>{selectedPrintToDate}</strong>
                    </p>
                  </div>
                )}
                <Table bordered striped hover responsive className="mt-4">
                  <thead>
                    <tr>
                      <th>Dated</th>
                      <th>Invoice ID</th>
                      <th>Client Name</th>
                      <th>Amount</th>
                      <th>Discount(%)</th>
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
                        <td>{record?.discountedPercentage ?? "N/A"}</td>
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
                      <td colSpan="3"></td>
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

        {isReceptionist && <Tab eventKey="clinic" title="Clinic Revenue">
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
            <div className="flex justify-between align-middle">
              <Button variant="primary" onClick={fetchClinicRevenueData}>
                Submit
              </Button>
              <Button disabled={clinicRevenueData.length === 0} variant="outline-primary" onClick={handleDownloadClinicCSV}>
                Download CSV
              </Button>
            </div>
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
            <div ref={printClinicRevenueRef}>
              {clinicRevenueData.length > 0 && (
                <div className="print-header text-center mb-4">
                  <h2>Clinic Revenue Report</h2>
                  <p>
                    Clinic Revenue data from{' '}
                    <strong>{selectedPrintFromDate}</strong> to <strong>{selectedPrintToDate}</strong>
                  </p>
                </div>
              )}
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

              {InventoryItemsData.length > 0 ? (
                <>
                  {/* Invoice Inventory Items Table */}
                  <Table bordered striped hover className="mt-4">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Inventory Item ID</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {InventoryItemsData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.invoiceID}</td>
                          <td>{item.inventoryItemID}</td>
                          <td>{item.inventoryItem.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.amount}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td colSpan="4" className="text-right">Total Inventory Amount:</td>
                        <td>{totalInventoryAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : (
                <div>No Inventory Items</div>
              )}

              {ClinicExpensesData.length > 0 ? (
                <>
                  {/* Clinic Expenses Table */}
                  <Table bordered striped hover className="mt-4">
                    <thead>
                      <tr>
                        <th>Expense ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ClinicExpensesData.map((expense, index) => (
                        <tr key={index}>
                          <td>{expense.clinicExpenseID}</td>
                          <td>{expense.name}</td>
                          <td>{expense.description}</td>
                          <td>{expense.amount}</td>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td colSpan="3" className="text-right">Total Clinic Expenses:</td>
                        <td>{totalClinicExpenses.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : (
                <div>No Clinic Expenses</div>
              )}

              {/* Clinic Profit Calculation */}
              <div className="mt-4">
                <h4>
                  Total Clinic Profit: {totalClinicProfit.toFixed(2)}
                </h4>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No data available.</div>
          )}
        </Tab>}
      </Tabs>
    </div>
  );
};

export default RevenueComponent;
