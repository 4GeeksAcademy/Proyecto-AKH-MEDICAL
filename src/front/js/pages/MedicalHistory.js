import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MedicalHistory.css";

const MedicalHistory = () => {
    const navigate = useNavigate();

    return (
        <div className="doctor-container">
            <h1 className="doctor-title">Medical History</h1>
            <div className="doctor-buttons">
                <button className="doctor-btn">View Patient Medical History</button>
                <button className="doctor-btn" onClick={() => navigate("/create-medical-history")}>Create Medical History</button>
                <button className="doctor-btn">View My Medical History</button>
            </div>
        </div>
    );
};

export default MedicalHistory;