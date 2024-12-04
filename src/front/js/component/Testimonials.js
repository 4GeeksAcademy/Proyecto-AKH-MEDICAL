import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";

const Testimonials = () => {

    const { store, actions } = useContext(Context)

    useEffect(() => {
        actions.getTestimonials()
    }, [])


    return (
        <div id="testimonials" className="vh-100" style={{ background: "linear-gradient(135deg, #a7c7e7 20%, white 50%, #ffb3a7 90%)" }}>
            <div className="vh-100 d-flex justify-content-center align-items-center">
                <div className="row">
                    <h1 className="mb-4 text-success">TESTIMONIALS</h1>
                    {store.testimonials == null ? <h1>Cargando Testimonios...</h1> : store.testimonials == false ? <h1 className="text-danger"> Ocurrió un error al cargar testimonios</h1> : store.testimonials && store.testimonials.length > 0 && store.testimonials.map((testimonial) => (
                        <div className="col-md-4 d-flex justify-content-center" key={testimonial.id}>
                            <div className="card d-flex justify-content-center border-gray border-5" style={{ width: '16rem', height: "100%" }}>
                                <img
                                    src={testimonial.patient.img_url || "https://i.imgur.com/exc31k2.jpeg"}
                                    className="card-img-top"
                                    alt="Person"
                                    style={{ height: "140px", backgroundSize: "cover" }}
                                />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{testimonial.patient.first_name} {testimonial.patient.last_name}</h5>
                                    <p className="card-text text-justify" style={{ flexGrow: 1 }}>
                                        {testimonial.content}
                                    </p>
                                    <div className="card-footer d-flex justify-content-center">
                                        <i className="fa-solid fa-star" style={{ color: "gold" }}></i>
                                        <i className="fa-solid fa-star" style={{ color: "gold" }}></i>
                                        <i className="fa-solid fa-star" style={{ color: "gold" }}></i>
                                        <i className="fa-solid fa-star" style={{ color: "gold" }}></i>
                                        <i className="fa-solid fa-star" style={{ color: "gold" }}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div>
                        <button className="mt-4 btn btn-outline-success col-sm-2 border-3">
                            <Link className="text-success" to="/testimonials">
                                <b className="text-success">CREATE TESTIMONY</b>
                            </Link>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Testimonials;
