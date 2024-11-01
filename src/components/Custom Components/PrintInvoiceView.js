import React from 'react';
import Logo from "../../assets/Logo Green.png";

const PrintableInvoiceView = React.forwardRef(({ patient, doctor, invoices, appointmentDate, appointmentTime }, ref) => (
    <div ref={ref} className="p-4 print-container" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Logo */}
        <div className="text-center mb-4 justify-center" style={{ textAlign: 'center' }}>
            <img className="mx-auto" src={Logo} alt="Woodlands Health Center Logo" style={{ width: '100px', marginBottom: '10px' }} />
            <h2 style={{ margin: 0 }}>Woodlands Health Center</h2>
            <p>Address | Contact Number | Website</p>
        </div>

        <hr />

        {/* Doctor Information */}
        <div className="mb-3">
            <h3 style={{ color: 'black', fontWeight: 600 }}>DOCTOR INFORMATION</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p><strong>Name:</strong> Dr. {doctor.firstName} {doctor.lastName}</p>
                <p><strong>Specialty:</strong> {doctor.specialty}</p>
            </div>
        </div>

        {/* Patient Information */}
        <div className="mb-3">
            <h3 style={{ color: 'black', fontWeight: 600 }}>PATIENT INFORMATION</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p><strong>Name:</strong> {patient.firstName}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p><strong>Contact:</strong> {patient.mobileNumber}</p>
            </div>
        </div>

        {/* Examination Details */}
        <div className="mb-3">
            <h3 style={{ color: 'black', fontWeight: '600' }}>APPOINTMENT DETAILS</h3>
            <p><strong>Appointment Date:</strong> {new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Appointment Time:</strong> {appointmentTime}</p>
            {/* Additional examination details if needed */}
        </div>

        {/* Procedures */}
        {invoices.some(invoice => invoice.procedureItems.length > 0) && (
            <div className="mb-3 mt-4">
                <h3 style={{ color: 'black', fontWeight: 600 }}>PROCEDURE ITEMS</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Procedure Name</th>
                            <th>Detail</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.flatMap(invoice =>
                            invoice.procedureItems.map(item => (
                                <tr key={item.procedureItemID}>
                                    <td>{item.procedureName}</td>
                                    <td>{item.procedureDetail || 'N/A'}</td>
                                    <td>{item.amount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* Invoice Details */}
        <div className="mb-3 mt-4">
            <h3 style={{ color: 'black', fontWeight: 600 }}>INVOICE DETAILS</h3>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Invoice ID</th>
                        <th>Invoice Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        {/* <th>Due Date</th> */}
                        {/* <th>Payment Method</th> */}
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice.invoiceID}>
                            <td>{invoice.invoiceID}</td>
                            <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.status}</td>
                            {/* <td>{new Date(invoice.dueDate).toLocaleDateString()}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
));

export default PrintableInvoiceView;
