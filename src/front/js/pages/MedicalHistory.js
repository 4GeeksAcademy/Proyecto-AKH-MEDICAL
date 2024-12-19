import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MedicalHistory.css";

const MedicalHistory = () => {
    const navigate = useNavigate();
    // Traer el rol de local storage 
    let role = localStorage.getItem('role');
    return (
        <div className="doctor-container">
            <h1 className="doctor-title">Medical History</h1>
            <div className="doctor-buttons">
                {
                    role === 'DOCTOR' && (
                        <div>
                            <button className="doctor-btn" onClick={() => navigate("/view-patients")}>View Patient Medical History</button>
                            <br />
                            <button className="doctor-btn" onClick={() => navigate("/create-medical-history")}>Create Medical History</button>
                        </div>
                    )
                }
                {
                    role === 'PATIENT' && (
                        <div>
                            <button className="doctor-btn" onClick={() => navigate("/view-medical-history")}>View My Medical History</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default MedicalHistory;
