import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Spinner, Row, Col, Card, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for Chart.js to work

const RevenueComponent = () => {
    const [key, setKey] = useState('doctors');
    const [clinicData, setClinicData] = useState([]);
    const [doctorsData, setDoctorsData] = useState([]);
    const [revenueRecords, setRevenueRecords] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5037/api/Revenue/clinic-and-doctors-30days');
                const data = await response.json();

                setClinicData(data.clinicRevenues || []);
                setDoctorsData(data.doctors || []);
                setRevenueRecords(data.revenueRecords || []);
                setLoading(false); // Set loading to false when data is fetched
            } catch (error) {
                console.error("Error fetching revenue data:", error);
                setLoading(false); // Stop loading even if there's an error
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
        );
    }

    // Extracting latest 10 entries for clinic
    const latestClinicData = clinicData.slice(-10);

    // Prepare data for the Line Chart (Doctors Revenue)
    const doctorCharts = doctorsData.map(doctor => {
        const doctorChartData = {
            labels: doctor.revenues.map(entry => new Date(entry.dateOfService).toLocaleDateString()),
            datasets: [{
                label: `Doctor: ${doctor.doctorName}`,
                data: doctor.revenues.map(entry => entry.cumulativeDoctorRevenue),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        return { doctor, doctorChartData };
    });

    // Prepare data for the Line Chart (Clinic Revenue)
    const clinicChartData = {
        labels: latestClinicData.map(entry => new Date(entry.dateOfService).toLocaleDateString()),
        datasets: [{
            label: 'Clinic Revenue',
            data: latestClinicData.map(entry => entry.cumulativeClinicRevenue),
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    };

    // Create a doctor ID to name mapping for revenue records
    const doctorNameMap = Object.fromEntries(doctorsData.map(doctor => [doctor.doctorID, doctor.doctorName]));

    return (
        <div className="w-full p-5">
            <Tabs
                id="revenue-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
            >
                <Tab eventKey="doctors" title="Doctors Revenue">
                    {doctorCharts.length > 0 ? (
                        <Row>
                            {doctorCharts.map(({ doctor, doctorChartData }) => (
                                <Col key={doctor.doctorID} md={4} sm={6} xs={12} className="mb-4">
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>{doctor.doctorName}</Card.Title>
                                            <Line data={doctorChartData} />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="flex justify-center items-center h-52">
                            <h5>No transactions occurred in the last 30 days.</h5>
                        </div>
                    )}
                </Tab>
                <Tab eventKey="clinic" title="Clinic Revenue">
                    <div className="max-w-5xl mx-auto mb-4">
                        {latestClinicData.length > 0 ? (
                            <>
                                <Line data={clinicChartData} />
                                <div className="overflow-auto max-h-60">
                                    <Table className="table-auto w-full mt-4">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Doctor Name</th>
                                                <th>Doctor Revenue</th>
                                                <th>Clinic Revenue</th>
                                                <th>Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueRecords.map((record) => (
                                                <tr key={record.revenueRecordID}>
                                                    <td>{new Date(record.dateOfService).toLocaleDateString()}</td>
                                                    <td>{doctorNameMap[record.doctorID] || 'Unknown Doctor'}</td>
                                                    <td>{record.doctorRevenue.toFixed(2)}</td>
                                                    <td>{record.clinicRevenue.toFixed(2)}</td>
                                                    <td>{record.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center items-center h-52">
                                <h5>No transactions occurred in the last 30 days.</h5>
                            </div>
                        )}
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default RevenueComponent;
