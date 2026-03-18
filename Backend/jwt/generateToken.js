import jwt from "jsonwebtoken"
export const createTokenAndSaveCookie=(userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_TOKEN,{
        expiresIn:"10d"
    });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Enable secure in production (HTTPS)
        sameSite: "lax", // Lax is generally more compatible for same-site cross-modal/cross-origin needs
        path: '/',
        maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days in milliseconds
    })

};
//export default createTokenAndSaveCookie;