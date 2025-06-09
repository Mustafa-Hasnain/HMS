import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { network_url } from '../components/Network/networkConfig';

const DoctorsContext = createContext();

export const useDoctors = () => useContext(DoctorsContext);

export const DoctorsProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState(null);

  // useCallback prevents unnecessary re-creation of this function on re-renders
  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      setDoctorError(null);
      const response = await fetch(`${network_url}/api/Receptionist/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors.');
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctor data:', err);
      setDoctorError('Error fetching doctor data. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]); // safe to use due to useCallback

  return (
    <DoctorsContext.Provider
      value={{
        doctors,
        loadingDoctors,
        doctorError,
        refreshDoctors: fetchDoctors, // use this after creating new doctor
      }}
    >
      {children}
    </DoctorsContext.Provider>
  );
};
