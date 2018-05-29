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
    var li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);
    
    jQuery('#messages').append(li);
});

//Gets location from server and prints out url to user
socket.on('newLocationMessage', function(message){
    var li = jQuery('<li></li');
    var a = jQuery("<a target='_blank'>My Current Location</a>");
    
    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);
    
    jQuery('#messages').append(li);
});

//When the send button is clicked
jQuery('#message-form').on('submit', function(e){
    e.preventDefault();
    
    //sends message to server
    socket.emit('createMessage', {
        from: 'user',
        text: jQuery('[name=message]').val()
    }, function(data){
        
    });
});

//Gets location of user and sends it to server
var locationButton = jQuery('#send-location');
locationButton.on('click', function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser!');
    }
    
    navigator.geolocation.getCurrentPosition(function(position){
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function(){
        alert('Unable to fetch location!')
    });
});
