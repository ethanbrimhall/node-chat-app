var socket = io();

//Called when user connects
socket.on('connect', function() {
    console.log('Connected to server'); 
    
});
//Called when user disconnects            
socket.on('disconnect', function() {
    console.log('Disconnected from server');
});
//Called when there is a new message from server
socket.on('newMessage', function(message){
    console.log('newMessage', message);
});

