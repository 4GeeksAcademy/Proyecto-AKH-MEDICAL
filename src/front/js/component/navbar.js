import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";


export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const [specialities, setSpecialities] = useState([]);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [selectedSpeciality, setSelectSpecialitiesId] = useState(null);


	const handleSpecialitySelectId = (speciality) => {
		console.log("Especialidad seleccionada:", speciality);
		if (speciality === selectedSpeciality) {
			console.log("Deseleccionando especialidad:", speciality);
			setSelectSpecialitiesId(null); // Desmarca la especialidad
			actions.setSelectedSpeciality(null); // Actualiza el store
			actions.getDoctorBySpeciality(null); // Llama a la API para obtener todos los doctores
		} else {
			console.log("Seleccionando especialidad:", speciality);
			setSelectSpecialitiesId(speciality); // Marca la especialidad seleccionada
			actions.setSelectedSpeciality(speciality); // Actualiza el store
			actions.getDoctorBySpeciality(speciality); // Llama a la API con la especialidad seleccionada
		}
	};



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


	return (
		<div className="ps-0 pe-0">
			<nav className="navbar navbar-light bg-light pt-2 pb-0">
				<div className="container-fluid p-0 m-0">
					<Link to="/">
						<img className="ps-5" src={logoImgUrl} style={{ height: "100px" }} />
					</Link>
					<div className="d-flex ms-auto">
						{store.auth === false ? (
							<div>
								<Link to="/login">
									<button className="btn btn-outline-success mx-3">Login</button>
								</Link>
								<Link to="/signup">
									<button className="btn btn-outline-success me-5">Sign_up</button>
								</Link>
							</div>
						) : null}
					</div>

					<div className="container-fluid d-flex align-items-center justify-content-between p-2 background">
						<div className="specialties-buttons d-flex gap-3">
							<div className="dropdown ps-5">
								<button className="btn btn-dark dropdown-toggle navbar-buttons" data-bs-toggle="dropdown" aria-expanded="false">Especialidades</button>
								<ul className="dropdown-menu">
									{Array.isArray(specialities) && specialities.length > 0 ? (
										specialities.map((speciality, index) => (
											<li
												className={`dropdown-item ${speciality === selectedSpeciality ? 'active' : ''}`}
												key={index}
												onClick={() => handleSpecialitySelectId(speciality)}
											>
												{speciality}
												{speciality === selectedSpeciality && (
													<i className="fa fa-check ms-2" /> // Ícono de check cuando está seleccionado
												)}
											</li>
										))
									) : (
										<li className="dropdown-item">No specialities available</li>
									)}
								</ul>
							</div>
						</div>

						<div>
							<Link to={"/appointment"}>
								<button className="btn btn-dark card-buttons">Appointment</button>
							</Link>
						</div>

						<div className="search-bar d-flex align-items-center ms-auto">
							<input type="text" placeholder="Doctor's name" className="form-control" />
							<span className="btn">
								<i className="fa fa-search me-4"></i>
							</span>
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
};