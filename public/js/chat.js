var socket = io();

function scrollToBottom(){
    //Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    
    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}

//Called when user connects
socket.on('connect', function() {
    var params = jQuery.deparam(window.location.search);
    
    socket.emit('join', params, function(err){
        if(err){
            alert(err);
            window.location.href = '/';
        }else{
            console.log('no error');
        }
    });
    
});
//Called when user disconnects            
socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('updateUserList', function(users){
    var ol = jQuery('<ol></ol>');
    users.forEach(function(user){
       ol.append(jQuery('<li></li>').text(user));
    });
    
    jQuery('#users').html(ol);
});

//Called when there is a new message from server
socket.on('newMessage', function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    
    jQuery('#messages').append(html);
    scrollToBottom();
});

//Gets location from server and prints out url to user
socket.on('newLocationMessage', function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        createdAt: formattedTime,
        url: message.url
    });
    
    jQuery('#messages').append(html);
    scrollToBottom();
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
