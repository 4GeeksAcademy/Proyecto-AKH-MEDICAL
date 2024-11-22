import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { DoctorCard } from "./doctorCard";
import "../../styles/cards.css";

export const DoctorList = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.getDoctorBySpeciality();
    }, [])

    return (
        <div className="row">
            {store.doctors.map((doctor) => (
                <div className="col-md-4" key={doctor.id}>
                    <DoctorCard doctor={doctor} />
                </div>
            ))}
        </div>
    )
}