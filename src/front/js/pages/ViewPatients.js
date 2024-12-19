import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/ViewPatients.css";

const ViewPatients = () => {
    const { store, actions } = useContext(Context);
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        actions.fetchPatientsForLoggedInDoctor().then(patients => {
            setPatients(patients);
        });
    }, [actions]);

    return (
        <div className="patients-view-container">
            <h1 className="patients-view-title">My Patients</h1>
            {patients.length === 0 ? (
                <p>No patients found.</p>
            ) : (
                <ul className="patients-list">
                    {patients.map((patient, index) => (
                        <li key={index} className="patients-item">
                            <button 
                                onClick={() => navigate(`/patient-history/${patient.id}`)} 
                                className="patients-btn"
                            >
                                {patient.email}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewPatients;
