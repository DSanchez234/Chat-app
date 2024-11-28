import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

//get the socket id of the message reciever
export function getRecieverSocketId(userId) {
    return userSocketMap[userId];
}

//used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId; //get userId from query
    if(userId) userSocketMap[userId] = socket.id; //store the userId and socketId in the userSocketMap
    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    });
})

export { io, app, server};