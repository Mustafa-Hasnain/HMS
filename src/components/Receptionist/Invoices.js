import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Tab, Table, Button, Spinner, Col, Form, Row } from 'react-bootstrap';
import axios from 'axios';
import PaymentModal from '../Custom Components/PaymentModal';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { network_url } from '../Network/networkConfig';
import { useReactToPrint } from 'react-to-print';
import Logo from "../../assets/Logo Green.png";
import { formatDoctorName } from '../utils/DoctorUtills';


const InvoiceManagement = () => {
  const [key, setKey] = useState('unpaid');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [updatingInvoiceID, setUpdatingInvoiceID] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  const componentRef = useRef();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${network_url}/api/Prescription/GetInvoices`);
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const markAsPaid = async (invoiceID) => {
    setUpdatingInvoiceID(invoiceID);
    try {
      await axios.post(`${network_url}/api/Prescription/invoice-pay`, { invoiceID });
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.invoiceID === invoiceID ? { ...invoice, status: 'Paid' } : invoice
        )
      );
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    } finally {
      setUpdatingInvoiceID(null);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const params = {};
      if (searchText) params.searched_text = searchText;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await axios.get(`${network_url}/api/Prescription/GetInvoices`, { params });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error searching invoices:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== 'Paid');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Invoice Report',
  });

  return (
    <div className="container mt-3">
      <div className="flex gap-3 items-center align-middle mb-2">
        <button onClick={() => navigate('/receptionist/overview')} className="text-success -mt-2">
          <FaArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-2xl">Invoice Management</h2>
      </div>

      <Form className="mb-2">
        <Row className="align-items-center">
          <Col md={4}>
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by text..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Label>From Date</Form.Label>
            <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Label>To Date</Form.Label>
            <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </Col>
          <Col className="pt-[30px] flex gap-2" md={2}>
            <Button variant="primary" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Search'}
            </Button>
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="overflow-auto max-h-[60vh] table-scroll">
          <InvoiceTable
            invoices={unpaidInvoices}
            showPayButton={true}
            markAsPaid={markAsPaid}
            updatingInvoiceID={updatingInvoiceID}
            noInvoicesMessage="No Invoices Found."
            setUpdatingInvoiceID={setUpdatingInvoiceID}
            setShowPaymentModal={setShowPaymentModal}
          />
        </div>
      )}

      <div style={{ display: 'none' }}>
        <PrintableInvoiceTable invoices={unpaidInvoices} ref={componentRef} />
      </div>

      <PaymentModal
        show={showPaymentModal}
        onHide={() => { setShowPaymentModal(false); setUpdatingInvoiceID(null); }}
        invoiceID={updatingInvoiceID}
        markAsPaid={() => markAsPaid(updatingInvoiceID)}
      />
    </div>
  );
};

// Table visible in UI
const InvoiceTable = ({ invoices, showPayButton, markAsPaid, updatingInvoiceID, noInvoicesMessage, setShowPaymentModal, setUpdatingInvoiceID }) => {
  const navigate = useNavigate();
  return invoices.length === 0 ? (
    <div className="text-center my-4">{noInvoicesMessage}</div>
  ) : (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Invoice ID</th>
          <th>MR. NO.</th>
          <th>Patient Name</th>
          <th>Doctor Name</th>
          <th>Total Amount</th>
          <th>Amount Paid</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice, index) => (
          <tr key={invoice.invoiceID}>
            <td>{index + 1}</td>
            <td>{new Date(invoice.appointment.appointmentDate).toLocaleDateString()}</td>
            <td>{invoice.invoiceID}</td>
            <td>{invoice.appointment.patient.patientID}</td>
            <td>{invoice.appointment.patient.firstName}</td>
            <td>{formatDoctorName(invoice.appointment.doctor.firstName)}</td>
            <td>{invoice.amount}</td>
            <td>{invoice.totalPaid}</td>
            <td>
              <Button variant="outline-success" className="!text-sm" onClick={() => navigate(`/receptionist/invoice-details/${invoice.appointment.appointmentID}/`)}>
                View Details
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// Printable version without Action column
const PrintableInvoiceTable = React.forwardRef(({ invoices }, ref) => {
  return (
    <div ref={ref} style={{ padding: '20px' }}>
      <div className="flex justify-between mb-3">
        <img src={Logo} alt="Woodlands Health Center Logo" style={{ width: '120px', height: '120px', marginBottom: '8px' }} />
        <div>
          <p style={{ fontSize: '12px', lineHeight: '1.2' }}>4th floor, Building 1-C, F8 Markaz, Islamabad. Ph: 051 6103000</p>
          <p style={{ fontSize: '12px', margin: '0' }}>woodlandshealthcenter@gmail.com</p>
          <p style={{ fontSize: '12px' }}>woodlandshealthcenter.com</p>
        </div>
      </div>

        <h3 className='text-center mb-3'>Invoices</h3>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Invoice ID</th>
            <th>MR. NO.</th>
            <th>Patient Name</th>
            <th>Doctor Name</th>
            <th>Total Amount</th>
            <th>Amount Paid</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={invoice.invoiceID}>
              <td>{index + 1}</td>
              <td>{new Date(invoice.appointment.appointmentDate).toLocaleDateString()}</td>
              <td>{invoice.invoiceID}</td>
              <td>{invoice.appointment.patient.patientID}</td>
              <td>{invoice.appointment.patient.firstName}</td>
              <td>{formatDoctorName(invoice.appointment.doctor.firstName)}</td>
              <td>{invoice.amount}</td>
              <td>{invoice.totalPaid}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

export default InvoiceManagement;
