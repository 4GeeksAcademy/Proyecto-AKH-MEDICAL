import CreateTestimony from "../pages/CreateTestimony";

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
			testimonials: null
		},
		actions: {
			// Use getActions to call a function within a fuction

			fetchSchedule: async () => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/appointments",);
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
					const response = await fetch(process.env.BACKEND_URL + "/api/appointments", {
						method: 'POST',
						body: JSON.stringify(newAppointment),
						headers: {
							"Content-Type": "application/json"
						},
					});

					const contentType = response.headers.get("content-type");
					if (!response.ok) {
						if (contentType && contentType.includes("application/json")) {
							const errorData = await response.json();
							throw new Error(errorData.message || 'Error adding appointment');
						} else {
							throw new Error('Unexpected error occurred.');
						}
					}

					if (contentType && contentType.includes("application/json")) {
						const addedAppointment = await response.json();
						return addedAppointment;
					} else {
						throw new Error('Unexpected content type.');
					}
				} catch (error) {
					console.log(error.message || 'Error adding appointment. Please try again.');
				}
			},

			getLogin: async (email, password) => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: email,
							password: password
						})
					})
					if (resp.ok) {
						const data = await resp.json()
						console.log(data)
						localStorage.setItem("token", data.access_token)
						setStore({ user: data.user, auth: true })
						return true;
					}
					return false
				} catch (error) {
					console.log("Error loading message from backend", error)
					return false
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
						localStorage.removeItem("token")
						setStore({ user: false, auth: false })
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
				console.log(data)
				try {
					// fetching data from the backend
					await fetch(process.env.BACKEND_URL + "/api/register", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(data)
					})
					return true;
				} catch (error) {
					console.log("Error loading message from backend", error)
					return false;
				}
			},

			createTestimony: async (data) => {
				console.log(data)
				const store = getStore()
				try {
					// Enviando datos al backend
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
						setStore({ testimonials: [...store.testimonials, result] })
						return true;
					} else {
						console.log("Failed to create testimony:", response.status);
						return false;
					}
				} catch (error) {
					console.log("Error creating testimony:", error);
					return false;
				}
			},

			getTestimonials: async () => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/testimonials")
					const data = await resp.json()
					if (resp.ok) {
						setStore({ testimonials: data })
						return true
					}
					setStore({ testimonials: false })
					return false;
				} catch (error) {
					console.log("Error loading message from backend", error)
					setStore({ testimonials: false })
					return false
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
					})
					if (!response.ok) {
						throw new Error("Failed to fetch specialities");
					}
					const data = await response.json()
					if (Array.isArray(data) && data.length > 0) {
						setStore({ specialities: data });
						return data
					} else {
						throw new Error("No specialities found in the response")
					}

				} catch (error) {
					console.log("Error fetching specialities")
					return [];
				}
			},

			getDoctorById: async (id) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/doctors/${id}`);
					if (!response.ok) {
						throw Error("Doctor not found. Status: ${response.status}`")
					}
					const data = await response.json();
					setStore({ selectedDoctor: data });
				} catch (error) {
					console.log("Error fetching doctor details", error)
					setStore({ selectedDoctor: null })
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
			}
		}
	};
};


export default getState;
