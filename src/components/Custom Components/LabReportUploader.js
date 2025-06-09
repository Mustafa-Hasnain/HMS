import React, { useState } from 'react';
import axios from 'axios';
import { FaFileMedical } from 'react-icons/fa';
import { network_url } from '../Network/networkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { Button } from 'react-bootstrap';

const LabReportUploader = ({ patientId, doctorId, invoiceId }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPG, PNG, PDF allowed.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB.');
            return;
        }

        const formData = new FormData();
        formData.append('File', file);
        formData.append('PatientId', patientId);
        formData.append('DoctorId', doctorId);
        formData.append('InvoiceId', invoiceId);

        setUploading(true);
        setProgress(0);

        try {
            const response = await axios.post(
                `${network_url}/api/LabReports/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    },
                }
            );

            toast.success(response.data.message || 'Lab report uploaded successfully.');
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data || 'Failed to upload lab report.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('labReportInput').click();
    };

    return (
        <>
            {/* <ToastContainer></ToastContainer> */}
            <div className="relative inline-block">
                <input
                    id="labReportInput"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                />
                <Button
                    disabled={uploading}
                    onClick={triggerFileInput}
                    variant='outline-success'
                    size='sm'
                    className={`!flex !items-center gap-2 py-2 ${uploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-100 text-green-600'}`}
                >
                    <FaFileMedical />
                    {uploading ? `Uploading... ${progress}%` : 'Add Lab Report'}
                </Button>

                {uploading && (
                    <div className="absolute bottom-0 left-0 h-1 bg-green-300 rounded-sm" style={{ width: `${progress}%` }} />
                )}
            </div>
        </>
    );
};

export default LabReportUploader;
