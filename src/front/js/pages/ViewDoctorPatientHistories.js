import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import "../../styles/ViewDoctorPatientHistories.css";

const DoctorPatientHistories = () => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/medical-history/doctor/patients`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPatients(data);
                } else {
                    setErrorMessage("Error al obtener los pacientes.");
                }
            } catch (error) {
                console.error("Error:", error);
                setErrorMessage("Error al obtener los pacientes.");
            }
        };

        fetchPatients();
    }, [store.token]);

    const handleViewHistory = (patientEmail) => {
        // Navegar a la vista del historial médico del paciente
        navigate(`/patient-history/${patientEmail}`);
    };

    return (
        <div className="doctor-patient-histories-container">
            <h1 className="doctor-patient-histories-title">Medical History</h1>
            <h2>Patients</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <ul className="patients-list">
                {patients.map((patient, index) => (
                    <li key={index} className="patient-item">
                        <span>{patient.email}</span>
                        <button onClick={() => handleViewHistory(patient.email)} className="view-button">
                            View <FaEye />
                        </button>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate("/doctor-dashboard")} className="back-button">Return</button>
        </div>
    );
};

export default DoctorPatientHistories;
