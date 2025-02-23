// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { Card, Button, Form, Row, Col, InputGroup, Spinner, ToastContainer, Toast } from 'react-bootstrap';
import Dots from "../assets/dots.png";
import Dots_small from '../assets/dots small.png';
import Logo from "../assets/Logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Icons for show/hide password
import { network_url } from './Network/networkConfig';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGlobalError('');

    const payload = { username: username, password: password };

    // Simple validation
    let validationErrors = {};
    if (!username) validationErrors.username = 'Phone number is required';
    if (!password) validationErrors.password = 'Password is required';
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    // Hardcoded login logic for now
    if (username === 'admin' && password === 'admin') {
      const userData = { role: 'receptionist', token: 'fake-token' };
      login(userData);
      navigate('/receptionist/upcoming-doctor-appointments');
    } else if (username && password) {
      try {
        const response = await fetch(`${network_url}/api/Doctor/Doctor-Login`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 401) {
          const response_data = await response.json();
          localStorage.setItem('doctorOTP', JSON.stringify(response_data));
          navigate("/otpVerification")
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to login. Please check your credentials.');
        }

        const response_data = await response.json();
        localStorage.setItem('doctor', JSON.stringify(response_data));
        navigate('/doctor/appointments');
      } catch (error) {
        setGlobalError('Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setGlobalError('Invalid credentials.');
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };


  return (
      <Row>
        <Col md={4}>
          <div className="bg-[#00743C] text-white p-5 flex flex-col justify-center items-center h-full Montserrat text-center relative overflow-hidden">
            {/* Logo at the top right */}
            <img src={Logo} alt="Logo" className="absolute top-5 left-[10%] h-[15%]" />
            <img src={Dots_small} alt="" className='absolute top-0 -right-12'></img>


            {/* Centered content */}
            <div className="flex flex-col mb-[35%] text-left">
              <h1 className="text-3xl font-bold text-left">Welcome Back</h1>
              <p className="text-left max-w-md mt-4 Barlow font-normal text-base">
                WOODLANDS Health Center Dashboard Login
                Manage, Monitor, Access
              </p>
            </div>

            <img src={Dots} alt="" className='absolute bottom-0 left-0 w-[35%]'></img>

          </div>
        </Col>
        <Col md={8} className="h-screen overflow-y-auto flex justify-center items-center">
          <Form className="p-2 w-[60%]" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold mb-2 text-center text-[#04394F]">Login</h2>
            <p className='text-center font-normal text-base Barlow'>Please login to continue to your account.</p>

            {/* Phone Number Input */}
            <Form.Group className="mt-2" controlId="formPhoneNumber">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!!errors.username}
              />
              {errors.username && <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>}
            </Form.Group>

            {/* Password Input with Visibility Toggle */}
            <Form.Group controlId="formPassword" className="mt-3 relative">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  isInvalid={!!errors.password}
                  required
                  className='!rounded-md'
                />
                <InputGroup.Text
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute !bg-transparent !border-0 right-0 top-1 z-50"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
                {errors.password && <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>}
              </InputGroup>
            </Form.Group>

             {/* Global Error Toast */}
             {globalError && (
              <ToastContainer position="top-end" className="p-3">
                <Toast bg="danger" onClose={() => setGlobalError('')} delay={3000} autohide>
                  <Toast.Body>{globalError}</Toast.Body>
                </Toast>
              </ToastContainer>
            )}

            {/* Login Button with Spinner */}
            <Button
              className="bg-[#CFA640] mt-[10%] w-full text-white font-semibold"
              type="submit"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="mr-2"
                  />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Form>
        </Col>
      </Row>
  );
}

export default Login;
