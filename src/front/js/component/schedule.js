import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../store/appContext';

export const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const { store, actions } = useContext(Context);
    const [doctorID, setDoctorId] = useState('');
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
        const newAppointment = { 
            userId: store.user.id,
            doctorID,
            date
         };
         
        const validationError = actions.validateAppoinment(newAppointment);
        if (validationError){
            setErrorMessage(validationError);
            return;
        }

        const data = await actions.addApoint(newAppointment);
        if (data) {
            setAppointments([...appointments, data]);
            fetchAppointments();
        }


        setDoctorId('');
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
                        <select
                        value={doctorID}
                        onChange={(e) => setDoctorId(e.target.value)}
                        required
                        >
                            <option value="">Select Doctor</option>
                            {store.doctors.map(doctor => (
                                <option key ={doctor.id} value={doctor.id}>
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
                    <h6>Appointments</h6>
                    <ul>
                        {appointments.map((appointment, index) => (
                            <li key={index}>
                                {appointment.doctor.info.first_name} {appointment.doctor.info.last_name} - {appointment.patient.first_name} {appointment.patient.last_name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};