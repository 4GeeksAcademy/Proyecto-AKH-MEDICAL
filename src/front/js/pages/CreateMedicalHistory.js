import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/CreateMedicalHistory.css";

const CreateMedicalHistory = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [userEmail, setUserEmail] = useState("");
    const [observation, setObservation] = useState("");

    useEffect(() => {
        actions.fetchDoctorEmail();
        actions.fetchPatients();
    }, []); // Ejecutar solo una vez al montar el componente

    const handleSubmit = (e) => {
        e.preventDefault();
        const medicalHistory = {
            doctor_email: store.doctorEmail,
            user_email: userEmail,
            observation,
        };

        actions.createMedicalHistory(medicalHistory)
            .then(data => {
                console.log("Medical history created:", data);
                navigate("/medical-history");
            })
            .catch(error => console.error("Error creating medical history:", error));
    };

    return (
        <div className="medical-history-create-container">
            <h1 className="medical-history-create-title">Create Medical History</h1>
            <form onSubmit={handleSubmit} className="create-medical-history-form">
                <div className="medical-history-form-group">
                    <label htmlFor="doctorEmail">Doctor's Email:</label>
                    <input
                        type="email"
                        id="doctorEmail"
                        value={store.doctorEmail || ""}
                        readOnly
                        className="form-control"
                    />
                </div>
                <div className="medical-history-form-group">
                    <label htmlFor="userEmail">User's Email:</label>
                    <select
                        id="userEmail"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                        className="form-control"
                    >
                        <option value="">Select a user</option>
                        {Array.isArray(store.patients) && store.patients.map(patient => (
                            <option key={patient.id} value={patient.email}>
                                {patient.email}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="medical-history-form-group">
                    <label htmlFor="observation">Observation:</label>
                    <textarea
                        id="observation"
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <div className="medical-history-button-group">
                    <button type="submit" className="medical-history-btn">Save Medical History</button>
                    <button type="button" className="medical-history-btn medical-history-btn-back" onClick={() => navigate("/medical-history")}>Back</button>
                </div>
            </form>
        </div>
    );
};

export default CreateMedicalHistory;