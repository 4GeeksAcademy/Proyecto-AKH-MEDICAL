import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/DoctorMedicalHistories.css";

const DoctorMedicalHistories = () => {
    const { store, actions } = useContext(Context);
    const { doctorId } = useParams();
    const [medicalHistories, setMedicalHistories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMedicalHistories = async () => {
            try {
                const data = await actions.fetchMedicalHistoriesWithDoctor(doctorId);
                setMedicalHistories(data);
            } catch (error) {
                console.error("Error fetching medical histories:", error);
            }
        };
        fetchMedicalHistories();
    }, [doctorId]);

    const goBack = () => {
        navigate(-1); 
    };

    return (
        <div className="medical-histories-view-container">
            <button onClick={goBack} className="return-btn">Return</button>
            <h1 className="medical-histories-view-title">Medical Histories with Doctor</h1>
            {medicalHistories.length === 0 ? (
                <p>No medical histories found.</p>
            ) : (
                <ul className="medical-histories-list">
                    {medicalHistories.map(history => (
                        <li key={history.id} className="medical-histories-item">
                            <p><strong>Doctor:</strong> {history.doctor.first_name} {history.doctor.last_name}</p>
                            <p><strong>Doctor Email:</strong> {history.doctor.email}</p>
                            <p><strong>Speciality:</strong> {history.doctor.speciality}</p>
                            <p><strong>Patient:</strong> {history.patient.first_name} {history.patient.last_name}</p>
                            <p><strong>Patient Email:</strong> {history.patient.email}</p>
                            <p><strong>Observation:</strong> {history.observation}</p>
                            <p><strong>Created At:</strong> {new Date(history.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DoctorMedicalHistories;