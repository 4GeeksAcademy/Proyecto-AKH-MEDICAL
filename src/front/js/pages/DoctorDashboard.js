import React from "react";
import { Link } from "react-router-dom";
import "../../styles/DoctorDashboard.css";

const DoctorDashboard = () => {
    return (
        <div className="doctor-container mt-5">
            <h1 className="doctor-title">MEDICAL HISTORY</h1>
            <div className="doctor-buttons d-flex flex-column align-items-center">
                <Link to="/view-patient-histories"> 
                    <button className="doctor-btn mb-3">View Patient Medical History</button>
                </Link>
                <Link to="/create-medical-history"> 
                    <button className="doctor-btn mb-3">Create Medical History</button>
                </Link>
                <Link to="/view-doctor-histories">
                    <button className="doctor-btn mb-3">View My Medical History</button>
                </Link>
            </div>
        </div>
    );
};

export default DoctorDashboard;

