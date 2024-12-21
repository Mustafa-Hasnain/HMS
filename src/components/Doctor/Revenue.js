import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Spinner, Card, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for Chart.js to work
import { network_url } from '../Network/networkConfig';

const DoctorRevenue = () => {
    const [key, setKey] = useState('doctor');
    const [clinicData, setClinicData] = useState([]);
    const [doctorData, setDoctorData] = useState(null);
    const [revenueRecords, setRevenueRecords] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            const doctorDataFromLocalStorage = JSON.parse(localStorage.getItem('doctor'));
            const doctorID = doctorDataFromLocalStorage?.doctorID;

            if (!doctorID) {
                console.error("Doctor ID not found in local storage.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${network_url}/api/Revenue/doctor/${doctorID}/revenue`);

                // Check if the response is OK (status code 200)
                if (!response.ok) {
                    throw new Error("No revenue data found.");
                }

                const data = await response.json();
                setDoctorData(data.doctor);
                setClinicData(data.clinicRevenues || []);
                setRevenueRecords(data.revenueRecords || []);
                setLoading(false); // Set loading to false when data is fetched
            } catch (error) {
                console.error("Error fetching revenue data:", error);
                setError(error.message); // Set error message
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

    const renderNoDataMessage = (tab) => (
        <div className="flex justify-center items-center h-full">
            <h5>No transactions occurred in the last 30 days for {tab} revenue.</h5>
        </div>
    );

    // Prepare data for the Line Chart (Doctor Revenue)
    const doctorChartData = doctorData && doctorData.revenues.length > 0 ? {
        labels: doctorData.revenues.map(entry => new Date(entry.dateOfService).toLocaleDateString()),
        datasets: [{
            label: `Doctor: ${doctorData.doctorName}`,
            data: doctorData.revenues.map(entry => entry.cumulativeDoctorRevenue),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    } : null;

    // Prepare data for the Line Chart (Clinic Revenue)
    const latestClinicData = clinicData.slice(-10);
    const clinicChartData = latestClinicData.length > 0 ? {
        labels: latestClinicData.map(entry => new Date(entry.dateOfService).toLocaleDateString()),
        datasets: [{
            label: 'Clinic Revenue',
            data: latestClinicData.map(entry => entry.cumulativeClinicRevenue),
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    } : null;

    return (
        <div className="w-full p-5">
            <Tabs
                id="revenue-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
            >
                <Tab eventKey="doctor" title="Doctor Revenue">
                    <div className="max-w-5xl mx-auto mb-4">
                        {doctorData && doctorData.revenues.length > 0 ? (
                            <>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{doctorData.doctorName}</Card.Title>
                                        <Line data={doctorChartData} />
                                    </Card.Body>
                                </Card>
                                <div className="overflow-auto max-h-60">
                                    <Table className="table-auto w-full mt-4">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Doctor Revenue</th>
                                                <th>Clinic Revenue</th>
                                                <th>Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueRecords.map((record) => (
                                                <tr key={record.revenueRecordID}>
                                                    <td>{new Date(record.dateOfService).toLocaleDateString()}</td>
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
                            renderNoDataMessage("Doctor")
                        )}
                    </div>
                </Tab>
                <Tab eventKey="clinic" title="Clinic Revenue">
                    <div className="max-w-5xl mx-auto mb-4">
                        {clinicChartData ? (
                            <Line data={clinicChartData} />
                        ) : (
                            renderNoDataMessage("Clinic")
                        )}
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default DoctorRevenue;
