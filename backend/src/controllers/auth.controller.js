import User from '../models/user.model.js'
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) => {
    
    const { fullName, email, password } = req.body;

    try{

        if(!fullName || !email || !password) {
            return res.status(400).json({ message: "All Fields are required"})
        }
        if (password.length < 6){
            
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({ message: "Email already exists"});

        // hash passwords
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
            })

        if(newUser) {
            // generate JWT (json web token)
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id, 
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "invalid User data" });
        }
    } 
    catch (err) {
        console.log("Error in signup controller", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}



export const login = async (req,res) => {
    const { email, password } = req.body;

    try{
        const user = await User.findOne({email})

        if (!user){
            return res.status(400).json({ message: "Credentials are wrong"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Credentials are wrong"});
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    }
    catch (err){
        console.log("Error in login controller", err.message)
        res.status(500).json({ message: "Internal Server Error" });
    }
}



export const logout = (req,res) => {
    try{
        res.cookie("jwt", "", {maxAge:0})
        return res.status(200).json({ message: "Logged out successfully"});
    }catch{ 
        console.log("Error in logout controller", err.message)
        res.status(500).json({ message: "Internal Server Error" });
    }
}



export const updateProfile = async (req, res) => {
    try{
        const { profilePic } = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({ message: "Profile pic is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { profilePic:uploadResponse.secure_url }, 
            { new:true }
        );

        res.status(200).json(updatedUser)
    }
    catch (err){
        console.log("Error in update controller ", err)
        res.status(500).json({ message: "Internal Server Error" });
    }
}



export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user);
    }
    catch (err){
        console.log("Error in checkAuth controller ", err.message)
        res.status(500).json({ message: "Internal Server Error" });
    }
}
