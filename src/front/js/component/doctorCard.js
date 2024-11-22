import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/cards.css";
import RigoImgUrl from "../../img/rigo-baby.jpg";

export const DoctorCard = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDoctors = async () => {
            if (store.allDoctors.length === 0) {
                try {
                    await actions.getAllDoctors();
                } catch (error) {
                    console.error("Error fetching doctors", error);
                }
            }
            setLoading(false);
        };

        fetchDoctors();

    }, []);

    if (loading) {
        return <p>Loading...</p>
    }
    
    return (
        <div className="container">
            {store.allDoctors.length > 0 ? (
                store.allDoctors.map((doctor) => (
                    <div className="card w-100 mb-3" key={doctor.id}>
                        <div className="row g-0">
                            <div className="col-md-4">
                                <img src={RigoImgUrl} className="img-fluid " />
                            </div>
                            <div className="col-md-8">
                                <div className="card-body text-start">
                                    <h5 className="card-title">Nombre: {doctor.info.first_name} {doctor.info.last_name}</h5>
                                    <p className="card-text">Especialidad: {doctor.speciality}</p>
                                    <p className="card-text"><small className="text-body-secondary">Last updated 3 mins ago</small></p>
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
                ))
            ) : (
                <p>No doctors available</p>
            )}
        </div>
    )
}