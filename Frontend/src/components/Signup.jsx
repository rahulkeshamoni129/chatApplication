import React from 'react'
import { useForm } from "react-hook-form"
import axios from "axios";
import { useAuth } from '../context/Authprovider';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
function Signup() {
    const [authUser,setAuthUser]=useAuth();

    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  //watch the password and confirm password field
  const password=watch("password","");//if empty also there
  const confirmPassword=watch("confirmPassword","");

  const validePasswordMatch=(value)=>{
    return value===password || "Password does not match"
  }

  const onSubmit = async(data) =>{//storign teh value on submit button
    const userInfo={
        fullname:data.fullname,
        username:data.username,
        email:data.email,
        password:data.password,
        confirmPassword:data.confirmPassword
    }
    //now this userInfo need to be stored in the database
    await axios.post("/api/users/signup",userInfo)
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
        <form onSubmit={handleSubmit(onSubmit)} className='bg-base-100 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-3 w-full max-w-md border border-base-300 animate-in zoom-in-95 duration-500 mx-4 overflow-y-auto max-h-[95vh] no-scrollbar'>
          <div className="text-center mb-4">
              <h1 className='text-4xl font-black tracking-tighter'>
                  echo<span className='text-primary'>.</span>
              </h1>
              <p className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-[0.2em]">Create New Account</p>
          </div>

            <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Full Name</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-primary">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                    </svg>
                    <input type="text" className="grow font-medium text-sm" placeholder="John Doe" 
                    {...register("fullname", { required: true })}/>
                </label>
                {errors.fullname && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>Required</span>}
            </div>

            <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Username</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-12">
                    <span className="text-primary font-bold">@</span>
                    <input type="text" className="grow font-medium text-sm" placeholder="username" 
                    {...register("username", { required: true, pattern: /^[a-zA-Z0-9_]+$/ })}/>
                </label>
                {errors.username?.type === 'pattern' && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>Invalid Format</span>}
                {errors.username?.type === 'required' && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>Required</span>}
            </div>
            
            <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Email Address</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-primary">
                        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                    </svg>
                    <input type="email" className="grow font-medium text-sm" placeholder="your@email.com" 
                           {...register("email", { required: true })}/>
                </label>
                {errors.email && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>Required</span>}
            </div>

            <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Password</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-primary">
                        <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                    </svg>
                    <input type="password" className="grow font-medium text-sm" placeholder="••••••••" 
                           {...register("password", { required: true })}/>
                </label>
                {errors.password && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>Required</span>}
            </div>

            <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold opacity-60 text-[10px] uppercase tracking-widest">Confirm</span></label>
                <label className="input input-bordered flex items-center gap-3 bg-base-200 border-none rounded-2xl h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-primary">
                         <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                    </svg>
                    <input type="password" className="grow font-medium text-sm" placeholder="••••••••"    
                        {...register("confirmPassword", { required: true ,validate:validePasswordMatch})}/>
                </label>
                {errors.confirmPassword && <span className='text-error text-[10px] font-bold mt-1 ml-1 uppercase'>
                    {errors.confirmPassword.message}</span>}
            </div>

            <div className='flex flex-col gap-3 mt-4'>
                <button type='submit' className='btn btn-primary btn-block rounded-2xl h-12 font-black uppercase tracking-widest'>Create Account</button>
                <p className="text-center text-xs font-bold opacity-60">
                    Already have an account? 
                    <Link to='/login' className='text-primary underline cursor-pointer ml-1 hover:opacity-80'>Login</Link>
                </p>
            </div>
        </form>
    </div>
  )
}

export default Signup;