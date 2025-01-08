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
            token: localStorage.getItem("token"),
            doctorEmail: "",
            patients: [],
            medicalHistories: [],
            doctorEmails: []
        },
        actions: {
            createAppointment: async (appointmentData) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/appointments`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(appointmentData),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || "Error scheduling appointment");
                    }
                    const appointment = await response.json();
                    return appointment;
                } catch (err) {
                    console.error("Error creating appointment:", err);
                    throw err;
                }
            },
            cancelAppoinment: async (appointmentId) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/appointments/${appointmentId}`, { mode: 'no-cors' }, {
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
						setStore({ user: result, auth: true })
						return true;
					} else {
						console.log("Failed get current user:", response.status);
						setStore({ user: false, auth: false })
						return false;
					}
				} catch (error) {
					console.log("Error get current user:", error);
					setStore({ user: false, auth: false })
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

            fetchDoctorEmail: () => {
                try {
                    const email = localStorage.getItem('email');
                    if (email) {
                        setStore({ doctorEmail: email });
                    } else {
                        console.error("No doctor email found in localStorage");
                    }
                } catch (error) {
                    console.error("Error accessing localStorage:", error);
                }
            },

            fetchPatients: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/patients", {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error("Unauthorized access - token may be invalid or expired");
                        }
                        throw new Error("Failed to fetch patients");
                    }

                    const data = await response.json();

                    if (Array.isArray(data)) {
                        setStore({ patients: data });
                    } else {
                        throw new Error("Received invalid JSON data");
                    }
                } catch (error) {
                    console.error("Error fetching patients:", error);
                }
            },

            fetchPatientsForLoggedInDoctor: async () => {
                const store = getStore();
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/medical-history/doctor/users", {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching patients");
                    }
            
                    const data = await response.json();
                    setStore({ patients: data });
                    return data;
                } catch (error) {
                    console.error("Error fetching patients:", error);
                    throw error;
                }
            },            

            fetchDoctorEmailsForLoggedInUser: async () => { 
                const store = getStore();
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/doctor-emails", {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching doctor emails");
                    }

                    const data = await response.json();
                    const emails = data.map(history => history.doctor_email);
                    const uniqueEmails = [...new Set(emails)]; // Eliminar duplicados
                    setStore({ doctorEmails: uniqueEmails });
                    return uniqueEmails;
                } catch (error) {
                    console.error("Error fetching doctor emails:", error);
                    throw error;
                }
            },

            fetchMedicalHistoriesForPatient: async (patientId) => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/medical-history/${patientId}`, {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching medical histories");
                    }
            
                    const data = await response.json();
                    setStore({ medicalHistories: data });
                    return data;
                } catch (error) {
                    console.error("Error fetching medical histories:", error);
                    throw error;
                }
            },
            
            fetchMedicalHistoriesForLoggedInDoctor: async () => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/medical-history/doctor`, {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching medical histories");
                    }
            
                    const data = await response.json();
                    setStore({ medicalHistories: data });
                    return data;
                } catch (error) {
                    console.error("Error fetching medical histories:", error);
                    throw error;
                }
            },            

            fetchMedicalHistoriesForDoctorAndPatient: async (patientId) => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/medical-history/doctor/patient/${patientId}`, {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching medical histories");
                    }
            
                    const data = await response.json();
                    setStore({ medicalHistories: data });
                    return data;
                } catch (error) {
                    console.error("Error fetching medical histories:", error);
                    throw error;
                }
            },
            
            createMedicalHistory: async (medicalHistory) => {
                const store = getStore();
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        throw new Error("No token found");
                    }

                    const response = await fetch(process.env.BACKEND_URL + "/api/medical-history", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
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
            },

            fetchDoctorsForLoggedInPatient: async () => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/doctors-for-patient`, {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching doctors");
                    }
            
                    const data = await response.json();
                    setStore({ doctors: data });
                    return data;
                } catch (error) {
                    console.error("Error fetching doctors:", error);
                    throw error;
                }
            },
            
            fetchMedicalHistoriesWithDoctor: async (doctorId) => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/medical-histories/doctor/${doctorId}`, {
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.Msg || "Error fetching medical histories");
                    }
            
                    const data = await response.json();
                    setStore({ medicalHistories: data });
                    return data;
                } catch (error) {
                    console.error("Error fetching medical histories:", error);
                    throw error;
                }
            },
            
            updateProfilePicture: async (formData) => { 
                try { 
                    const store = getStore(); 
                    const response = await fetch(process.env.BACKEND_URL +"/api/profilepic", { 
                        method: 'POST', 
                        body: formData, 
                        headers: { "Authorization": "Bearer " + store.token 
                        } 
                    }); 
                    if (!response.ok) { 
                        const errorData = await response.json(); 
                        throw new Error(errorData.message || 'Error updating profile picture'); 
                    } 
                    const data = await response.json(); 
                    setStore({ user: { ...store.user, img_url: data.url } }); 
                    return data; 
                } catch (error) { 
                    console.error('Error updating profile picture:', error); 
                    return null;
                }
            }
        }
    };
};

export default getState;
