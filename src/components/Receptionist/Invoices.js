import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const InvoiceManagement = () => {
  const [key, setKey] = useState('unpaid');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingInvoiceID, setUpdatingInvoiceID] = useState(null);

  // Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://mustafahasnain36-001-site1.gtempurl.com/api/Prescription/GetInvoices');
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
      <h2 className="text-center mb-4">Invoice Management</h2>

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
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

// Table component to display invoices
const InvoiceTable = ({ invoices, showPayButton, markAsPaid, updatingInvoiceID, noInvoicesMessage }) => {
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
          {showPayButton && <th>Action</th>}
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
            {showPayButton && (
              <td>
                <Button
                  variant="success"
                  onClick={() => markAsPaid(invoice.invoiceID)}
                  disabled={updatingInvoiceID === invoice.invoiceID}
                >
                  {updatingInvoiceID === invoice.invoiceID ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    'Mark as Paid'
                  )}
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default InvoiceManagement;
