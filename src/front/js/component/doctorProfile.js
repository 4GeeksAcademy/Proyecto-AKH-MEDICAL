import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import RigoImgUrl from "../../img/rigo-baby.jpg";
import "../../styles/doctorProfile.css";

export const DoctorProfile = () => {
    const { id } = useParams();
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        actions.getDoctorById(id)
    }, [id]);

    const doctor = store.selectedDoctor;

    if (!doctor) {
        return <p>Loading...</p>;
    }

    return (
        <div className="doctor-profile-container">
            <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i> Regresar
            </button>

            <div className="doctor-profile-card">
                <div className="doctor-image-container">
                    <img src={RigoImgUrl} className="doctor-image" alt="Doctor" />
                </div>
                <div className="doctor-info">
                    <h5 className="doctor-name">{doctor.info.first_name} {doctor.info.last_name}</h5>
                    <p className="doctor-specialty"><strong>Especialidad:</strong> {doctor.speciality}</p>
                    <p className="doctor-age"><strong>Edad:</strong> {doctor.info.age} años</p>
                    <p className="doctor-email"><strong>Email:</strong> {doctor.info.email}</p>
                    <Link to={`/appointment/${doctor.id}`}>
                        <button className="btn btn-primary schedule-btn">
                            <i className="fas fa-calendar-alt schedule-btn"></i> Agendar cita
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};