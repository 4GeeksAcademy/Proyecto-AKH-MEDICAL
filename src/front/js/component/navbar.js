import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";

export const Navbar = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="ps-0 pe-0">
			<nav className="navbar navbar-light bg-light pt-2 pb-0">
				<div className="container-fluid p-0 m-0">
					<Link to="/">
						<img className="ps-5" src={logoImgUrl} style={{ height: "100px" }} />
					</Link>

					{/* Contenedor de Login/SignUp (Parte superior derecha) */}
					<div className="d-flex ms-auto">
						{store.user === false || store.user == null ? (
							<div>
								<Link to="/login">
									<button className="btn btn-outline-success mx-3 btn-login">Login</button>
								</Link>
								<Link to="/signup">
									<button className="btn btn-outline-success me-5 btn-signup">SignUp</button>
								</Link>
							</div>
						) : <button className="btn btn-outline-danger mx-3" onClick={() => actions.logOut()}>LogOut</button>}
					</div>
				</div>

				{/* Barra de navegación (Botones de Appointment, Who we are, etc.) */}
				<div className="container-fluid navbar-buttons d-flex justify-content-start gap-3 p-2 background">
					<div>
						<Link to="/appointment">
							<button className="btn btn-dark card-buttons btn-appointment">Appointment</button>
						</Link>
					</div>

					<div>
						<HashLink to="/#who">
							<button className="btn btn-dark card-buttons btn-who-we-are">Who we are</button>
						</HashLink>
					</div>

					<div>
						<HashLink to="/#work">
							<button className="btn btn-dark card-buttons btn-how-it-works">How it works</button>
						</HashLink>
					</div>

					<div>
						<HashLink to="/#testimonials">
							<button className="btn btn-dark card-buttons btn-testimonials">Testimonials</button>
						</HashLink>
					</div>
				</div>
			</nav>
		</div>
	);
};