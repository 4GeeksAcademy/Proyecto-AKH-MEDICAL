import React, { useState, useContext, useEffect } from "react"
import { Context } from "../store/appContext";
import { Navigate, useNavigate } from "react-router-dom";

const CreateTestimony = () => {
    const { store, actions } = useContext(Context)
    const [testimony, setTestimony] = useState("")
    const [count, setCount] = useState(null)
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (testimony) {
            let data = {
                content: testimony,
                count: count
            }
            let resp = await actions.createTestimony(data)
            if (resp) {
                navigate("/")
            }
            else {
                alert("Faltan datos");
            }
        }
    }

    useEffect(() => {
        if (store.user == false) {
            navigate("/login")
        }
    }, [store.user])

    return (
        <div className="vh-100 d-flex justify-content-center text-center align-items-center mb-5" style={{ background: "linear-gradient(135deg, #f5f7fa 20%, #c3cfe2 50%)" }}>
            <div className="mb-5">
                <form onSubmit={handleSubmit} className="bg-white text-center mb-5 p-3" style={{ borderRadius: "15px", border: "3px solid green" }}>
                    <div className="d-flex flex-column justify-content-center text-center">
                        <h1 className="text-success pb-4"><b>PERSONAL TESTIMONY</b></h1>
                        <div className="col-12 mt-3">
                            <label htmlFor="exampleInputEmail1" className="form-label"><b>TESTIMONY</b></label>
                            <input value={testimony} onChange={(e) => setTestimony(e.target.value)} type="text" className="form-control my-2" name="Testimony" placeholder="Testimony" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="exampleInputEmail1" className="form-label"><b>CANTIDAD</b></label>
                            <input value={count} onChange={(e) => setCount(e.target.value)} type="number" className="form-control my-2" name="Testimony" placeholder="Testimony" required />
                        </div>

                        <button className="btn btn-outline-success mt-4 p-2" type="submit" role="button"><b>SEND TESTIMONY</b></button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default CreateTestimony;