import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

export const Navbar = () => {
	const { actions, store } = useContext(Context)
	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Home</span>
				</Link>
				<div className="ml-auto">
					{store.auth == false ?
						<div>
							<Link to="/">
								<button className="btn btn-outline-success mx-3">Login</button>
							</Link>
							<Link to="/single">
								<button className="btn btn-outline-success">Sign_up</button>
							</Link>
						</div>
						:
						<Link to="/">
							<button className="btn btn-outline-success mx-3" onClick={actions.log_out}>Log_out</button>
						</Link>
					}
				</div>
			</div>
		</nav>
	);
};