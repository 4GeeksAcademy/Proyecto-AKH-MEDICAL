import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/PatientMedicalHistory.css";

const PatientMedicalHistory = () => {
    const { store, actions } = useContext(Context);
    const { id } = useParams();
    const [medicalHistories, setMedicalHistories] = useState([]);

    useEffect(() => {
        actions.fetchMedicalHistoriesForPatient(id).then(histories => {
            setMedicalHistories(histories);
        });
    }, [actions, id]);

    return (
        <div className="patient-history-view-container">
            <h1 className="patient-history-view-title">Medical Histories for Patient</h1>
            {medicalHistories.length === 0 ? (
                <p>No medical histories found.</p>
            ) : (
                <ul className="patient-history-list">
                    {medicalHistories.map(history => (
                        <li key={history.id} className="patient-history-item">
                            <p><strong>Doctor:</strong> {history.doctor_email}</p>
                            <p><strong>Observation:</strong> {history.observation}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PatientMedicalHistory;
