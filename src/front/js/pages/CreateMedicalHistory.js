// pages/CreateMedicalHistory.js
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateMedicalHistory.css";

const CreateMedicalHistory = () => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [speciality, setSpeciality] = useState("");
    const [doctorEmail, setDoctorEmail] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [observation, setObservation] = useState("");
    const [specialities, setSpecialities] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                const response = await fetch(process.env.BACKEND_URL + "/api/specialities", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSpecialities(data);
                } else {
                    console.error("Error fetching specialities", response.statusText);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchSpecialities();
    }, []);

    useEffect(() => {
        if (speciality) {
            const fetchDoctorsBySpeciality = async () => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/medical-history/doctors-by-speciality?speciality=${speciality}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setDoctors(data);
                    } else {
                        console.error("Error fetching doctors by speciality", response.statusText);
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            };

            fetchDoctorsBySpeciality();
        } else {
            setDoctors([]);
        }
    }, [speciality]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/users`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${store.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    console.error("Error fetching users", response.statusText);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchUsers();
    }, [store.token]);

    const handleSave = async (e) => {
        e.preventDefault();

        const medicalHistory = {
            doctor_email: doctorEmail,
            user_email: userEmail,
            observation: observation
        };

        try {
            const response = await fetch(process.env.BACKEND_URL + "/api/medical-history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.token}`
                },
                body: JSON.stringify(medicalHistory)
            });

            if (response.ok) {
                alert("Historial médico guardado con éxito!");
                navigate("/medical-history");
            } else {
                alert("Error al guardar el historial médico.", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar el historial médico.");
        }
    };

    return (
        <div className="medical-history-create-container">
            <h1 className="medical-history-create-title">CREATE MEDICAL HISTORY</h1>
            <form onSubmit={handleSave}>
                <div className="medical-history-form-group">
                    <label>Speciality</label>
                    <select
                        value={speciality}
                        onChange={(e) => setSpeciality(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a speciality</option>
                        {specialities.map((spec, index) => (
                            <option key={index} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
                <div className="medical-history-form-group">
                    <label>Doctor's Email</label>
                    <select
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a doctor</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.info.email}>
                                {doctor.info.email}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="medical-history-form-group">
                    <label>User Email</label>
                    <select
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a user</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.email}>
                                {user.email}
                            </option>
                        ))}
                    </select>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="medical-history-form-group">
                    <label>Observation</label>
                    <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        required
                    />
                </div>
                <div className="medical-history-button-group">
                    <button
                        type="submit"
                        className="medical-history-btn medical-history-btn-save"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="medical-history-btn medical-history-btn-back"
                        onClick={() => navigate("/medical-history")}
                    >
                        Return
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateMedicalHistory;