import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import logoImgUrl from "../../img/logo_akh.png";
import "../../styles/navbar.css";

export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const [profilePicture, setProfilePicture] = useState(null);

	const handleFileChange = (e) => {
		setProfilePicture(e.target.files[0]);
	}

	const handleUpload = async () => {
		const formData = new FormData();
		formData.append("profilePicture", profilePicture);

		const response = await actions.updateProfilePicture(formData);
		if (response) {
			alert("Profile picture updated successfully!");
		} else {
			alert("Failed to update profile picture.");
		}
	};

	return (
		<div className="ps-0 pe-0">
			<nav className="navbar navbar-light bg-light pb-0">
				<div className="container-fluid p-0 m-0">
					<Link to="/">
						<img className="" src={logoImgUrl} style={{ width: "250px", height: "100px" }} />
					</Link>
					<div className="d-flex ms-auto">
						{store.user === false || store.user == null ? (
							<div>
								<Link to="/login">
									<button className="btn btn-outline-success mx-3 btn-login">Login</button>
								</Link>
								<Link to="/signup">
									<button className="btn btn-outline-success btn-signup">SignUp</button>
								</Link>
							</div>
						) : <button className="btn btn-outline-danger mx-3 pt-3 pb-3 ps-4 pe-4" style={{borderRadius:"23px", border:"2px solid"}} onClick={() => actions.logOut()}>LogOut</button>	
						}
						
					</div>
				</div>
				<div className="container-fluid navbar-buttons d-flex justify-content-start gap-3 p-2 background">
					<div>
						<HashLink to="/#who">
							<button className="btn btn-dark card-buttons btn-who-we-are pt-3 pb-3 ps-4 pe-4">Who we are</button>
						</HashLink>
					</div>

					<div>
						<HashLink to="/#work">
							<button className="btn btn-dark card-buttons btn-how-it-works pt-3 pb-3 ps-4 pe-4">How it works</button>
						</HashLink>
					</div>

					<div>
						<HashLink to="/#testimonials">
							<button className="btn btn-dark card-buttons btn-testimonials pt-3 pb-3 ps-4 pe-4">Testimonials</button>
						</HashLink>
					</div>
				</div>
			</nav>
		</div>
	);
};