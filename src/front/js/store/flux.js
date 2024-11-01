// const getState = ({ getStore, getActions, setStore }) => {
// 	return {
// 		store: {
// 			message: null,
// 			demo: [
// 				{
// 					title: "FIRST",
// 					background: "white",
// 					initial: "white"
// 				},
// 				{
// 					title: "SECOND",
// 					background: "white",
// 					initial: "white"
// 				}
// 			]
// 		},
// 		actions: {
// 			// Use getActions to call a function within a fuction
// 			exampleFunction: () => {
// 				getActions().changeColor(0, "green");
// 			},

// 			getMessage: async () => {
// 				try{
// 					// fetching data from the backend
// 					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
// 					const data = await resp.json()
// 					setStore({ message: data.message })
// 					// don't forget to return something, that is how the async resolves
// 					return data;
// 				}catch(error){
// 					console.log("Error loading message from backend", error)
// 				}
// 			},
// 			changeColor: (index, color) => {
// 				//get the store
// 				const store = getStore();

// 				//we have to loop the entire demo array to look for the respective index
// 				//and change its color
// 				const demo = store.demo.map((elm, i) => {
// 					if (i === index) elm.background = color;
// 					return elm;
// 				});

// 				//reset the global store
// 				setStore({ demo: demo });
// 			}
// 		}
// 	};
// };

// export default getState;

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
					const data = await resp.json()
					console.log(data)
					localStorage.setItem("token", data.token)
					setStore({ user: data.user, auth: true })
					// setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return true;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},
			log_out: () => {
				localStorage.removeItem("token")
				setStore({ auth: false })
			},

			sign_up: async (email, password) => {
				try {
					// fetching data from the backend
					await fetch(process.env.BACKEND_URL + "api/signup", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: email,
							password: password
						})
					})
					return true;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

		}
	};
};

export default getState;