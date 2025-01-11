import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/ViewPatients.css";

const ViewPatients = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    useEffect(() => {
        actions.fetchPatientsForLoggedInDoctor();
    }, [store.patients]);


    const viewMedicalHistory = (patientId) => {
        navigate(`/patient-history/${patientId}`);
    };

    const goBack = () => {
        navigate(-1); // Navegar a la página anterior
    };

    return (
        <div className="patients-view-container">
            <button onClick={goBack} className="return-btn">Back</button>
            <h1 className="patients-view-title">My Patients</h1>
            {store.patients.length === 0 ? (
                <p>No patients found.</p>
            ) : (
                <ul className="patients-list">
                    {store.patients.map(patient => (
                        <li key={patient.id} className="patients-item">
                            <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                            <p><strong>Email:</strong> {patient.email}</p>
                            <p><strong>Age:</strong> {patient.age}</p>
                            <button onClick={() => viewMedicalHistory(patient.id)} className="view-history-btn">View Medical History</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewPatients;
