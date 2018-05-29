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
    
    var messageTextBox = jQuery('[name=message]');
    
    //sends message to server
    socket.emit('createMessage', {
        from: 'user',
        text: messageTextBox.val()
    }, function(data){
        messageTextBox.val('');
    });
});

//Gets location of user and sends it to server
var locationButton = jQuery('#send-location');
locationButton.on('click', function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser!');
    }
    
    locationButton.attr('disabled', 'disabled').text('Sending Location...');
    
    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function(){
        locationButton.removeAttr('disabled');
        alert('Unable to fetch location!')
    });
});
