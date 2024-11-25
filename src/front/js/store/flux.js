
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			specialities: [],
			allDoctors: [],
			doctors: [],
			auth: false,
			appointments: [],
			selectedSpeciality: null,
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
					if (resp.status == 400) {
						return false
					}
					const data = await resp.json()
					console.log(data)
					localStorage.setItem("token", data.access_token)
					setStore({ user: data.user, auth: true })

					return true;
				} catch (error) {
					console.log("Error loading message from backend", error)
					return false
				}
			},
			log_out: () => {
				localStorage.removeItem("token")
				setStore({ auth: false })
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

			setSelectedSpeciality: (speciality) => {
				console.log("Updating selected speciality:", speciality);
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

			getAllDoctors: async () => {
				const store = getStore();
				console.log("Llamando a getAllDoctors");
				if (store.allDoctors.length > 0) {
					console.log("Evita llamada innecesaria: ya hay doctores en el estado")
					return;
				}
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/doctors")
					if (!response.ok) {
						throw new Error("Failed to get all doctors");
					}
					const data = await response.json()
					setStore({ allDoctors: data });
					return data;
				} catch (error) {
					console.log("Error fetching all doctors", error)
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
			}
		}
	};
};

export default getState;
