import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/PatientMedicalHistory.css";

const PatientMedicalHistory = () => {
    const { store, actions } = useContext(Context);
    const { id } = useParams();
    const navigate = useNavigate();
    const [medicalHistories, setMedicalHistories] = useState([]);

    useEffect(() => {
        actions.fetchMedicalHistoriesForDoctorAndPatient(id).then(histories => {
            setMedicalHistories(histories);
        });
    }, [actions, id]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="patient-history-view-container">
            <button onClick={goBack} className="return-btn">Back</button>
            <h1 className="patient-history-view-title">Medical Histories for Patient</h1>
            {medicalHistories.length === 0 ? (
                <p>No medical histories found.</p>
            ) : (
                <ul className="patient-history-list">
                    {medicalHistories.map(history => (
                        <li key={history.id} className="patient-history-item">
                            <p><strong>Doctor:</strong> {history.doctor.first_name} {history.doctor.last_name}</p>
                            <p><strong>Doctor Email:</strong> {history.doctor.email}</p>
                            <p><strong>Patient:</strong> {history.patient.first_name} {history.patient.last_name}</p>
                            <p><strong>Patient Email:</strong> {history.patient.email}</p>
                            <p><strong>Created At:</strong> {new Date(history.created_at).toLocaleString()}</p>
                            <p><strong>Observation:</strong> {history.observation}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PatientMedicalHistory;