import React, { useState, useEffect, useContext, act } from "react";
import { Context } from "../../store/appContext";
import { Navigate, useNavigate } from "react-router-dom";

const SingleSignup = () => {
    const { store, actions } = useContext(Context)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [age, setAge] = useState("")
    const [role, setRole] = useState("")
    const [speciality, setSpeciality] = useState("")
    const [timeAvailability, setTimeAvailability] = useState("")
    const [medicalConsultantPrice, setMedicalConsultantPrice] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(email, password, firstName, lastName, country, city, age, role)
        if (email != "" && password != "" && firstName != "" && lastName != "" && country != "" && city != "" && age != "" && role != "") {
            let data = {
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName,
                country: country,
                city: city,
                age: age,
                role: role
            }
            if (role == "DOCTOR") {
                data["speciality"] = speciality
                data["time_availability"] = timeAvailability
                data["medical_consultant_price"] = medicalConsultantPrice
            }
            let resp = await actions.sign_up(data)
            if (resp) {
                let login = await actions.getLogin(email, password)
                if (login) {
                    navigate("/")
                }
            }
        }
        else {
            alert("Faltan datos");
        }
    }

    const paises = [
        "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda",
        "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice",
        "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana",
        "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde",
        "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre",
        "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil",
        "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto",
        "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia",
        "España", "Estados Unidos", "Estonia", "Esuatini", "Etiopía", "Filipinas",
        "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada",
        "Grecia", "Guatemala", "Guinea", "Guinea-Bisáu", "Guinea Ecuatorial", "Guyana",
        "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda",
        "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica",
        "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait",
        "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein",
        "Lituania", "Luxemburgo", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí",
        "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia",
        "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal",
        "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos",
        "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia",
        "Portugal", "Reino Unido", "República Centroafricana", "República Checa",
        "República del Congo", "República Democrática del Congo", "República Dominicana",
        "Ruanda", "Rumania", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino",
        "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal",
        "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka",
        "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam",
        "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga",
        "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania",
        "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen",
        "Yibuti", "Zambia", "Zimbabue"
    ];
    console.log(role)
    return (
        <div style={{ backgroundImage: 'url("https://img.freepik.com/vector-gratis/diseno-plantilla-papel-tapiz-medica-abstracta_53876-61809.jpg?semt=ais_hybrid")', backgroundSize: 'cover' }}>
            <div className="d-flex vh-100 flex-column justify-content-center align-items-center pb-5">
                <div className="mb-5">
                    <form className="container mb-5" onSubmit={handleSubmit}>
                        <div className="row g-3 pb-4 ps-3 pe-3" style={{ borderRadius: "15px", border: "3px solid white" }}>
                            <h1 className="d-flex justify-content-center mb-2"><i>SIGN UP</i></h1>
                            <div className="col-md-4">
                                <label htmlFor="inputEmail4" className="form-label">Email</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="form-control" id="inputEmail4" />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="inputPassword4" className="form-label">Password</label>
                                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="1234" className="form-control" id="inputPassword4" />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="role" className="form-label">Role</label>
                                <select id="role" defaultValue={""} onChange={(e) => setRole(e.target.value)} className="form-select">
                                    <option value={""} disabled>Your role</option>
                                    <option value={"PATIENT"}>Patient</option>
                                    <option value={"DOCTOR"}>Doctor</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="inputState" className="form-label">Country</label>
                                <select id="inputState" className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                                    <option selected disabled>Your country</option>
                                    {paises.map((item, index) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="inputAddress" className="form-label">First Name</label>
                                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="Diego Alejandro" className="form-control" id="inputAddress" />
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="inputAddress2" className="form-label">Last Name</label>
                                <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="form-control" id="inputAddress2" placeholder="Fontana Lasierra" />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="inputPassword5" className="form-label">City</label>
                                <input value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="Villa del Viento" className="form-control" id="inputPassword5" />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="inputPassword6" className="form-label">Age</label>
                                <input value={age} onChange={(e) => setAge(e.target.value)} type="number" placeholder="31" className="form-control" id="inputPassword6" />
                            </div>
                            {role === 'DOCTOR' && (
                                <>
                                    <div className="col-md-4">
                                        <label htmlFor="inputCity" className="form-label">Speciality</label>
                                        <input value={speciality} onChange={(e) => setSpeciality(e.target.value)} type="text" placeholder="Pediatry" className="form-control" id="inputCity" />
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="inputCity1" className="form-label"> Time_availability</label>
                                        <input value={timeAvailability} onChange={(e) => setTimeAvailability(e.target.value)} type="text" placeholder="8am - 5pm" className="form-control" id="inputCity1" />
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="inputCity2" className="form-label">Medical consultant price</label>
                                        <input value={medicalConsultantPrice} onChange={(e) => setMedicalConsultantPrice(e.target.value)} type="text" placeholder="100" className="form-control" id="inputCity2" />
                                    </div>
                                </>
                            )}
                            <div className="col-md-12 d-flex justify-content-center mt-4">
                                <button type="submit" className="btn btn-outline-success ps-5 pe-5">Sign up</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SingleSignup