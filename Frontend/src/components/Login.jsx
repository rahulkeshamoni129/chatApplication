import React from 'react'
import { useForm } from "react-hook-form"
import axios from "axios";
//import React from 'react';
import { useAuth } from '../context/Authprovider';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
function Login() {
  const [authUser,setAuthUser]=useAuth();
    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

    const onSubmit = (data) =>{//storign teh value on submit button
    const userInfo={
        email:data.email,
        password:data.password,
    }
    //now this userInfo need to be stored in the database
    axios.post("/api/users/login",userInfo)
    .then((response)=>{
        console.log(response.data);
        if(response.data)
        toast.success("Signup succesful")
    //now we have to use this details in other routes also we will store it in local storage
        localStorage.setItem("chatApp",JSON.stringify( response.data));
        setAuthUser(response.data)
    })
    .catch((error)=>{
        if(error.response)
        toast.error("Error: "+error.response.data.error)
    });
  };
  return (
     <div className='flex h-screen items-center justify-center bg-black'>
        <form onSubmit={handleSubmit(onSubmit)} className='border border-white px-6 py-2 rounded-md space-y-3 w-96'>
          <h1 className='text-2xl text-center text-white'>
            Chat <span className='text-green-500 font-semibold'>App</span>
        </h1>
        <h2 className='text-xl text-white font-bold'>Login</h2>
        <br/>
            {/*Email*/}
            <label className="input input-bordered flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path
                d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input type="text" className="grow" placeholder="Email" 
            {...register("email", { required: true })}/>
            </label>
             {errors.email && <span className='text-red-500 text-sm font-semibold' >This field is required</span>}
            {/*Password*/}
            <label className="input input-bordered flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                fillRule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clipRule="evenodd" />
            </svg>
            <input type="password" className="grow" placeholder="password" {...register("password", { required: true })} />
            </label>
            {errors.password && <span className='text-red-500 text-sm font-semibold'>This field is required</span>}

            {/**Text & button */}
            <div className='flex text-white justify-between' >
                <p>New user? 
                    <Link to='/signup' className='text-blue-500 underline cursor-pointer ml-2'>Signup</Link>
                </p>
                <input type='submit' value='Login' className='text-white bg-green-500 px-4 py-2 rounded-lg cursor-pointer'></input>
            </div>
        </form>
    </div>
  )
}

export default Login;