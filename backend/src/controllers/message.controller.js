import User from '../models/user.model.js';
import Message from '../models/message.model.js'
import cloudinary from '../lib/cloudinary.js';
import { getRecieverSocketId, io } from '../lib/socket.js';

export const getUsersForSidebar = async(req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId }}).select("-password");

        res.status(200).json(filteredUsers)
    }
    catch (err) {
        console.log("Error in getUsersFromSidebar ", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getMessages = async (req, res) => {
    try{
        const {id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                { senderId: myId, recieverId: userToChatId},
                { senderId: userToChatId, recieverId: myId},
            ]
        });

        res.status(200).json(messages)
    }
    catch (err) {
        console.log("Error in getMessages controller", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const sendMessage = async (req, res) => {
    try{
        const { text, image } = req.body;
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //REAL-TIME FUNCTIONALITY => socket.io
        const recieverSocketId = getRecieverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
        }
    catch (err) {
        console.log("Error in sendMessage controller", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}