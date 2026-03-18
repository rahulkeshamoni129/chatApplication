import jwt from "jsonwebtoken"
export const createTokenAndSaveCookie=(userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_TOKEN,{
        expiresIn:"10d"
    });
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Enable secure in production (HTTPS)
        sameSite: "lax", // Lax is generally more compatible for same-site cross-modal/cross-origin needs
        path: '/'
    })

};
//export default createTokenAndSaveCookie;