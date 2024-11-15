
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			user: {},
			auth: false
		},
		actions: {
			// Use getActions to call a function within a fuction


			getLogin: async (email, password) => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "api/login", {
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
					// setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
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
				try {
					// fetching data from the backend
					await fetch(process.env.BACKEND_URL + "api/register", {
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
		}
	};
};

export default getState;
