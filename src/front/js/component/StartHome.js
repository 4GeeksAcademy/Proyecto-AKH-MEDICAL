import React from "react";
import { Link } from "react-router-dom";
import Who from "./Who";
import Work from "./Work";
import Testimonials from "./Testimonials";
import '@fortawesome/fontawesome-free/css/all.min.css';


const StartHome = () => {
    return (
        <div className="vh-100" style={{ backgroundImage: 'url("https://www.shutterstock.com/image-illustration/medical-white-blue-cross-pattern-260nw-1919756624.jpg")', backgroundSize: 'cover' }}>
            <h1 className="pt-5" style={{ fontSize: "50px", color: "#4682B4" }}><i>AKH MEDICAL</i></h1>
            <h1 className="" style={{ fontSize: "50px", color: "#4682B4" }}><i>OPEN 24 HOURS</i></h1>
            <h5 className="pt-5" style={{ fontSize: "40px", color: "#4682B4" }}>
                <i className="fa-regular fa-hospital"></i> YOUR HEALTH IS OUR PRIORITY
                <a href="https://wa.me/573147450542" target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: "40px", color: "#25D366" }}></i>
                </a>
            </h5>
            <div className="container d-flex flex-row justify-content-center text-center">
                <div className="row"> .
                    <div className="col-sm-12 d-flex justify-content-center text-center" style={{ marginTop: "5%", fontSize: "17px" }}>
                        <Link to="/">
                            <button style={{ borderRadius: "14px", border: "3px solid #6F4F28", paddingLeft: "30px", paddingRight: "30px", paddingTop: "24px", paddingBottom: "24px", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="tooltip-btn me-3 design">PAYMENTS</button>
                        </Link>
                        <Link to="/doctors">
                            <button style={{ borderRadius: "14px", border: "3px solid #6F4F28", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="tooltip-btn p-4 me-3 design">SPECIALISTS</button>
                        </Link>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 mt-3 d-flex justify-content-center text-center" style={{ fontSize: "17px" }}>
                            <Link to="/">
                                <button style={{ borderRadius: "14px", border: "3px solid #6F4F28", backgroundColor: "#fffff0", color: "#4A8F8F" }} className="tooltip-btn p-4 design">MEDICAL HISTORY</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Who />
                <Work />
                <Testimonials />
            </div>
        </div>
    )
}
export default StartHome