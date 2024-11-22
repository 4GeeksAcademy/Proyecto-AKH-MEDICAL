import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../store/appContext';

export const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const { store, actions } = useContext(Context);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const data = await actions.fetchSchedule();
        if (data) {
            setAppointments(data);
        };
    }
    const addAppointment = async (e) => {
        e.preventDefault();
        const newAppointment = { name, date };
        const data = await actions.addApoint(newAppointment);
        if (data) {
            setAppointments([...appointments, data]);
            fetchAppointments();
        }


        setName('');
        setDate('');
        fetchAppointments();
        setErrorMessage(''); // Clear any previous error message
    };


    return (
        <div className="container">
            <div className='row'>
                <div className='col-md-4'>
                    <h5>Appointment Scheduler</h5>
                    <form onSubmit={addAppointment}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                        <button type="submit">Add Appointment</button>
                    </form>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <h6>Appointments</h6>
                    <ul>
                        {appointments.map((appointment, index) => (
                            <li key={index}>
                                {appointment.name} - {new Date(appointment.date).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};