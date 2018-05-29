const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

//When a new connection is made from client
io.on('connection', (socket) => {
    //Prints this in server console
    console.log('New User Connected');
    
    //Only to the user connected as a welcome message
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room'));
    
    //To everyone except the new user as a 'this user joined the chat room'
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user has joined the chat room'));
    
    //Called when user sends a new message
    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        //Sends the new message to every user
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    });
    
    //Called when the coords of user is recieved
    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('user', coords.latitude, coords.longitude));
    });
    
    //When the user disconnects from the server
    socket.on('disconnect', () => {
       console.log('User was Disconnected');       
    });
    
});

//The server listens on port 3000
server.listen(3000, () => {
    console.log("Server started on port 3000");
});