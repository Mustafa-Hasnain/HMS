import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const useCheckDoctorRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const doctor = JSON.parse(localStorage.getItem("doctor"));

        if (doctor) {
            // If doctor exists in localStorage but the URL does not contain '/doctor/', redirect to '/doctor/overview'
            if (!location.pathname.includes("/doctor/") || !location.pathname.includes("/")) {
                navigate("/doctor/overview");
            }
        } else {
            // If no doctor is found and the URL is '/doctor/', redirect to home '/'
            if (location.pathname.startsWith("/doctor/")) {
                navigate("/");
            }
        }
    }, [navigate, location]);
};

export default useCheckDoctorRedirect;
