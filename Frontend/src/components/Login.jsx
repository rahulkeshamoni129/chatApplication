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
      <div className='flex h-screen items-center justify-center bg-base-200 transition-colors duration-500'>
         <form onSubmit={handleSubmit(onSubmit)} className='bg-base-100 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-4 w-full max-w-md border border-base-300 animate-in zoom-in-95 duration-500 mx-4'>
            <div className="text-center mb-6">
                <h1 className='text-4xl font-black tracking-tighter'>
                    echo<span className='text-primary'>.</span>
                </h1>
                <p className="text-xs font-bold opacity-30 mt-1 uppercase tracking-widest">Welcome Back</p>
            </div>
          
          <h2 className='text-lg font-black uppercase tracking-tight opacity-70'>Account Login</h2>
          
            {/*Email*/}
            <div className="form-control">
                <label className="label"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Email Address</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-14 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5 text-primary">
                        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                    </svg>
                    <input type="text" className="grow font-medium" placeholder="your@email.com" 
                    {...register("email", { required: true })}/>
                </label>
                {errors.email && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase' >Required</span>}
            </div>

            {/*Password*/}
            <div className="form-control">
                <label className="label"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Password</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-14 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5 text-primary">
                        <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                    </svg>
                    <input type="password" className="grow font-medium" placeholder="••••••••" {...register("password", { required: true })} />
                </label>
                {errors.password && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>Required</span>}
            </div>

            {/**Text & button */}
            <div className='flex flex-col gap-4 mt-6'>
                <button type='submit' className='btn btn-primary btn-lg rounded-2xl h-16 shadow-xl shadow-primary/20 font-black uppercase tracking-widest'>Login</button>
                <p className="text-center text-xs font-bold opacity-60">
                    New to the app? 
                    <Link to='/signup' className='text-primary underline cursor-pointer ml-1 hover:opacity-80'>Create Account</Link>
                </p>
            </div>
        </form>
    </div>
  )
}

export default Login;