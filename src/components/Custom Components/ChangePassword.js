import React, { useState } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { network_url } from '../Network/networkConfig';

const ChangePasswordCard = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const doctorId = JSON.parse(localStorage.getItem('doctor'))?.doctorID;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long.');
        return;
      }
    if (newPassword !== confirmPassword) {
      toast.error('New Password and Re-entered Password do not match.');
      return;
    }

    setSubmitting(true);
    const payload = {
        doctorID: doctorId,
        currentPassword,
        newPassword,
      };

    try {
      const response = await fetch(`${network_url}/api/Doctor/Change-Password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if(response.status === 401){
        throw new Error('Incorrect Current Password');
      }

      if (!response.ok) 
        throw new Error('Failed to change password.');

      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm p-4 max-w-lg mx-auto mt-5">
      <Card.Header className="bg-primary text-white text-center text-lg font-semibold">
        Change Password
      </Card.Header>
      <Card.Body>
        <ToastContainer />
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formCurrentPassword" className="mt-3 relative">
            <Form.Label>Current Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="!rounded-md"
              />
              <InputGroup.Text
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="cursor-pointer absolute !bg-transparent !border-0 right-0 top-1 z-50"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formNewPassword" className="mt-3 relative">
            <Form.Label>Enter New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="!rounded-md"
              />
              <InputGroup.Text
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="cursor-pointer absolute !bg-transparent !border-0 right-0 top-1 z-50"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formConfirmPassword" className="mt-3 relative">
            <Form.Label>Re-Enter New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="!rounded-md"
              />
              <InputGroup.Text
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="cursor-pointer absolute !bg-transparent !border-0 right-0 top-1 z-50"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            variant="outline-primary"
            className="mt-4 w-full"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Change Password'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ChangePasswordCard;
