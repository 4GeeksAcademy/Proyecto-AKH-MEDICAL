import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/ViewPatientHistories.css";

const ViewPatientHistories = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [patientEmails, setPatientEmails] = useState([]);

    useEffect(() => {
        const fetchPatientHistories = async () => {
            try {
                const response = await fetch(process.env.BACKEND_URL + "/api/patient-histories", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPatientEmails(data); // Suponiendo que data es una lista de correos electrónicos
                } else {
                    console.error("Error fetching patient histories");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchPatientHistories();
    }, [store.token]);

    const handleViewHistory = (email) => {
        navigate(`/patient-history/${email}`);
    };

    return (
        <div className="patient-histories-container">
            <h1 className="patient-histories-title">MEDICAL HISTORY</h1>
            <div className="patient-emails-list">
                {patientEmails.map((email, index) => (
                    <button
                        key={index}
                        className="patient-email-btn"
                        onClick={() => handleViewHistory(email)}
                    >
                        {email}
                    </button>
                ))}
            </div>
            <button className="back-btn" onClick={() => navigate("/doctor-dashboard")}>Volver</button>
        </div>
    );
};

export default ViewPatientHistories;
