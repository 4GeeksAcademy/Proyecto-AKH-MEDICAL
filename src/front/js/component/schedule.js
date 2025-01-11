import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../store/appContext';

export const Schedule = () => {
    const { store, actions } = useContext(Context);
    const [doctor_id, setDoctorId] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://sandbox.paypal.com/sdk/js?client-id=Afc8qlthkmv24JpZbwp2cCELxTbk4Kv5fGIeZk9KBwZKkdTut_7wSJ6LV4MQ9PzSNV_XS_0qTghi0SYZ&components=buttons";
        script.async = true;
        script.onload = () => {
            window.paypal.Buttons().render('#paypal-button-container');
        };
        document.body.appendChild(script);
        document.addEventListener('DOMContentLoaded', (event) => {
            const element = document.querySelector('.some-class');
            if (element) {
                element.classList.add('new-class');
            } else {
                console.error('Element with class "some-class" not found');
            }
        });
        return () => {
            document.body.removeChild(script);
        }

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Crear cita y obtener la URL de PayPal
            const response = await actions.createAppointment({ doctor_id, date });
            if (response.approval_url) {
                // Redirigir a PayPal
                window.location.href = response.approval_url;
            }
        } catch (err) {
            setError("Error scheduling appointment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Schedule an Appointment</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="doctor" className="form-label">Select Doctor</label>
                    <select
                        id="doctor"
                        className="form-control"
                        value={doctor_id}
                        onChange={(e) => setDoctorId(e.target.value)}
                        required
                    >
                        <option value="">-- Select a Doctor --</option>
                        {store.doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.info.first_name} {doctor.info.last_name} - {doctor.speciality}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="date" className="form-label">Select Date and Time</label>
                    <input
                        type="datetime-local"
                        id="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Scheduling..." : "Schedule Appointment"}
                </button>
            </form>
        </div>
    );
};
