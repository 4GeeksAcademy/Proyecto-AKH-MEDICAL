import React from "react";
import { Link } from "react-router-dom";
import "../../styles/cards.css";
import RigoImgUrl from "../../img/rigo-baby.jpg";

export const DoctorCard = ({ doctor }) => {

    return (
        <div className="container">
            {doctor ? (
                <div className="row">

                    <div className="card w-75 mb-3" key={doctor.id}>
                        <div className="row g-0">
                            <div className="col-auto text-start">
                                <img src={RigoImgUrl} className="img-fluid rounded-circle doctor-image" />
                            </div>
                            <div className="col p-0 text-start">
                                <h5 className="card-title">Nombre: {doctor.info.first_name} {doctor.info.last_name}</h5>
                                <p className="card-text">Especialidad: {doctor.speciality}</p>
                            </div>
                        </div>

                        <div className="row g-0">
                            <div className="col">
                                <div className="card-body text-center">
                                    <div className="button-strip">
                                        <Link to={`/doctors/${doctor.id}`}>
                                            <button className="btn btn-dark card-buttons">View profile</button>
                                        </Link>
                                        <Link to={`/appointment/${doctor.id}`}>
                                            <button className="btn btn-dark card-buttons">Appointment</button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
                : (
                    <p>No doctors available</p>
                )}
        </div>
    );
}