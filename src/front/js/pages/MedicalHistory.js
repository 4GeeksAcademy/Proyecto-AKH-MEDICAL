import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/MedicalHistory.css";

const MedicalHistory = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    // Traer el rol de local storage 
    let role = localStorage.getItem('role');
    const verify = async () => {
        await actions.fetchPatientsForLoggedInDoctor()
        navigate("/view-patients")
        window.location.reload();
    }
    return (
        <div className="doctor-container">
            <h1 className="doctor-title">Medical History</h1>
            <div className="doctor-buttons">
                {
                    role === 'DOCTOR' && (
                        <div>
                            <button className="doctor-btn" onClick={() => verify()}>View Patient Medical History</button>
                            <br />
                            <button className="doctor-btn" onClick={() => navigate("/create-medical-history")}>Create Medical History</button>
                        </div>
                    )
                }
                {
                    role === 'PATIENT' && (
                        <div>
                            <button className="doctor-btn" onClick={() => navigate("/view-doctors")}>View My Doctors</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default MedicalHistory;