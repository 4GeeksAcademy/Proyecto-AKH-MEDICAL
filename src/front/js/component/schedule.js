import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../store/appContext';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Navigate, useNavigate } from "react-router-dom";

export const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const { store, actions } = useContext(Context);
    const [doctorId, setDoctorId] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPayPalButton, setShowPayPalButton] = useState(false);
    const [appointmentId, setAppointmentId] = useState(null);
    const [price, setPrice] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const data = await actions.fetchSchedule();
        if (data) {
            setAppointments(data);
        }
        console.log('Doctors:', store.doctors);
    };

    useEffect(() => {
        actions.addApoint();
    }, []);
    const addAppointment = async (e) => {
        e.preventDefault();
        if (!store.user || !store.user.id){
            setErrorMessage("User not authenticated");
            return;
        }

        const newAppointment = {
            //patient_id: store.user.id,
            doctorId: parseInt(doctorId),
            date
        };

        const validationError = actions.validateAppoinment(newAppointment);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        const data = await actions.addApoint(newAppointment);
        if (data) {
            setAppointments([...appointments, data]);
            const paymentResult = 
            await actions.initiatePayment(data.id, doctorId);
            if (paymentResult.status === 'success') {
                setShowPayPalButton(true);
                setAppointmentId(data.id);
                setPrice(paymentResult.price);
                console.log('Redirecting to:', paymentResult.approval_url);  
                window.location.href = paymentResult.approval_url
                startTimer(data.id);
            } else {
                setErrorMessage(paymentResult.message);
            }
        }

        setDoctorId('');
        setDate('');
        setErrorMessage('');
    };

    const startTimer = (appointmentId) => {
        setTimeout(() => {
            actions.cancelAppoinment(appointmentId);
            setErrorMessage("Payment time expired. Appointment was cancelled.");
        }, 15 * 60 * 1000);
    };

    return (
        <div className="container">
            <div className='row'>
                <div className='col-md-4'>
                    <h5>Appointment Scheduler</h5>
                    <form onSubmit={addAppointment}>
                        <select
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                            required
                        >
                            <option value="">Select Doctor</option>
                            {store.doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.info.first_name} {doctor.info.last_name} - {doctor.speciality}
                                </option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                        <button type="submit">Add Appointment</button>
                    </form>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    {showPayPalButton && price && (
                        <PayPalScriptProvider options={{ "client-id": "Afc8qlthkmv24JpZbwp2cCELxTbk4Kv5fGIeZk9KBwZKkdTut_7wSJ6LV4MQ9PzSNV_XS_0qTghi0SYZ" }}>
                            <PayPalButtons 
                                style={{ layout: "vertical" }} 
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: [{
                                            amount: {
                                                value: price
                                            }
                                        }]
                                    });
                                }}
                                onApprove={(data, actions) => {
                                    return actions.order.capture().then(function(details) {
                                        alert("Transaction completed by " + details.payer.name.given_name);
                                        // Actualiza el estado de la cita a "pagada"
                                        actions.updateAppointmentStatus(appointmentId, 'paid');
                                    });
                                }}
                            />
                        </PayPalScriptProvider>
                    )}
                    <h6>Appointments</h6>
                    <ul>
                        {appointments.map((appointment, index) => (
                            <li key={index}>
                                {appointment.doctor.info.first_name} {appointment.doctor.info.last_name} - {appointment.patient.first_name} {appointment.patient.last_name} - {new Date(appointment.date).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
