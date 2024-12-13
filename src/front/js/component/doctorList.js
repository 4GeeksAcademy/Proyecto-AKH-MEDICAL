import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { DoctorCard } from "./doctorCard";
import "../../styles/cards.css";

export const DoctorList = () => {
    const { store, actions } = useContext(Context);
    const [specialities, setSpecialities] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState(store.doctors);

    // Este useEffect se encarga de cargar los doctores filtrados por especialidad al cambiar store.selectedSpeciality
    useEffect(() => {
        console.log("selectedSpeciality changed:", selectedSpeciality);

        if (selectedSpeciality) {
            actions.getDoctorBySpeciality(selectedSpeciality); // Llama a la acción que trae los doctores por especialidad
        } else {
            actions.getDoctorBySpeciality(); // Llama a la acción para obtener todos los doctores
        }
    }, []);

    useEffect(() => {
        async function gettingSpecialities() {
            if (isDataLoaded) return;
            const response = await actions.getSpecialities();

            if (Array.isArray(response) && response.length > 0) {
                setSpecialities(response);
                setIsDataLoaded(true)
            }
        }

        gettingSpecialities();
    }, []);

    // Función de búsqueda
    const handleSearch = (e) => {
        const text = e.target.value;
        console.log("Search text changed:", text);
        setSearchText(text); // Actualiza el texto de búsqueda
    };

    // Función para manejar el cambio de especialidad
    const handleSpecialityChange = (e) => {
        const speciality = e.target.value;
        console.log("Speciality changed:", speciality);
        setSelectedSpeciality(speciality); // Actualiza la especialidad seleccionada
    };

    // useEffect para filtrar los doctores solo cuando cambian los textos de búsqueda o especialidad
    useEffect(() => {
        console.log("Doctors en store:", store.doctors);

        if (store.doctors) {
            let filtered = store.doctors;

            // Filtrar por especialidad
            if (selectedSpeciality) {
                console.log("Filtrando por especialidad:", selectedSpeciality);
                filtered = filtered.filter(
                    (doctor) => doctor.speciality === selectedSpeciality
                );
            }

            // Filtrar por nombre
            if (searchText) {
                console.log("Filtrando por nombre:", searchText);
                const searchTermLower = searchText.toLowerCase();
                filtered = filtered.filter((doctor) => {
                    const fullName = `${doctor.info.first_name} ${doctor.info.last_name}`;
                    return fullName.toLowerCase().includes(searchTermLower);
                });
            }

            console.log("Doctores filtrados:", filtered);
            setFilteredDoctors(filtered); // Actualizamos la lista de doctores filtrados
        }
    }, [searchText, selectedSpeciality, store.doctors]); // Este effect depende de store.doctors, searchText y selectedSpeciality
    
    return (
        <div className="container">
            {/* Formulario con el dropdown para seleccionar especialidad */}
            <div className="mb-4">
                <form>
                    <label htmlFor="specialitySelect" className="form-label">
                        Select Speciality:
                    </label>
                    <select
                        id="specialitySelect"
                        className="form-select"
                        value={selectedSpeciality}
                        onChange={handleSpecialityChange}
                    >
                        <option value="">All Specialities</option>
                        {store.specialities.map((speciality, index) => (
                            <option key={index} value={speciality}>
                                {speciality}
                            </option>
                        ))}
                    </select>
                </form>
            </div>

            {/* Campo de búsqueda */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    className="form-control"
                    value={searchText}
                    onChange={handleSearch} // Llama a handleSearch cuando cambia el input
                />
            </div>

            {/* Mostrar los doctores */}
            <div className="row g-0 justify-content-center">
                {filteredDoctors && filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <div className="col-md-6 col-12 mb-3 p-0" key={doctor.id}>
                            <DoctorCard doctor={doctor} />
                        </div>
                    ))
                ) : (
                    <div className="text-center mt-5">
                        <i
                            className="fa-solid fa-user-doctor fa-5x"
                            style={{ color: "#4682B4" }}
                        ></i>
                        <h2 className="mt-4" style={{ color: "#6c757d" }}>
                            No doctors found
                        </h2>
                        <p className="mt-3 mb-5" style={{ color: "#6c757d", fontSize: "18px" }}>
                            Please try a different search term or come back later.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};