const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

//When a new connection is made from client
io.on('connection', (socket) => {
    //Prints this in server console
    console.log('New User Connected');
    
    //Puts a user into a room they specified on the index.html page
    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room names are required!');
        }
        
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        //Only to the user connected as a welcome message
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room'));
    
        //To everyone except the new user as a 'this user joined the chat room'
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined the chat room`));
        
        callback();
    });
    
    //Called when user sends a new message
    socket.on('createMessage', (message, callback) => {
        //Sends the new message to every user
        var user = users.getUser(socket.id);
        if(user && isRealString(message.text)){
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        
        callback();
    });
    
    //Called when the coords of user is recieved
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
        });
    
    //When the user disconnects from the server
    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat room`));
        }
    });
    
});

//The server listens on port 3000
server.listen(3000, () => {
    console.log("Server started on port 3000");
});