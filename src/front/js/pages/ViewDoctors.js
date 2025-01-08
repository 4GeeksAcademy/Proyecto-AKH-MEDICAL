import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import "../../styles/ViewDoctors.css";

const ViewDoctors = () => {
    const { store, actions } = useContext(Context);
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await actions.fetchDoctorsForLoggedInPatient();
                setDoctors(data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
        fetchDoctors();
    }, []); 

    useEffect(() =>{
            actions.fetchDoctorsForLoggedInPatient()
    }, []);

    const viewMedicalHistories = (doctorId) => {
        navigate(`/doctor-medical-histories/${doctorId}`);
    };

    const goBack = () => {
        navigate(-1); 
    };

    return (
        <div className="doctors-view-container">
            <button onClick={goBack} className="return-btn">Return</button>
            <h1 className="doctors-view-title">My Doctors</h1>
            {doctors.length === 0 ? (
                <p>No doctors found.</p>
            ) : (
                <ul className="doctors-list">
                    {doctors.map(doctor => (
                        <li key={doctor.id} className="doctors-item">
                            <p><strong>Name:</strong> {doctor.first_name} {doctor.last_name}</p>
                            <p><strong>Email:</strong> {doctor.email}</p>
                            <p><strong>Speciality:</strong> {doctor.speciality}</p>
                            <button onClick={() => viewMedicalHistories(doctor.id)} className="view-histories-btn">View Medical Histories</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewDoctors;
