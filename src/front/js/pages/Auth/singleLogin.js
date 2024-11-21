import React, { useContext, useState } from "react";
import { Context } from "../../store/appContext";
// import "../../../styles/home.css";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'

export const SingleLogin = () => {
    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const login = async (e) => {
        e.preventDefault()
        if (email == "") {
            mensajeError("Email is missing")
        }
        if (password == "") {
            mensajeError("Password is missing")
        }
        let resp = await actions.getLogin(email, password)
        if (resp) {
            navigate("/")
        } else {
            mensajeError("Something went wrong")
        }
    }
    function mensajeError(texto) {
        Swal.fire({
            title: 'Error!',
            text: texto,
            icon: 'error',
            confirmButtonText: 'Ok'
        })
    }

    return (
        <div style={{ backgroundImage: 'url("https://img.freepik.com/fotos-premium/largo-corredor-hospital-equipo-medico-blanco-casilleros_124507-44132.jpg")', backgroundSize: 'cover' }}>
            <div className="row">
                <div className="col-12 vh-100 d-flex flex-column justify-content-center align-items-center">
                    <h1 className="text-center mb-3">LOGIN</h1>
                    <form className="pt-4 ps-4 pe-4 pb-4 bg-secondary">
                        <div>
                            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                        </div>
                        <div>
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control mb-2" id="exampleInputPassword1" />
                        </div>
                    </form>
                    <button type="button" onClick={(e) => login(e)} className="btn btn-outline-success mt-4">Login</button>
                </div>
            </div>
        </div>
    );
};