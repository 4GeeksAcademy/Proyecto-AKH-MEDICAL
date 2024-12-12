import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Doctors } from "./pages/doctors";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import { DoctorProfile } from "./component/doctorProfile";
import { Schedule } from "./component/schedule";
import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { SingleLogin } from "./pages/Auth/singleLogin";
import SingleSignup from "./pages/Auth/singleSignup";
import StartHome from "./component/StartHome";
import { Home } from "./pages/Home";
import CreateTestimony from "./pages/CreateTestimony";
import Testimonials from "./component/Testimonials";


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
                        <Route element={<Doctors />} path="/doctors" />
                        <Route element={<DoctorProfile />} path="/doctors/:id" />
                        <Route element={<Schedule />} path="/appointment" />
                        <Route element={<Demo />} path="/demo" />
                        <Route element={<Single />} path="/single/:theid" />
                        <Route element={<h1>Not found!</h1>} />
                        <Route element={<SingleLogin />} path="/login" />
                        <Route element={<SingleSignup />} path="/signup" />
                        <Route element={<CreateTestimony />} path="/testimonials" />
                        <Route element={<Home />} path="/" />
                    </Routes>
                    {/* <Footer /> */}
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
