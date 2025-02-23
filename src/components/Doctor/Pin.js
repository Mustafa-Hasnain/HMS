import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { network_url } from "../Network/networkConfig";
import { Col, Row } from "react-bootstrap";
import Dots from "../../assets/dots.png";
import Dots_small from '../../assets/dots small.png';
import Logo from "../../assets/Logo.png";

const PinConfirmation = () => {
    const navigate = useNavigate();
    const inputRefs = useRef([]);
    const [pin, setPin] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [doctorData, setDoctorData] = useState(null);


    useEffect(() => {
        const storedDoctorData = localStorage.getItem("doctorOTP");
        if (storedDoctorData) {
            setDoctorData(JSON.parse(storedDoctorData));
        } else {
            navigate("/"); // Redirect if no OTP data found
        }
    }, [navigate]);

    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return; // Allow only numbers
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus(); // Move to next input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pin.includes("")) {
            toast.error("Please enter the complete OTP.");
            return;
        }

        setLoading(true);
        const otpCode = pin.join("");

        try {
            const response = await axios.post(`${network_url}/api/OTP/verify?doctorId=${doctorData.doctorID}&otpCode=${otpCode}`);
            if (response.data.success) {
                toast.success(response.data.message);
                localStorage.setItem('doctor', JSON.stringify(response.data.data));
                setTimeout(() => navigate('/doctor/appointments'), 1500);
            } else {
                toast.error(response.data.message);
                if (response.data.message === "OTP expired.") {
                    await resendOTP();
                }
            }
        } catch (error) {
            toast.error("OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        if (!doctorData) return;

        try {
            await axios.post(`${network_url}/api/OTP/send?doctorId=${doctorData.doctorID}`);
            toast.info("A new OTP has been sent.");
        } catch (error) {
            toast.error("Failed to resend OTP.");
        }
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
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="bg-white p-6 rounded-lg shadow-sm w-96">
                    <h3 className="text-center text-2xl font-semibold mb-3">Email Confirmation</h3>
                    <p className="text-center text-gray-600 mb-4">
                        A 6-digit OTP has been sent to <span className="font-bold">{doctorData?.emailID}</span>.
                        Please enter it below.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 mb-4">
                            {pin.map((value, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={value}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    className="w-10 h-12 text-xl text-center border rounded-md focus:ring focus:ring-blue-500"
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-md font-medium hover:bg-blue-600 transition"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Submit"}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <button onClick={resendOTP} className="text-blue-500 hover:underline">
                            Resend OTP
                        </button>
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default PinConfirmation;
