import React, { useState, useEffect, useRef } from "react";
import { Tabs, Tab, Spinner, Table, Form, Button, Card } from "react-bootstrap";
import { network_url } from "../Network/networkConfig";
import { useReactToPrint } from "react-to-print";
import "../../styles/revenue.css";
import { useLocation } from "react-router-dom";
import { saveAs } from "file-saver";
import { FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa";
import { AiOutlineCheck, AiOutlineDownload } from "react-icons/ai";
import { formatPrice } from "../utils/FormatPrice";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import { toast, ToastContainer } from "react-toastify";




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
  const [totalInventoryCostPrice, setTotalInventoryCostPrice] = useState(0);
  const [totalInventoryProfit, setTotalInventoryProfit] = useState(0);

  const [totalClinicExpenses, setTotalClinicExpenses] = useState(0);
  const [totalClinicProfit, setTotalClinicProfit] = useState(0);
  const [printSelectedDoctor, setSelectedPrintDoctor] = useState(null);
  const [selectedPrintFromDate, setSelectedPrintFromDate] = useState(null);
  const [selectedPrintToDate, setSelectedPrintToDate] = useState(null);

  const location = useLocation();
  const [isDoctor, setIsDoctor] = useState(false);
  const [isReceptionist, setIsReceptionist] = useState(false);
  const [openIndices, setOpenIndices] = useState([]);
  const [selectedRevenueRows, setSelectedRevenueRows] = useState([]);
  const [isSubmittingRevenue, setIsSubmittingRevenue] = useState(false);

  const handleSubmitRevenue = async () => {
    setIsSubmittingRevenue(true);
    const payload = selectedRevenueRows.map(index => {
      const item = revenueData[index];
      return {
        type: item.procedureConsultation?.toLowerCase().includes("procedure") ? "procedure" : "consultation",
        id: item.id // Ensure your `record` object includes the relevant ID property
      };
    });

    try {
      const response = await fetch(`${network_url}/api/Doctor/submit-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to submit revenue");

      toast.success("Revenue Submitted Successfully");
      setSelectedRevenueRows([]);
      fetchRevenueData(); // refresh data
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error occured.");
    }
    finally{
      setIsSubmittingRevenue(false);
    }
  };


  const toggleAccordion = (index) => {
    if (openIndices.includes(index)) {
      // Remove the index if already open
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      // Add the index to the list of open indices
      setOpenIndices([...openIndices, index]);
    }
  };
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
            totals.totalExpensesAmount += record.totalExpenseDeduction || 0;
            return totals;
          },
          { totalDoctorShare: 0, totalClinicShare: 0, totalExpensesAmount: 0 }
        );

        const totalInventory = data.InventoryItemsData.totalInventoryAmount || 0;
        const totalInventoryCostPrice = data.InventoryItemsData.totalInventoryCostPrice || 0;
        const totalInventoryProfit = data.InventoryItemsData.totalInventoryProfit || 0;
        const clinicExpenses = data.ClinicExpensesData.totalClinicAmount || 0;

        setClinicTotals(totals);
        setTotalInventoryAmount(totalInventory);
        setTotalInventoryCostPrice(totalInventoryCostPrice);
        setTotalInventoryProfit(totalInventoryProfit);
        setTotalClinicExpenses(clinicExpenses);


        const profit = totals.totalClinicShare - (totalInventoryProfit + clinicExpenses);
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
    <ToastContainer></ToastContainer>
      <Tabs
        id="revenue-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="doctor" title="Doctor Revenue">
          <Form className="mb-3 flex flex-wrap items-center justify-between">
            <div className="w-1/3">
              <Form.Group controlId="doctorSelect">
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
            </div>
            <div className="flex gap-3 justify-between items-center">
              <div className="flex gap-3">
                <Form.Group controlId="fromDate">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="toDate">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="flex gap-3 h-fit items-center mt-[5%]">
                <Button variant="primary" disabled={loading} onClick={fetchRevenueData} className="!flex rounded-md gap-2 items-center">
                  <FaFilter className="text-white" /> Submit
                </Button>

                <Button disabled={revenueData.length === 0} variant="outline-primary" onClick={handleDownloadCSV} className="!flex rounded-md gap-2 items-center">
                  <AiOutlineDownload /> CSV
                </Button>
                {isDoctor && <Button
                  variant="success"
                  className="!flex rounded-md gap-2 items-center"
                  disabled={selectedRevenueRows.length === 0 || isSubmittingRevenue}
                  onClick={handleSubmitRevenue}
                >
                  <AiOutlineCheck /> Revenue
                </Button>}
              </div>
            </div>
          </Form>
          <div className="mt-1 max-w-[175vh]">
            {loading ? (
              <div className="flex justify-center items-center">
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : revenueData.length > 0 ? (
              <>
                {/* Print Header */}
                <div className="print-header text-center mb-4">
                  <h2>{`Doctor '${printSelectedDoctor?.firstName} ${printSelectedDoctor?.lastName}' Revenue Report`}</h2>
                  <p>
                    Revenue data from <strong>{selectedPrintFromDate}</strong> to <strong>{selectedPrintToDate}</strong>
                  </p>
                </div>

                {/* Scrollable Table */}
                <div ref={printDoctorRevenueRef} className="overflow-auto max-h-[60vh] table-scroll">
                  <Table bordered striped hover responsive >
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
                        <th>
                          {isDoctor && <Form.Check
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRevenueRows(revenueData.map((_, index) => index));
                              } else {
                                setSelectedRevenueRows([]);
                              }
                            }}
                            checked={selectedRevenueRows.length === revenueData.length && revenueData.length > 0}
                          />}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((record, index) => {
                        const isChecked = selectedRevenueRows.includes(index);
                        return (
                          <tr key={index}>
                            <td>{record.date}</td>
                            <td>{record?.invoice_id}</td>
                            <td>{record.clientName}</td>
                            <td>{formatPrice(record.amount.toFixed(2))}</td>
                            <td>{record?.discountedPercentage ?? "N/A"}</td>
                            <td>{record.paymentMethod}</td>
                            <td>{formatPrice(record.deduction.toFixed(2))}</td>
                            <td>{formatPrice(record.grossAfterTax.toFixed(2))}</td>
                            <td>{formatPrice(record.expenseDeduction.toFixed(2))}</td>
                            <td>{record.procedureConsultation}</td>
                            <td>{formatPrice(record.netAmountForSharing.toFixed(2))}</td>
                            <td>{record.doctorSharePercentage}%</td>
                            <td>{record.clinicSharePercentage}%</td>
                            <td>{formatPrice(record.doctorAmount.toFixed(2))}</td>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={record.isSubmittedByDoctor || isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedRevenueRows(selectedRevenueRows.filter(i => i !== index));
                                  } else {
                                    setSelectedRevenueRows([...selectedRevenueRows, index]);
                                  }
                                }}
                                disabled={isReceptionist || record.isSubmittedByDoctor}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="font-bold">
                        <td colSpan="3" className="text-right !font-bold">Totals:</td>
                        <td className="!font-bold">{formatPrice(totalAmount.toFixed(2))}</td>
                        <td colSpan="3"></td>
                        <td className="!font-bold">{formatPrice(totalGrossAfterTax.toFixed(2))}</td>
                        <td></td>
                        <td></td>
                        <td className="!font-bold">{formatPrice(totalNetAmountForSharing.toFixed(2))}</td>
                        <td colSpan="2"></td>
                        <td className="!font-bold">{formatPrice(totalDoctorAmount.toFixed(2))}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">No data found.</div>
            )}
          </div>
        </Tab>

        {isReceptionist && <Tab eventKey="clinic" title="Clinic Revenue">
          <Form className="flex items-center justify-between mb-3">
            <div className="flex gap-3 items-center">
              <Form.Group controlId="fromDate">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="toDate">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </div>
            <div className="flex items-center gap-3 mt-[30px]">
              <Button variant="primary" onClick={fetchClinicRevenueData} disabled={loading} className="!flex rounded-md gap-2 items-center">
                <FaFilter className="text-white" /> Submit
              </Button>
              <Button disabled={clinicRevenueData.length === 0} variant="outline-primary" onClick={handleDownloadClinicCSV} className="!flex rounded-md gap-2 items-center">
                <AiOutlineDownload /> CSV
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
            <div ref={printClinicRevenueRef} className="overflow-auto max-h-[60vh] table-scroll">
              {clinicRevenueData.length > 0 && (
                <div className="print-header text-center mb-4">
                  <h2>Clinic Revenue Report</h2>
                  <p>
                    Clinic Revenue data from{' '}
                    <strong>{selectedPrintFromDate}</strong> to <strong>{selectedPrintToDate}</strong>
                  </p>
                </div>
              )}

              {/* <h3 className="text-xl font-semibold mt-4">Clinic Revenue Breakdown</h3>
              <Table bordered striped hover responsive className="mt-4">
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
                      <td>{formatPrice(record.totalRevenue.toFixed(2))}</td>
                      <td>{record.totalExpensesCount}</td>
                      <td>{record.totalExpenses}</td>
                      <td>{formatPrice(record.totalDoctorShare.toFixed(2))}</td>
                      <td>{formatPrice(record.totalClinicShare.toFixed(2))}</td>
                    </tr>
                  ))}
                  <tr className="!font-bold">
                    <td colSpan="4" className="text-right !font-bold">
                      Totals:
                    </td>
                    <td className="!font-bold">{formatPrice(clinicTotals.totalExpensesAmount.toFixed(2))}</td>
                    <td className="!font-bold">{formatPrice(clinicTotals.totalDoctorShare.toFixed(2))}</td>
                    <td className="!font-bold">{formatPrice(clinicTotals.totalClinicShare.toFixed(2))}</td>
                  </tr>
                </tbody>
              </Table>

              <h3 className="text-xl font-semibold mt-6">Inventory Items Summary</h3>
              {InventoryItemsData.length > 0 ? (
                <>
                  <Table bordered striped hover className="mt-4">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Inventory Item ID</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Cost Price</th>
                        <th>Selling Price</th>
                        <th>Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {InventoryItemsData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.invoiceID}</td>
                          <td>{item.inventoryItemID}</td>
                          <td>{item.inventoryItem.name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.costPrice)}</td>
                          <td>{formatPrice(item.amount)}</td>
                          <td>{formatPrice(item.amount - item.costPrice)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="4" className="text-right !font-bold">Total Inventory Amount:</td>
                        <td className="!font-bold">{formatPrice(totalInventoryCostPrice.toFixed(2))}</td>
                        <td className="!font-bold">{formatPrice(totalInventoryAmount.toFixed(2))}</td>
                        <td className="!font-bold">{formatPrice(totalInventoryProfit.toFixed(2))}</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : (
                <div>No Inventory Items</div>
              )}

              <h3 className="text-xl font-semibold mt-6">Clinic Expenses</h3>

              {ClinicExpensesData.length > 0 ? (
                <>
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
                          <td>{formatPrice(expense.amount)}</td>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td colSpan="3" className="text-right !font-bold">Total Clinic Expenses:</td>
                        <td className="!font-bold">{formatPrice(totalClinicExpenses.toFixed(2))}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              ) : (
                <div>No Clinic Expenses</div>
              )} */}

              <Accordion allowZeroExpanded>
                {/* Clinic Revenue Breakdown */}
                <AccordionItem>
                  <div
                    className="flex justify-between items-center py-3 px-4 border-b cursor-pointer"
                    onClick={() => toggleAccordion(0)}
                  >
                    <span className="text-lg font-semibold">Clinic Revenue Breakdown</span>
                    {openIndices.includes(0) ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {openIndices.includes(0) && (
                    <div className="p-4">
                      <Table bordered striped hover responsive className="mt-2">
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
                              <td>{record.speciality}</td>
                              <td>{formatPrice(record.totalRevenue.toFixed(2))}</td>
                              <td>{record.totalExpensesCount}</td>
                              <td>{formatPrice(record.totalExpenseDeduction.toFixed(2))}</td>
                              <td>{formatPrice(record.totalDoctorShare.toFixed(2))}</td>
                              <td>{formatPrice(record.totalClinicShare.toFixed(2))}</td>
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td colSpan="4" className="text-right">Totals:</td>
                            <td>{formatPrice(clinicTotals.totalExpensesAmount.toFixed(2))}</td>
                            <td>{formatPrice(clinicTotals.totalDoctorShare.toFixed(2))}</td>
                            <td>{formatPrice(clinicTotals.totalClinicShare.toFixed(2))}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  )}
                </AccordionItem>

                {/* Inventory Items Summary */}
                <AccordionItem>
                  <div
                    className="flex justify-between items-center py-3 px-4 border-b cursor-pointer"
                    onClick={() => toggleAccordion(1)}
                  >
                    <span className="text-lg font-semibold">Inventory Items Summary</span>
                    {openIndices.includes(1) ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {openIndices.includes(1) && (
                    <div className="p-4">
                      {InventoryItemsData.length > 0 ? (
                        <Table bordered striped hover className="mt-2">
                          <thead>
                            <tr>
                              <th>Invoice ID</th>
                              <th>Inventory Item ID</th>
                              <th>Item Name</th>
                              <th>Quantity</th>
                              <th>Cost Price</th>
                              <th>Selling Price</th>
                              <th>Profit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {InventoryItemsData.map((item, index) => (
                              <tr key={index}>
                                <td>{item.invoiceID}</td>
                                <td>{item.inventoryItemID}</td>
                                <td>{item.inventoryItem.name}</td>
                                <td>{item.quantity}</td>
                                <td>{formatPrice(item.costPrice)}</td>
                                <td>{formatPrice(item.amount)}</td>
                                <td>{formatPrice(item.amount - item.costPrice)}</td>
                              </tr>
                            ))}
                            <tr className="font-bold">
                              <td colSpan="4" className="text-right">Total Inventory Amount:</td>
                              <td>{formatPrice(totalInventoryCostPrice.toFixed(2))}</td>
                              <td>{formatPrice(totalInventoryAmount.toFixed(2))}</td>
                              <td>{formatPrice(totalInventoryProfit.toFixed(2))}</td>
                            </tr>
                          </tbody>
                        </Table>
                      ) : (
                        <div>No Inventory Items</div>
                      )}
                    </div>
                  )}
                </AccordionItem>

                {/* Clinic Expenses */}
                <AccordionItem>
                  <div
                    className="flex justify-between items-center py-3 px-4 border-b cursor-pointer"
                    onClick={() => toggleAccordion(2)}
                  >
                    <span className="text-lg font-semibold">Clinic Expenses</span>
                    {openIndices.includes(2) ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {openIndices.includes(2) && (
                    <div className="p-4">
                      {ClinicExpensesData.length > 0 ? (
                        <Table bordered striped hover className="mt-2">
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
                                <td>{formatPrice(expense.amount)}</td>
                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                            <tr className="font-bold">
                              <td colSpan="3" className="text-right">Total Clinic Expenses:</td>
                              <td>{formatPrice(totalClinicExpenses.toFixed(2))}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </Table>
                      ) : (
                        <div>No Clinic Expenses</div>
                      )}
                    </div>
                  )}
                </AccordionItem>
              </Accordion>


              <Card className="mt-6 p-2 !border-0">
                <Card.Body>
                  <div className="grid grid-cols-3 gap-4 text-gray-600 text-sm font-medium">
                    <p className="text-[#00000080]">
                      Total Clinic Shares: <br />
                      <span className="text-2xl font-bold text-gray-900">
                        Rs. {formatPrice(clinicTotals.totalClinicShare.toFixed(0))}/-
                      </span>
                    </p>
                    <p className="text-[#00000080]">
                      Total Inventory Amount: <br />
                      <span className="text-2xl font-bold text-gray-900">
                        Rs. {formatPrice(totalInventoryAmount.toFixed(0))}/-
                      </span>
                    </p>
                    <p className="text-[#00000080]">
                      Total Clinic Expenses: <br />
                      <span className="text-2xl font-bold text-gray-900">
                        Rs. {formatPrice(totalClinicExpenses.toFixed(0))}/-
                      </span>
                    </p>
                  </div>
                  <hr className="mt-2 mb-4 border-[#C0C0C0] border-2" />
                  <h4 className="text-lg font-semibold text-[#00000080]">
                    Total Clinic Profit:
                    <br />
                    <span className="text-2xl font-bold text-green-600">
                      Rs. {formatPrice(totalClinicProfit.toFixed(0))}/-
                    </span>
                  </h4>
                </Card.Body>
              </Card>

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
