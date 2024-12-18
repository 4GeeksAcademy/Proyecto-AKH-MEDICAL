const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            user: null,
            message: null,
            specialities: [],
            allDoctors: [],
            doctors: [],
            searchText: [],
            auth: false,
            appointments: [],
            selectedDoctor: null,
            selectedSpeciality: null,
            testimonials: [],
            token: localStorage.getItem("token")
        },
        actions: {
            fetchSchedule: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/appointments");
                    if (!response.ok) {
                        throw new Error('Error fetching appointments');
                    }
                    const data = await response.json();
                    setStore({ appointments: data });
                    return data;
                } catch (error) {
                    setErrorMessage('error en flux');
                }
            },
            addApoint: async (newAppointment) => {
                try {
                    const store = getStore();
                    
                    console.log(getCurrentUser())
                    let variables ={
                        patient_id: newAppointment.patient_id,
                        doctor_id: newAppointment.doctorId,
                        date: newAppointment.date   
                    }
                    console.log({patient_id})
                    const response = await fetch(process.env.BACKEND_URL + "/api/appointments", {
                        method: 'POST',
                        body: JSON.stringify(variables),
                        headers: {
                            "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token")
                        },
                    });

                    const contentType = response.headers.get("content-type");
                    if (!response.ok) {
                        if (contentType && contentType.includes("application/json")) {
                            const errorData = await response.json();
                            console.error("Error response data:", errorData);
                            throw new Error(errorData.message || 'Error adding appointment');
                        } else {
                            throw new Error('Unexpected error occurred.');
                        }
                    }

                    const data = await response.json();
                    setStore({ appointments: [...getStore().appointments, data] })
                    return data;
                } catch (error) {
                    console.log(error.message || 'Error adding appointment. Please try again.');
                    return null;
                }
            },

            validateAppoinment: (newAppointment) => {
                console.log({ newAppointment })
				const store = getStore();
				const doctor = store.doctors.find(doc => doc.id == newAppointment.doctorId)
				console.log({ doctor })
                
                if (!doctor) {
                    return "Doctor not found";
                }
                const [startTime, endTime] = doctor.time_availability.split('-').map(time => new Date('1970-01-01T${time.trim()}:00'));
                const appointmentTime = new Date(newAppointment.date);
                if (appointmentTime < startTime || appointmentTime > endTime) {
                    return "Appoinment time is outside the doctor's availability";
                }

                const conflictingAppoinment = store.appointments.find(app => {
                    const appTime = new Date(app.date);
                    return app.doctorID === newAppointment.doctorID && Math.abs(appTime - appointmentTime) < 30 * 60 * 1000;
                });
                if (conflictingAppoinment) {
                    return 'There is already an appoinment scheduled within 30 minutes of the requested time';
                }
                return null;
            },

            initiatePayment: async (appointmentId, doctorID) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/create-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ appointmentId, doctor_id: doctorID })
                    });

                    const result = await response.json();
                    if (result.approval_url) {
                        return { status: 'success', approval_url: result.approval_url, price: result.price };
                    } else {
                        throw new Error("Failed to create PayPal payment.");
                    }
                } catch (error) {
                    console.error("Error initiating payment: ", error);
                    return { status: "error", message: error.message };
                }
            },
            updateAppointmentStatus: async (appointmentId, status) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/appointments/${appointmentId}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status })
                    });
                    if (!response.ok) {
                        throw new Error('Error updating appointment status');
                    }
                    const updatedAppointments = getStore().appointments.map(app =>
                        app.id === appointmentId ? { ...app, status } : app);
                    setStore({ appointments: updatedAppointments });
                    return true;
                } catch (error) {
                    console.error('Error updating appointment status:', error);
                    return false;
                }
            },
            cancelAppoinment: async (appointmentId) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/appointments/${appointmentId}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) {
                        throw new Error("Error cancelling appoinment");
                    }

                    const updatedAppoinments = getStore().appointments.filter(app => app.id !== appointmentId);
                    setStore({ appointments: updatedAppoinments });
                    return true;
                } catch (error) {
                    console.error("Error cancelling appoinment: ", error);
                    return false;
                }
            },

            getLogin: async (email, password) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        console.log(data);

                        localStorage.setItem("token", data.access_token);
                        localStorage.setItem("role", data.user ? data.user.role : "DOCTOR");
                        localStorage.setItem("email", email);

                        setStore({ user: data.user || data.doctor, auth: true });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.log("Error loading message from backend", error);
                    return false;
                }
            },

            logOut: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/logout", {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        },
                    });

                    if (response.ok) {
                        const result = await response.json();
                        localStorage.removeItem("token");
                        localStorage.removeItem("email");  // Eliminar el email del almacenamiento local al cerrar sesión
                        localStorage.removeItem("role");  // Eliminar el rol del almacenamiento local al cerrar sesión
                        setStore({ user: false, auth: false });
                        return true;
                    } else {
                        console.log("Failed to logout user:", response.status);
                        return false;
                    }
                } catch (error) {
                    console.log("Error logout user:", error);
                    return false;
                }
            },

            getCurrentUser: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/current_user", {
                        method: "GET",
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        },
                    });

                    if (response.ok) {
                        const result = await response.json();
                        setStore({ user: result, auth: true });
                        return true;
                    } else {
                        console.log("Failed get current user:", response.status);
                        setStore({ user: false, auth: false });
                        return false;
                    }
                } catch (error) {
                    console.log("Error get current user:", error);
                    setStore({ user: false, auth: false });
                    return false;
                }
            },

            sign_up: async (data) => {
                console.log(data);
                try {
                    await fetch(process.env.BACKEND_URL + "/api/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                    return true;
                } catch (error) {
                    console.log("Error loading message from backend", error);
                    return false;
                }
            },

            createTestimony: async (data) => {
                console.log(data);
                const store = getStore();
                // try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/testimonial", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token")
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log("Testimony created:", result);
                        setStore({ testimonials: [...store.testimonials, result] });
                        return true;
                    } else {
                        console.log("Failed to create testimony:", response.status);
                        return false;
                    }
                // } catch (error) {
                //     console.log("Error creating testimony:", error);
                //     return false;
                // }
            },

            getTestimonials: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/testimonials");
                    const data = await resp.json();
                    if (resp.ok) {
                        setStore({ testimonials: data });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.log("Error loading message from backend", error);
                    setStore({ testimonials: [] });
                    return false;
                }
            },

            setSelectedSpeciality: (speciality) => {
                setStore({ selectedSpeciality: speciality });
            },

            getSpecialities: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/specialities", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        },
                    });
                    if (!response.ok) {
                        throw new Error("Failed to fetch specialities");
                    }
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setStore({ specialities: data });
                        return data;
                    } else {
                        throw new Error("No specialities found in the response");
                    }

                } catch (error) {
                    console.log("Error fetching specialities");
                    return [];
                }
            },

            getDoctorById: async (id) => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/doctors/${id}`);
                    if (!response.ok) {
                        throw new Error(`Doctor not found. Status: ${response.status}`);
                    }
                    const data = await response.json();
                    setStore({ selectedDoctor: data });
                } catch (error) {
                    console.log("Error fetching doctor details", error);
                    setStore({ selectedDoctor: null });
                }
            },

            getAllDoctors: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/doctors");

                    if (!response.ok) {
                        throw new Error("Error al obtener doctores");
                    }

                    const data = await response.json();

                    setStore({ allDoctors: data, doctors: data });
                    return data;
                } catch (error) {
                    console.error("Error en getAllDoctors:", error);
                }
            },

            getDoctorBySpeciality: async (speciality) => {
                try {
                    let url = `${process.env.BACKEND_URL}/api/doctors`;
                    if (speciality) {
                        url += `?speciality=${speciality}`;
                    }

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Failed to fetch doctors');
                    }

                    const data = await response.json();
                    setStore({ doctors: data });
                } catch (error) {
                    console.log("Error fetching doctors", error);
                }
            },

            searchDoctors: (searchText) => {
                const store = getStore();
                const filteredDoctors = store.allDoctors.filter(doctor => {
                    const fullName = `${doctor.info.first_name} ${doctor.info.last_name}`.toLowerCase();
                    return fullName.includes(searchText.toLowerCase());
                });

                setStore({
                    doctors: filteredDoctors,
                    searchText
                });
            },

            createMedicalHistory: async (medicalHistory) => {
                const store = getStore();
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/medical-history", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${store.token}`
                        },
                        body: JSON.stringify(medicalHistory)
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error al crear el historial médico");
                    }

                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error("Error creando historial médico:", error);
                    throw error;
                }
            }
        }
    };
};

export default getState;
