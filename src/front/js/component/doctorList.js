import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { DoctorCard } from "./doctorCard";
import "../../styles/cards.css";

export const DoctorList = () => {
    const { store, actions } = useContext(Context);
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        if (store.selectedSpeciality) {
            actions.getDoctorBySpeciality(store.selectedSpeciality);
        } else {
            actions.getDoctorBySpeciality();
        }
    }, [store.selectedSpeciality]);


    return (
        <div className="row">
            {store.doctors && store.doctors.length > 0 ? (
                store.doctors
                    .filter((doctor) => {
                        if (store.selectedSpeciality) {
                            return doctor.speciality === store.selectedSpeciality;
                        } else {
                            return true;
                        }
                    })
                    .filter((doctor) => {
                        if (searchTerm) {
                            const searchTermLower = searchTerm.toLowerCase();
                            return doctor.name.toLowerCase().includes(searchTermLower);
                        } else {
                            return true;
                        }
                    })
                    .map((doctor) => (
                        <div className="col-md-4" key={doctor.id}>
                            <DoctorCard doctor={doctor} />
                        </div>
                    ))
            ) : (
                <p>No doctors found</p>
            )}
        </div>
    );
}