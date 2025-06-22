import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createTokenAndSaveCookie } from "../jwt/generateToken.js";
export const signup=async( req,res)=>{
    const {fullname,email,password,confirmPassword}=req.body;
    try {
        if(password!=confirmPassword){
        return res.status(400).json({error:"Password does not match"});//status 400 is for invalid data
    }
    //finding a user if already exists with email
    const user=await User.findOne({email})
    if(user){
        return res.status(400).json({error:"User already exists",user});
    }
    //hashing the password and saving
        const hashPassword=await bcrypt.hash(password,10);
        //if user not exists then create a new user
        const newUser=await new User({
            fullname,
            email,
            password:hashPassword
        });
        await newUser.save();//saving the user
        if(newUser){
            createTokenAndSaveCookie(newUser._id,res);
            res.status(201).json({message:"User created Succesfully",
                user: {
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email
            }}
            )
            
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal server error"});
    }
};
export const login=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email});
        const isMatch=await bcrypt.compare(password,user.password);//matching database password with the gvien password
        if(!user || !isMatch){
            return res.status(400).json({error:"Invalid credential"});
        }
        //if user found generate a token so that user can acces the website
        createTokenAndSaveCookie(user._id,res);
        res.status(201).json({message:"User Logged in Succesfully",user:{
            _id:user._id,
            fullname:user.fullname,
            email:user.email
        }});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal server error"});
        
    }
}

//so for logout the token which we are generating and saving in cookies should be clearled

export const logout=async(req,res)=>{
    try {
        res.clearCookie("jwt");
        res.status(201).json({message:"User Logged out Succesfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Internal server error"});
        
    }
}
 
export const allUsers=async (req,res)=>{
    try {
        const loggedInUser=req.user._id;

        const filteredusers=await User.find({_id:{$ne:loggedInUser}}).select("-password");//fetching the users from database
        res.status(201).json(
            filteredusers
        );
    } catch (error) {
        console.log("Error in all users controller"+error);
        res.status(500).json({ error: "Internal server error" });
    }
}