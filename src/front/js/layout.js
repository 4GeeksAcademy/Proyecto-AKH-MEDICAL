import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Doctors } from "./pages/doctors";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";
import { Schedule } from "./component/schedule";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { SingleLogin } from "./pages/Auth/singleLogin";
import SingleSignup from "./pages/Auth/singleSignup";


import DoctorDashboard from "./pages/DoctorDashboard";
import CreateMedicalHistory from "./pages/CreateMedicalHistory";
import ViewPatientHistories from "./pages/ViewPatientHistories";

//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Doctors />} path="" />
                        <Route element={<Schedule />} path="/appointment" />
                        <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" />
                        <Route element={<DoctorDashboard />} path="/doctor-dashboard" />
                        <Route element={<CreateMedicalHistory />} path="/create-medical-history" />
                        <Route element={<ViewPatientHistories />} path="/view-patient-histories" />
                        <Route element={<h1>Not found!</h1>} />
                        <Route element={<SingleLogin />} path="/login" />
                        <Route element={<SingleSignup />} path="/signup" />
                    </Routes>
                    {/* <Footer /> */}
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);