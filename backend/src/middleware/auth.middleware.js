import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt

        if(!token){
            return res.status(401).json({ message: "Unauthorized - NO TOKEN PROVIDED"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({ message: "TOKEN PROVIDED IS INVALID"})
        }

        const user = await User.findById(decoded. userId).select("-password");

        if(!user){
            return res.status(404).json({ message: "USER NOT FOUND"})
        }

        req.user = user;

        next()
    }
    catch (err){
        console.log("Error in middleware", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}