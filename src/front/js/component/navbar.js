import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";


export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const [specialities, setSpecialities] = useState([]);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [selectedSpecialitiesId, setSelectSpecialitiesId] = useState(null);

	const handleSpecialitySelectId = (speciality) => {
		setSelectSpecialitiesId(speciality);
		actions.getDoctorBySpeciality(speciality);
	}


	useEffect(() => {
		async function gettingSpecialities() {
			if (isDataLoaded) return; // Si los datos ya están cargados, no hacemos la llamada
			const response = await actions.getSpecialities();

			if (Array.isArray(response) && response.length > 0) {
				setSpecialities(response); // Actualizamos el estado solo si la respuesta es válida
				setIsDataLoaded(true)
			}
		}

		gettingSpecialities();
	}, [setIsDataLoaded, actions]);


	return (
		<nav className="navbar navbar-light bg-light pt-2 pb-2">
			<div className="container-fluid">
				<Link to="/">
					<img src={logoImgUrl} style={{ height: "100px" }} />
				</Link>
				<div className="d-flex ml-auto">
					{store.auth === false ? (
						<div>
							<Link to="/login">
								<button className="btn btn-outline-success mx-3">Login</button>
							</Link>
							<Link to="/signup">
								<button className="btn btn-outline-success">Sign_up</button>
							</Link>
						</div>
					) : null}
				</div>

				<div className="container-fluid d-flex align-items-center justify-content-between p-2 background">
					<div className="specialties-buttons d-flex gap-3">
						<div className="dropdown">
							<button className="btn btn-dark dropdown-toggle navbar-buttons" data-bs-toggle="dropdown" aria-expanded="false">Especialidades</button>
							<ul className="dropdown-menu">
								{Array.isArray(specialities) && specialities.length > 0 ? (
									specialities.map((speciality, index) => (
										<li className="dropdown-item" key={index} onClick={() => handleSpecialitySelectId(speciality)}>
											{speciality}
										</li>
									))
								) : (
									<li className="dropdown-item">No hay especialidades disponibles</li>
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
						<input type="text" placeholder="Nombre del doctor" className="form-control" />
						<span className="btn">
							<i className="fa fa-search"></i>
						</span>
					</div>
				</div>
			</div>
		</nav>
	);
};