import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";


export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const [specialities, setSpecialities] = useState([]);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const [selectedSpeciality, setSelectSpecialitiesId] = useState(null);
	const [searchText, setSearchText] = useState('');

	const handleSpecialitySelectId = (speciality) => {
		if (speciality === selectedSpeciality) {
			setSelectSpecialitiesId(null);
			actions.setSelectedSpeciality(null);
			actions.getDoctorBySpeciality(null);
		} else {
			setSelectSpecialitiesId(speciality);
			actions.setSelectedSpeciality(speciality);
			actions.getDoctorBySpeciality(speciality);
		}
	};

	const handleSearch = (e) => {
		if (e.key === 'Enter' || e.type === 'click') {
			actions.searchDoctors(searchText)
		}
	}

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

	useEffect(() => {
		async function loadDoctors() {
			await actions.getAllDoctors();
		}
		loadDoctors();
	}, []);


	return (
		<div className="ps-0 pe-0">
			<nav className="navbar navbar-light bg-light pt-2 pb-0">
				<div className="container-fluid p-0 m-0">
					<Link to="/">
						<img className="ps-5" src={logoImgUrl} style={{ height: "100px" }} />
					</Link>
					<div className="d-flex ms-auto">
						{store.user === false || store.user==null? (
							<div>
								<Link to="/login">
									<button className="btn btn-outline-success mx-3">Login</button>
								</Link>
								<Link to="/signup">
									<button className="btn btn-outline-success me-5">SignUp</button>
								</Link>
							</div>
						) : <button className="btn btn-outline-danger mx-3" onClick={()=>actions.logOut()}>LogOut</button>}
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
							<Link to="/appointment">
								<button className="btn btn-dark card-buttons">Appointment</button>
							</Link>
						</div>

						<div>
							<HashLink to="/#who">
								<button className="btn btn-dark card-buttons">Who we are</button>
							</HashLink>
						</div>

						<div>
							<HashLink to="/#work">
								<button className="btn btn-dark card-buttons">How it works</button>
							</HashLink>
						</div>

						<div>
							<HashLink to="/#testimonials">
								<button className="btn btn-dark card-buttons">Testimonials</button>
							</HashLink>
						</div>

						<div className="search-bar d-flex align-items-center ms-auto">
							<input type="text" placeholder="Doctor's name" className="form-control" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyUp={(e) => handleSearch(e)} />
							<span className="btn" onClick={handleSearch}>
								<i className="fa fa-search me-4"></i>
							</span>
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
};