import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaFileMedical } from 'react-icons/fa';
import { network_url } from '../Network/networkConfig';

const LabReportsModal = ({ show, onHide, invoiceId, doctorId }) => {
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (show) fetchLabReports();
    }, [show]);

    const fetchLabReports = async () => {
        setLoading(true);
        try {
            let url = `${network_url}/api/LabReports/invoice/${invoiceId}`;
            if (doctorId) {
                url += `?doctorId=${doctorId}`;
            }

            const response = await axios.get(url);
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch lab reports', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileName = (fileUrl) => {
        return fileUrl.split('/').pop();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className='flex gap-2 items-center'><FaFileMedical className="mr-2" /> Lab Reports</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <div className="mt-2">Loading lab reports...</div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-4">No lab reports found.</div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Created At</th>
                                <th>File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.labReportID}>
                                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                                    <td>
                                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                                            {getFileName(report.fileUrl)}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LabReportsModal;
