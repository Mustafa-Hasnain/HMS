import React from 'react';
import Logo from "../../assets/Logo Green.png";
import { Col, Row } from 'react-bootstrap';
import "../../styles/print_table.css"
import { formatPrice } from '../utils/FormatPrice';

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
    const totalAppointments = (appointment.isConsultation && !appointment.isDeleted)
        ? mainInvoice.secondaryAppointments.length + 1
        : mainInvoice.secondaryAppointments.length;
    const totalProcedures = mainInvoice.procedureItems.length;

    // Total Invoice Items (Inventory)
    const totalInvoiceItems = mainInvoice.invoiceInventoryItems.length;

    // Appointments: Paid and Unpaid
    const totalPaidAppointments = mainInvoice.secondaryAppointments.filter(app => app.paid).length + (mainInvoice.paid ? 1 : 0);
    const totalUnpaidAppointments = totalAppointments - totalPaidAppointments;

    // Procedures: Paid and Unpaid
    const totalPaidProcedures = mainInvoice.procedureItems.filter(item => item.paid).length;
    const totalUnpaidProcedures = totalProcedures - totalPaidProcedures;

    // Inventory: Paid and Unpaid
    const totalInvoiceItemPaid = mainInvoice.invoiceInventoryItems.filter(item => item.paid).length;
    const totalUnpaidInvoiceItems = totalInvoiceItems - totalInvoiceItemPaid;

    // Totals for Amounts
    let totalAppointmentAmount = 0;
    let totalAppointmentPaid = 0;
    let totalAppointmentUnpaid = 0;

    let totalProcedureAmount = 0;
    let totalProcedurePaid = 0;
    let totalProcedureUnpaid = 0;

    let totalInvoiceItemAmount = 0;
    let totalInvoiceItemPaidAmount = 0;
    let totalInvoiceItemUnpaidAmount = 0;

    // Appointments Calculation
    if (appointment.isConsultation && !appointment.isDeleted) {
        totalAppointmentAmount += appointment.amount;
        if (appointment.paid) {
            totalAppointmentPaid += appointment.amount;
        } else {
            totalAppointmentUnpaid += appointment.amount;
        }
    }

    appointment.invoices.forEach(invoice => {
        invoice.secondaryAppointments.forEach(app => {
            totalAppointmentAmount += app.amount;
            if (app.paid) {
                totalAppointmentPaid += app.amount;
            } else {
                totalAppointmentUnpaid += app.amount;
            }
        });

        // Procedures Calculation
        invoice.procedureItems.forEach(item => {
            totalProcedureAmount += item.amount;
            if (item.paid) {
                totalProcedurePaid += item.amount;
            } else {
                totalProcedureUnpaid += item.amount;
            }
        });

        // Inventory Items Calculation
        invoice.invoiceInventoryItems.forEach(item => {
            totalInvoiceItemAmount += item.amount;
            if (item.paid) {
                totalInvoiceItemPaidAmount += item.amount;
            } else {
                totalInvoiceItemUnpaidAmount += item.amount;
            }
        });
    });

    // Grand Totals
    const totalPaid = totalAppointmentPaid + totalProcedurePaid + totalInvoiceItemPaidAmount;
    const totalUnpaid = totalAppointmentUnpaid + totalProcedureUnpaid + totalInvoiceItemUnpaidAmount;


    console.log("app date: ", appointmentDate)
    console.log("app time: ", appointmentTime)

    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':');

    // Set the hours and minutes correctly
    appointmentDateTime.setHours(hours);
    appointmentDateTime.setMinutes(minutes);

    // Format the date
    const formattedAppointmentDate = appointmentDateTime.toLocaleDateString('en-US', {
        weekday: 'short', // Mon
        year: 'numeric',  // 2024
        month: 'short',    // November
        day: 'numeric'    // 11
    });

    // Format the time in 12-hour format with AM/PM
    const formattedAppointmentTime = appointmentDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true     // 12-hour format with AM/PM
    });




    // console.log("Total Appointment Amount:", totalAppointmentAmount);
    // console.log("Total Appointment Paid:", totalAppointmentPaid);
    // console.log("Total Appointment Unpaid:", totalAppointmentUnpaid);

    // console.log("Total Procedure Amount:", totalProcedureAmount);
    // console.log("Total Procedure Paid:", totalProcedurePaid);
    // console.log("Total Procedure Unpaid:", totalProcedureUnpaid);

    // console.log("Total Paid (Appointments + Procedures):", totalPaid);
    // console.log("Total Unpaid (Appointments + Procedures):", totalUnpaid);


    const shouldShowAppointments =
        ((appointment.isConsultation && !appointment.isDeleted) || mainInvoice.secondaryAppointments.length > 0) &&
        !((!appointment.isConsultation || appointment.isDeleted) && mainInvoice.secondaryAppointments.length === 0);

    return (
        <div ref={ref} className="p-4 print-container" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header with Logo */}
            <Row>
                <Col className="text-left mb-4" style={{ textAlign: 'left' }}>
                    <img src={Logo} alt="Woodlands Health Center Logo" style={{ width: '120px', height: '120px', marginBottom: '8px' }} />

                    <p className="font-bold" style={{ fontSize: '16px', marginBottom: '6px' }}>From</p>
                    <p style={{ fontSize: '12px', lineHeight: '1.2' }}>4th floor, Building 1-C, F8 Markaz, Islamabad. Ph: 051 6103000</p>
                    <div style={{ marginTop: '3px', lineHeight: '1.2' }}>
                        <p style={{ fontSize: '12px', marginBottom: '2px' }}>woodlandshealthcenter@gmail.com</p>
                        <p style={{ fontSize: '12px' }}>woodlandshealthcenter.com</p>
                    </div>
                    <p className="font-bold" style={{ fontSize: '16px', marginBottom: '6px' }}>Medical Details</p>
                    <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
                        <p style={{ marginBottom: '3px' }}>
                            <strong>Blood Group:</strong> {patient.bloodGroup || 'N/A'}
                        </p>
                        <p style={{ marginBottom: '3px' }}>
                            <strong>Medical History:</strong> {patient.medicalHistory || 'N/A'}
                        </p>
                    </div>

                </Col>
                <Col className="text-right mb-4" style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
                    {/* <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Invoice</h1> */}
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Details</h2>

                    <div style={{ textAlign: 'right', marginBottom: '30px', paddingLeft: '60px', lineHeight: '1.2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>Invoice ID:</strong> <span>{mainInvoice.invoiceID}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>Invoice Date:</strong> <span>{new Date(mainInvoice.invoiceDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Appointment Information</h2> */}

                    <div style={{ textAlign: 'right', paddingLeft: '60px', lineHeight: '1.2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>MR. No.:</strong> <span>{patient.patientID}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>Patient Name:</strong> <span>{patient.firstName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>Date of Birth:</strong> <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>Age:</strong> <span>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} Years</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>Contact No:</strong> <span>{patient.mobileNumber}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0' }}>
                            <strong>CNIC:</strong> <span>{patient.cnic}</span>
                        </div>
                    </div>
                </Col>
            </Row>
            {/* <div className="text-center mb-4" style={{ textAlign: 'center' }}>
                <img src={Logo} alt="Woodlands Health Center Logo" style={{ width: '100px', marginBottom: '10px' }} />
                <h2 style={{ margin: 0 }}>Woodlands Health Center</h2>
                <p>4th floor, Building 1-C, F8 Markaz, Islamabad. | Ph: 051 6103000, Email: woodlandshealthcenter@gmail.com | woodlandshealthcenter.com</p>
            </div> */}

            <hr />

            {/* Patient Information */}
            {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
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
            </div> */}

            {/* Procedures Table */}
            {mainInvoice.procedureItems.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ color: 'black', fontWeight: 600, fontSize: 16 }}>Procedure Items</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '4px' }}>S.no.</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Procedure Name</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Doctor Name</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Amount</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Discount</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Paid Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainInvoice.procedureItems.map((item, index) => (
                                <tr key={item.procedureItemID}>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{index + 1}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{item.procedureName}</td>
                                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                                        {item?.doctor?.doctorID ? `Dr. ${item.doctor.firstName} ${item.doctor.lastName}` : '-'}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{formatPrice(item.amount)}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{item?.discountPercentage ? `${item?.discountPercentage} %` : '0'}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{item.isAdvancedPaid
                                        ? 'Advanced Paid'
                                        : item.paid
                                            ? 'Paid'
                                            : 'Unpaid'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {mainInvoice.invoiceInventoryItems.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ color: 'black', fontWeight: 600, fontSize: 16 }}>Inventory Items</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '4px' }}>S.no.</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Item Name</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Item Type</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Quantity</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Amount</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Paid Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainInvoice.invoiceInventoryItems.map((item, index) => (
                                <tr key={item.invoiceInventoryItemID}>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{index + 1}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{item.inventoryItem.name}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{item.inventoryItem.type}</td>
                                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{formatPrice(item.amount)}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{item.paid ? 'Paid' : 'Unpaid'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {shouldShowAppointments && (
                <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ color: 'black', fontWeight: 600, fontSize: 16 }}>Appointments/Consultations</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '4px' }}>S.no.</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Dated</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Doctor Name</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Amount</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Discount (%)</th>
                                <th style={{ border: '1px solid black', padding: '4px' }}>Paid Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map main appointment if isConsultation is true */}
                            {(appointment.isConsultation && !appointment.isDeleted) && (
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>1</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>
                                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>
                                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{formatPrice(appointment.amount)}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{appointment?.discountPercentage ? `${appointment?.discountPercentage} %` : '0'}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{appointment.isAdvancedPaid
                                        ? 'Advanced Paid'
                                        : appointment.paid
                                            ? 'Paid'
                                            : 'Unpaid'}</td>
                                </tr>
                            )}

                            {/* Map secondary appointments */}
                            {mainInvoice.secondaryAppointments.map((app, index) => (
                                <tr key={app.secondaryAppointmentID}>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{(appointment.isConsultation && !appointment.isDeleted) ? index + 2 : index + 1}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>
                                        {new Date(app.appointmentDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>
                                        Dr. {app.doctor.firstName} {app.doctor.lastName}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{formatPrice(app.amount)}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{app?.discountPercentage ? `${app?.discountPercentage} %` : '0'}</td>
                                    <td style={{ border: '1px solid black', padding: '4px' }}>{app.isAdvancedPaid
                                        ? 'Advanced Paid'
                                        : app.paid
                                            ? 'Paid'
                                            : 'Un-Paid'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {/* Summary */}
            <div
                style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '400px', // Smaller width for compactness
                    marginLeft: 'auto',
                    // boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'Arial, sans-serif',
                    color: '#333',
                    fontSize: '13px', // Smaller font size
                    lineHeight: '1.3',
                    position: 'absolute',
                    bottom: 5,
                    right: 20
                }}
            >
                <h3
                    style={{
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#000',
                        marginBottom: '12px',
                        fontSize: '15px', // Smaller font size for the title
                    }}
                >
                    INVOICE SUMMARY
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Total Appointments:</span>
                    <span>{totalAppointments}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Total Procedure Items:</span>
                    <span>{totalProcedures}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: '600' }}>
                    <span>Subtotal:</span>
                    <span>Rs. {formatPrice(totalAppointmentAmount + totalProcedureAmount + totalInvoiceItemAmount)}</span>
                </div>

                {/* <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Discount:</span>
                    <span>Rs. 0.00</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Sales Tax:</span>
                    <span>Rs. 0.00</span>
                </div> */}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: '600' }}>
                    <span>Total Amount:</span>
                    <span>Rs. {totalAppointmentAmount + totalProcedureAmount + totalInvoiceItemAmount}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: '600' }}>
                    <span>Total Amount Paid:</span>
                    <span>Rs. {formatPrice(totalPaid)}</span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderTop: '1px solid #ddd',
                        marginTop: '8px',
                        fontWeight: 'bold',
                        color: '#000',
                    }}
                >
                    <span>Balance Due:</span>
                    <span>Rs. {formatPrice(totalUnpaid.toFixed(2))}</span>
                </div>
            </div>

        </div>
    );
});

export default PrintableInvoiceView;
