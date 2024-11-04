import React from 'react';
import Logo from "../../assets/Logo Green.png";

// Function to calculate the patient's age
const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const PrintableInvoiceView = React.forwardRef(({ patient, doctor, invoices, appointment, appointmentDate, appointmentTime }, ref) => {
    const mainInvoice = invoices[0];
    const totalAppointments = mainInvoice.secondaryAppointments.length + 1; // 1 for main appointment
    const totalProcedures = mainInvoice.procedureItems.length;
    const totalPaidAppointments = mainInvoice.secondaryAppointments.filter(app => app.paid).length + (mainInvoice.paid ? 1 : 0);
    const totalUnpaidAppointments = totalAppointments - totalPaidAppointments;
    const totalPaidProcedures = mainInvoice.procedureItems.filter(item => item.paid).length;
    const totalUnpaidProcedures = totalProcedures - totalPaidProcedures;

    return (
        <div ref={ref} className="p-4 print-container" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header with Logo */}
            <div className="text-center mb-4" style={{ textAlign: 'center' }}>
                <img src={Logo} alt="Woodlands Health Center Logo" style={{ width: '100px', marginBottom: '10px' }} />
                <h2 style={{ margin: 0 }}>Woodlands Health Center</h2>
                <p>Address | Contact Number | Website</p>
            </div>

            <hr />

            {/* Patient Information */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>MR. No.</p>
                    <h2 style={{ margin: '0' }}>{patient.patientID}</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>Invoice. No.</p>
                    <h2 style={{ margin: '0' }}>{mainInvoice.invoiceID}</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>Patient Name</p>
                    <h2 style={{ margin: '0' }}>{patient.firstName}</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>Contact No</p>
                    <h2 style={{ margin: '0' }}>{patient.mobileNumber}</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>CNIC</p>
                    <h2 style={{ margin: '0' }}>{patient.cnic}</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>Date of Birth</p>
                    <h2 style={{ margin: '0' }}>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>Age</p>
                    <h2 style={{ margin: '0' }}>{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'} Years</h2>
                </div>
                <div className="patientDetails" style={{ flex: '1 1 30%', lineHeight: '1.2' }}>
                    <p style={{ margin: '0', fontWeight: '600' }}>Invoice Date</p>
                    <h2 style={{ margin: '0' }}>{mainInvoice.invoiceDate ? new Date(mainInvoice.invoiceDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</h2>
                </div>
            </div>

            {/* Procedures Table */}
            {mainInvoice.procedureItems.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: 'black', fontWeight: 600 }}>PROCEDURE ITEMS</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Procedure Name</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Detail</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Amount</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Paid Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainInvoice.procedureItems.map(item => (
                                <tr key={item.procedureItemID}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{item.procedureName}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{item.procedureDetail || 'N/A'}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{item.amount}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{item.paid ? 'Paid' : 'Unpaid'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Secondary Appointments Table */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: 'black', fontWeight: 600 }}>APPOINTMENTS</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Appointment ID</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Doctor Name</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Amount</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Paid Status</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr key={appointment.appointmentID}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{appointment.appointmentID}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>Dr. {doctor.firstName} {doctor.lastName}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{appointment.amount}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{appointment.paid ? 'Paid' : 'Unpaid'}</td>
                            </tr>

                            {mainInvoice.secondaryAppointments.map(app => (
                                <tr key={app.secondaryAppointmentID}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{app.secondaryAppointmentID}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>Dr. {app.doctor.firstName} {app.doctor.lastName}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{app.amount}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{app.paid ? 'Paid' : 'Unpaid'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            {/* Summary */}
            <div style={{
                marginTop: '20px',
                borderTop: '2px solid black',
                paddingTop: '10px',
                border: '1px solid black',
                padding: '15px',
                borderRadius: '5px',
                boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
            }}>
                <h3 style={{ color: 'black', fontWeight: '600', textAlign: 'center', marginBottom: '15px' }}>INVOICE SUMMARY</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    <p><span style={{ fontWeight: '600' }}>Total Appointments:</span> {totalAppointments}</p>
                    <p><span style={{ fontWeight: '600' }}>Total Procedure Items:</span> {totalProcedures}</p>

                    <p><span style={{ fontWeight: '600' }}>Total Amount:</span> Rs. {mainInvoice.amount.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
});

export default PrintableInvoiceView;
