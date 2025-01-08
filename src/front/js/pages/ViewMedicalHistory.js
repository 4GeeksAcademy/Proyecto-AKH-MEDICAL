import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/ViewMedicalHistory.css";

const ViewMedicalHistory = () => {
    const { store, actions } = useContext(Context);
    const [doctorEmails, setDoctorEmails] = useState([]);

    useEffect(() => {
        actions.fetchDoctorEmailsForLoggedInUser().then(emails => {
            setDoctorEmails(emails);
        });
    }, [actions]);

    return (
        <div className="medical-history-view-container">
            <h1 className="medical-history-view-title">My Doctors</h1>
            {doctorEmails.length === 0 ? (
                <p>No doctors found.</p>
            ) : (
                <ul className="doctor-email-list">
                    {doctorEmails.map((email, index) => (
                        <li key={index} className="doctor-email-item">
                            <button 
                                onClick={() => console.log(`Redirect to details for doctor: ${email}`)} 
                                className="doctor-email-btn"
                            >
                                {email}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewMedicalHistory;
