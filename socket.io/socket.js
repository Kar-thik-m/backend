// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // Enable CORS if needed

const users = []; // Array to hold connected users

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle the 'addUser' event
    socket.on('addUser', (userId) => {
        // Check if user already exists
        if (!users.some(user => user.id === userId)) {
            // Add new user with their socket ID
            users.push({ id: userId, socketId: socket.id });
        }
        // Emit the updated list of users to all clients
        io.emit('getUsers', users);
    });

    // Handle the 'disconnect' event
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Remove the user from the array when they disconnect
        users.forEach((user, index) => {
            if (user.socketId === socket.id) {
                users.splice(index, 1);
            }
        });
        // Emit the updated list of users to all clients
        io.emit('getUsers', users);
    });

    // Handle incoming messages (example)
    socket.on('sendMessage', (message) => {
        io.emit('message', message); // Broadcast the message to all clients
    });
});



export { app, io, server };
