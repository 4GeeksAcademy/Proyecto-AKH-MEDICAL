import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateMedicalHistory.css";

const CreateMedicalHistory = () => {
    const navigate = useNavigate();
    const [doctorEmail, setDoctorEmail] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [observation, setObservation] = useState("");
    const [patients, setPatients] = useState([]);

    // Obtener el correo del doctor desde localStorage
    useEffect(() => {
        try {
            const email = localStorage.getItem('email');
            if (email) {
                setDoctorEmail(email);
            } else {
                console.error("No doctor email found in localStorage");
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error);
        }
    }, []);

    // Obtener la lista de pacientes desde el backend
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/patients", {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                });

                console.log("Response status:", response.status); // Estado de la respuesta

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized access - token may be invalid or expired");
                    }
                    throw new Error("Failed to fetch patients");
                }

                const text = await response.text();
                console.log("Raw response text:", text); // Respuesta en texto crudo

                const data = JSON.parse(text);
                console.log("Parsed JSON data:", data); // Datos JSON parseados

                if (Array.isArray(data)) {
                    setPatients(data);
                } else {
                    throw new Error("Received invalid JSON data");
                }
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        fetchPatients();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const medicalHistory = {
            doctor_email: doctorEmail,
            user_email: userEmail,
            observation,
        };

        fetch("/api/medical-history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(medicalHistory),
        })
            .then(response => {
                console.log("Submit response status:", response.status); // Estado de la respuesta al guardar el historial médico
                return response.json();
            })
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
                        value={doctorEmail}
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
                        {patients.map(patient => (
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