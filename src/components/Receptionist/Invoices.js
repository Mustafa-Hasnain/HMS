import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import PaymentModal from '../Custom Components/PaymentModal';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const InvoiceManagement = () => {
  const [key, setKey] = useState('unpaid');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingInvoiceID, setUpdatingInvoiceID] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();


  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/GetInvoices');
        console.log("Fetch Invoices Data: ", response.data)
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Mark an invoice as paid
  const markAsPaid = async (invoiceID) => {
    setUpdatingInvoiceID(invoiceID);
    try {
      await axios.post('https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/invoice-pay', { invoiceID });
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

  // Filter invoices by status
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== 'Paid');
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid');

  return (
    <div className="container my-4">
      <div className="flex gap-3 items-center align-middle mb-4">
        <button onClick={() => navigate('/receptionist/overview')} className="text-success -mt-2">
          <FaArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-2xl">Invoice Management</h2>
      </div>

      {/* Tabs for switching between unpaid and paid invoices */}
      <Tabs
        id="invoice-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="unpaid" title="Unpaid Invoices">
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <InvoiceTable
              invoices={unpaidInvoices}
              showPayButton={true}
              markAsPaid={markAsPaid}
              updatingInvoiceID={updatingInvoiceID}
              noInvoicesMessage="No unpaid invoices left."
              setUpdatingInvoiceID={setUpdatingInvoiceID}
              setShowPaymentModal={setShowPaymentModal}
            />
          )}
        </Tab>

        <Tab eventKey="paid" title="Paid Invoices">
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <InvoiceTable
              invoices={paidInvoices}
              showPayButton={false}
              noInvoicesMessage="No paid invoices available."
              setUpdatingInvoiceID={setUpdatingInvoiceID}
              setShowPaymentModal={setShowPaymentModal}
            />
          )}
        </Tab>
      </Tabs>
      <PaymentModal
        show={showPaymentModal}
        onHide={() => { setShowPaymentModal(false); setUpdatingInvoiceID(null) }}
        invoiceID={updatingInvoiceID}
        markAsPaid={() => markAsPaid(updatingInvoiceID)}
      />
    </div>
  );
};

// Table component to display invoices
const InvoiceTable = ({ invoices, showPayButton, markAsPaid, updatingInvoiceID, noInvoicesMessage, setShowPaymentModal, setUpdatingInvoiceID }) => {
  const navigate = useNavigate();
  return invoices.length === 0 ? (
    <div className="text-center my-4">{noInvoicesMessage}</div>
  ) : (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Patient Name</th>
          <th>Patient Phone</th>
          <th>Doctor Name</th>
          <th>Total Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice, index) => (
          <tr key={invoice.invoiceID}>
            <td>{index + 1}</td>
            <td>{invoice.appointment.patient.firstName}</td>
            <td>{invoice.appointment.patient.mobileNumber}</td>
            <td>{invoice.appointment.doctor.firstName}</td>
            <td>{invoice.amount}</td>
            <td>{invoice.status}</td>

            <td>
              <div className='flex gap-3'>
                {showPayButton && (
                  <Button
                    variant="outline-success"
                    onClick={() => {
                      setUpdatingInvoiceID(invoice.invoiceID)
                      setShowPaymentModal(true);
                    }}
                    className='!text-sm'
                    disabled={updatingInvoiceID === invoice.invoiceID}
                  >
                    {updatingInvoiceID === invoice.invoiceID ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      'Mark as Paid'
                    )}
                  </Button>
                )}
                <Button variant='outline-success' className='!text-sm'
                  onClick={() => (navigate(`/receptionist/invoice-details/${invoice.appointment.appointmentID}/`))}
                >
                  View Details
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default InvoiceManagement;
